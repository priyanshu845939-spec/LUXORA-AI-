import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db, initDatabase } from './server/db.js';
import { requireAuth, requireAdmin, generateToken, AuthRequest } from './server/auth.js';
import {
  createRazorpayOrder,
  verifyAndFulfillPayment,
  getRazorpayKeyId,
  isSandboxMode,
  isRazorpayConfigured,
  getPaymentGatewayMode,
} from './server/razorpay.js';
import { planWebsitePrompt } from './server/generator.js';
import { buildMultiPageProject } from './server/multipageBuilder.js';
import { generateVideoScript, refineVideoScript } from './server/scripts.js';

dotenv.config();

// Initialize persistent SQLite database
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to get GoogleGenAI client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/* ==========================================================================
   0. HEALTH CHECK
   ========================================================================== */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'LUXORA AI Engine', time: Date.now() });
});

/* ==========================================================================
   1. AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Sign Up
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    const now = Date.now();
    const isOwner = cleanEmail === 'priyanshu845939@gmail.com' || cleanEmail === 'admin@luxora.ai';
    const role = isOwner ? 'admin' : 'user';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, provider, free_generations_used, credits, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'email', 0, ?, ?, ?)
    `).run(
      userId,
      cleanEmail,
      passwordHash,
      name ? name.trim() : cleanEmail.split('@')[0],
      role,
      isOwner ? 9999 : 0,
      now,
      now
    );

    const token = generateToken({ id: userId, email: cleanEmail, role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: name ? name.trim() : cleanEmail.split('@')[0],
        role,
        freeGenerationsUsed: 0,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: 5,
        credits: isOwner ? 9999 : 0,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, email, password_hash, name, role, free_generations_used, credits, avatar_url
      FROM users WHERE email = ?
    `).get(cleanEmail) as any;

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const activeSub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        freeGenerationsUsed: user.free_generations_used,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: Math.max(0, 5 - user.free_generations_used),
        credits: user.credits,
        subscription: activeSub || null,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Auth Configuration status
app.get('/api/auth/config', (req: Request, res: Response) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || null;
  res.json({
    googleConfigured: Boolean(googleClientId),
    googleClientId: googleClientId || null,
  });
});

// Google Sign-In / OAuth (Real verification against Google Tokeninfo)
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        error: 'Missing Google ID token credential. Real Google authentication requires a verified token.',
      });
    }

    // Cryptographic validation via Google's tokeninfo API
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const googleRes = await fetch(verifyUrl);

    if (!googleRes.ok) {
      return res.status(401).json({
        error: 'Invalid Google authentication token. Verification failed with Google servers.',
      });
    }

    const payload: any = await googleRes.json();
    if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
      return res.status(401).json({ error: 'Google email is unverified or missing.' });
    }

    // If GOOGLE_CLIENT_ID is configured, enforce matching audience
    const configuredClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
      return res.status(401).json({ error: 'Token audience does not match configured Google Client ID.' });
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
    const now = Date.now();

    if (!user) {
      const userId = `usr_g_${Math.random().toString(36).substring(2, 10)}`;
      const isOwner = cleanEmail === 'priyanshu845939@gmail.com' || cleanEmail === 'admin@luxora.ai';
      const role = isOwner ? 'admin' : 'user';

      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, avatar_url, role, provider, free_generations_used, credits, created_at, updated_at)
        VALUES (?, ?, NULL, ?, ?, ?, 'google', 0, ?, ?, ?)
      `).run(
        userId,
        cleanEmail,
        payload.name || cleanEmail.split('@')[0],
        payload.picture || null,
        role,
        isOwner ? 9999 : 0,
        now,
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else if (payload.picture && !user.avatar_url) {
      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(payload.picture, user.id);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const activeSub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        freeGenerationsUsed: user.free_generations_used,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: Math.max(0, 5 - user.free_generations_used),
        credits: user.credits,
        subscription: activeSub || null,
      },
    });
  } catch (error: any) {
    console.error('Google auth verification error:', error);
    res.status(500).json({ error: error.message || 'Google authentication failed' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      // Don't leak existence, return success message
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been generated.',
      });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?').run(
      resetToken,
      expiry,
      user.id
    );

    res.json({
      success: true,
      message: 'Password reset token generated. In a production SMTP setup this would be sent to your inbox.',
      resetToken, // Provided directly for immediate testability
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Request failed' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Token and new password (min 6 characters) are required.' });
    }

    const now = Date.now();
    const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?').get(token, now) as any;

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = ? WHERE id = ?').run(
      newHash,
      now,
      user.id
    );

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Password reset failed' });
  }
});

// Get Current User Profile & Entitlements
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, free_generations_used, credits, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(req.user!.id) as any;

    const activeSub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(req.user!.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        freeGenerationsUsed: user.free_generations_used,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: Math.max(0, 5 - user.free_generations_used),
        credits: user.credits,
        createdAt: user.created_at,
        subscription: activeSub || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.put('/api/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const userId = req.user!.id;
    const now = Date.now();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (newPassword) {
      if (user.password_hash) {
        if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password_hash)) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const newHash = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    }

    db.prepare('UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE id = ?').run(
      name ? name.trim() : null,
      avatarUrl || null,
      now,
      userId
    );

    const updated = db.prepare('SELECT id, email, name, role, free_generations_used, credits, avatar_url FROM users WHERE id = ?').get(userId) as any;

    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatarUrl: updated.avatar_url,
        freeGenerationsUsed: updated.free_generations_used,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: Math.max(0, 5 - updated.free_generations_used),
        credits: updated.credits,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   2. SUBSCRIPTIONS & CREDIT SYSTEM ENDPOINTS
   ========================================================================== */

// Get available subscription plans
app.get('/api/subscriptions/plans', (req: Request, res: Response) => {
  try {
    const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1').all() as any[];
    const parsed = plans.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      priceMonthly: p.price_monthly,
      priceYearly: p.price_yearly,
      creditsMonthly: p.credits_monthly,
      creditsYearly: p.credits_yearly,
      features: JSON.parse(p.features || '[]'),
      highlighted: Boolean(p.highlighted),
    }));

    res.json({ success: true, plans: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user credit history & ledger
app.get('/api/credits/history', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const txns = db.prepare(`
      SELECT id, amount, type, description, reference_id, balance_after, created_at
      FROM credit_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.user!.id);

    const user = db.prepare('SELECT credits, free_generations_used FROM users WHERE id = ?').get(req.user!.id) as any;

    res.json({
      success: true,
      currentCredits: user.credits,
      freeGenerationsRemaining: Math.max(0, 5 - user.free_generations_used),
      transactions: txns,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel active subscription
app.post('/api/subscriptions/cancel', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(userId) as any;

    if (!sub) {
      return res.status(404).json({ error: 'No active subscription found to cancel.' });
    }

    db.prepare('UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE id = ?').run(
      Date.now(),
      sub.id
    );

    res.json({
      success: true,
      message: 'Subscription will cancel at the end of the current billing period.',
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   3. PAYMENT GATEWAY (RAZORPAY) ENDPOINTS
   ========================================================================== */

// Get Razorpay gateway status and configuration
app.get('/api/payments/config', (req: Request, res: Response) => {
  const configured = isRazorpayConfigured();
  const mode = getPaymentGatewayMode(); // 'live' | 'test' | 'development'

  res.json({
    configured,
    mode,
    keyId: getRazorpayKeyId(),
    currency: 'INR',
    isSandbox: isSandboxMode(),
    message: configured
      ? mode === 'test'
        ? 'Razorpay Test Sandbox Active (Valid credentials configured)'
        : 'Razorpay Live Production Active (Valid credentials configured)'
      : 'Development Mode: Razorpay credentials are not configured. Real payments and credit purchases are disabled. Users can use their 5 included Free Website Generations to test all features.',
  });
});

// Create payment order
app.post('/api/payments/create-order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        error:
          'Payment gateway is in development mode. Real payments and credit purchases are disabled until valid server-side Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are configured. All website building features can be tested using your 5 included Free Website Generations.',
        code: 'PAYMENTS_DISABLED_DEV_MODE',
      });
    }

    const { planId, billingCycle = 'monthly' } = req.body;

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId) as any;
    if (!plan) {
      return res.status(400).json({ error: 'Selected plan does not exist.' });
    }

    const isYearly = billingCycle === 'yearly';
    const amount = isYearly ? plan.price_yearly : plan.price_monthly;
    const creditsToGrant = isYearly ? plan.credits_yearly : plan.credits_monthly;

    const orderData = await createRazorpayOrder({
      amountInRupees: amount,
      userId: req.user!.id,
      planId,
      billingCycle,
      creditsToGrant,
    });

    res.json({
      success: true,
      ...orderData,
      planName: plan.name,
      creditsToGrant,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment order' });
  }
});

// Verify payment signature
app.post('/api/payments/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        error:
          'Payment verification failed: Razorpay gateway is in development mode without server credentials. Real payments and credit granting are disabled until credentials are configured. Fake payments and granting credits without verified payment are strictly prohibited.',
        code: 'PAYMENTS_DISABLED_DEV_MODE',
      });
    }

    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Order ID, Payment ID, and cryptographic Signature are required.' });
    }

    const result = verifyAndFulfillPayment({
      orderId,
      paymentId,
      signature,
      userId: req.user!.id,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(400).json({ error: error.message || 'Payment verification failed' });
  }
});

// Payment history
app.get('/api/payments/history', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const payments = db.prepare(`
      SELECT id, order_id, payment_id, amount, currency, status, plan_id, billing_cycle, credits_to_grant, created_at
      FROM payments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user!.id);

    res.json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   4. USER PROJECTS (PER-USER ISOLATION)
   ========================================================================== */

// Get user's projects
app.get('/api/projects', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, name, description, category, style, palette, files, cover_image, generation_count, created_at, updated_at
      FROM projects
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(req.user!.id) as any[];

    const projects = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      style: r.style,
      palette: JSON.parse(r.palette || '{}'),
      files: JSON.parse(r.files || '{}'),
      coverImage: r.cover_image,
      generationCount: r.generation_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save / update project
app.post('/api/projects', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { id, name, description, category, style, palette, files, coverImage } = req.body;
    const userId = req.user!.id;
    const now = Date.now();

    const projId = id || `proj_${Math.random().toString(36).substring(2, 9)}`;

    const existing = db.prepare('SELECT id, user_id FROM projects WHERE id = ?').get(projId) as any;
    if (existing && existing.user_id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to modify this project.' });
    }

    if (existing) {
      db.prepare(`
        UPDATE projects
        SET name = ?, description = ?, category = ?, style = ?, palette = ?, files = ?, cover_image = COALESCE(?, cover_image), updated_at = ?
        WHERE id = ?
      `).run(
        name,
        description,
        category,
        style,
        JSON.stringify(palette),
        JSON.stringify(files),
        coverImage || null,
        now,
        projId
      );
    } else {
      db.prepare(`
        INSERT INTO projects (id, user_id, name, description, category, style, palette, files, cover_image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        projId,
        userId,
        name,
        description,
        category,
        style,
        JSON.stringify(palette),
        JSON.stringify(files),
        coverImage || null,
        now,
        now
      );
    }

    res.json({ success: true, projectId: projId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate project
app.post('/api/projects/:id/duplicate', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const original = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(
      req.params.id,
      req.user!.id
    ) as any;

    if (!original) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const newId = `proj_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO projects (id, user_id, name, description, category, style, palette, files, cover_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      req.user!.id,
      `${original.name} (Copy)`,
      original.description,
      original.category,
      original.style,
      original.palette,
      original.files,
      original.cover_image,
      now,
      now
    );

    res.json({ success: true, newProjectId: newId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const project = db.prepare('SELECT user_id FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this project.' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   5. AI GENERATION & REFINEMENT WITH ATOMIC DEDUCTION RULES
   ========================================================================== */

// Check AI Engine Status
app.get('/api/status', (req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  const hasGemini = Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY');
  const hasDeepseek = Boolean(deepseekKey && deepseekKey !== 'MY_DEEPSEEK_API_KEY');

  res.json({
    status: 'ok',
    providers: {
      gemini: {
        available: hasGemini,
        model: 'gemini-3.8-flash',
        label: 'Google Gemini 3.8 Flash (Official SDK)',
      },
      deepseek: {
        available: hasDeepseek,
        model: 'deepseek-chat',
        label: 'DeepSeek V3 / R1 (API)',
      },
      demo: {
        available: true,
        model: 'luxora-synthesis-v2',
        label: 'Luxora Synthesis Engine (Demo Mode)',
      },
    },
    defaultProvider: hasGemini ? 'gemini' : 'demo',
  });
});

// AI Generation endpoint (Strictly protected by authentication & entitlement rules)
app.post('/api/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user!.id;

  try {
    const {
      prompt,
      category = 'Business website',
      style = 'Luxury',
      palette = {
        name: 'Luxora Midnight',
        bg: '#030407',
        surface: '#0A0D14',
        accent: '#D4FF24',
        text: '#F5F7FF',
        secondaryText: '#9299AB',
      },
      businessName = '',
      targetAudience = '',
      requirements = '',
      provider = 'auto',
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 8) {
      return res.status(400).json({
        error: 'Please provide a descriptive prompt for your website (minimum 8 characters).',
      });
    }

    // 1. Check user entitlement: 5 Free Generations or Paid Credits
    const user = db.prepare('SELECT free_generations_used, credits, role FROM users WHERE id = ?').get(userId) as any;
    const isFreeAvailable = user.free_generations_used < 5;
    const hasEnoughCredits = user.credits >= 10;
    const isAdmin = user.role === 'admin';

    if (!isFreeAvailable && !hasEnoughCredits && !isAdmin) {
      return res.status(402).json({
        error: 'You have used all 5 of your free website generations. Please upgrade to a paid plan or purchase credits to continue building.',
        code: 'CREDITS_EXHAUSTED',
        freeGenerationsUsed: user.free_generations_used,
        availableCredits: user.credits,
      });
    }

    const ai = getGeminiClient();
    const useGemini = (provider === 'gemini' || provider === 'auto') && ai !== null;
    let generatedData: any = null;
    let usedProvider = 'demo';
    let isDemo = false;

    if (useGemini && ai) {
      const systemInstruction = `You are LUXORA AI, an elite website design architect and full-stack software engineer.
Generate a complete, modern, responsive website project based on the prompt.
- Background: ${palette.bg || '#030407'}
- Surface: ${palette.surface || '#0A0D14'}
- Accent: ${palette.accent || '#D4FF24'}
- Category: ${category}
- Style: ${style}
${businessName ? `- Brand: ${businessName}` : ''}
${targetAudience ? `- Audience: ${targetAudience}` : ''}
${requirements ? `- Specific Features: ${requirements}` : ''}

You MUST return valid JSON:
{
  "projectName": "Title",
  "tagline": "Subtitle",
  "category": "${category}",
  "style": "${style}",
  "files": {
    "index.html": "<!DOCTYPE html>...",
    "src/App.tsx": "...",
    "src/styles.css": "...",
    "package.json": "...",
    "README.md": "..."
  }
}
The index.html MUST be a self-contained HTML5 file with Tailwind CDN (<script src="https://cdn.tailwindcss.com"></script>), Google Fonts (Space Grotesk & Inter), complete header, hero, interactive components, and footer with working JS.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create a complete website for: "${prompt}".`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const text = response.text || '';
        generatedData = JSON.parse(text);
        usedProvider = 'gemini';
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to synthesis:', geminiError?.message || geminiError);
      }
    }

    if (!generatedData) {
      generatedData = generateSynthesizedProject({
        prompt,
        category,
        style,
        palette,
        businessName,
        targetAudience,
        requirements,
      });
      usedProvider = 'demo';
      isDemo = true;
    }

    // 2. ATOMIC DEDUCTION (Only upon success!)
    const durationMs = Date.now() - startTime;
    const logId = `gen_${Math.random().toString(36).substring(2, 10)}`;
    const newProjectId = `proj_${Math.random().toString(36).substring(2, 9)}`;

    const atomicDeduct = db.transaction(() => {
      let wasFree = 0;
      let creditDeducted = 0;

      if (isFreeAvailable) {
        wasFree = 1;
        db.prepare('UPDATE users SET free_generations_used = free_generations_used + 1, updated_at = ? WHERE id = ?').run(
          Date.now(),
          userId
        );
      } else if (!isAdmin) {
        creditDeducted = 10;
        const newBalance = user.credits - 10;
        db.prepare('UPDATE users SET credits = ?, updated_at = ? WHERE id = ?').run(newBalance, Date.now(), userId);

        const txnId = `ctxn_${Math.random().toString(36).substring(2, 9)}`;
        db.prepare(`
          INSERT INTO credit_transactions (id, user_id, amount, type, description, reference_id, balance_after, created_at)
          VALUES (?, ?, -10, 'generation_deduct', ?, ?, ?, ?)
        `).run(
          txnId,
          userId,
          `Generated website: "${generatedData.projectName || 'New Project'}"`,
          newProjectId,
          newBalance,
          Date.now()
        );
      }

      // Save project into database
      db.prepare(`
        INSERT INTO projects (id, user_id, name, description, category, style, palette, files, cover_image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
      `).run(
        newProjectId,
        userId,
        generatedData.projectName || businessName || 'Luxora Website',
        prompt,
        category,
        style,
        JSON.stringify(palette),
        JSON.stringify(generatedData.files),
        Date.now(),
        Date.now()
      );

      // Log generation
      db.prepare(`
        INSERT INTO generation_logs (
          id, user_id, project_id, prompt, category, style, model, provider,
          status, credit_deducted, was_free_generation, duration_ms, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'success', ?, ?, ?, ?)
      `).run(
        logId,
        userId,
        newProjectId,
        prompt,
        category,
        style,
        usedProvider === 'gemini' ? 'gemini-3.8-flash' : 'luxora-synthesis-v2',
        usedProvider,
        creditDeducted,
        wasFree,
        durationMs,
        Date.now()
      );
    });

    atomicDeduct();

    // Fetch updated user stats
    const updatedUser = db.prepare('SELECT free_generations_used, credits FROM users WHERE id = ?').get(userId) as any;

    return res.json({
      success: true,
      provider: usedProvider,
      isDemo,
      projectId: newProjectId,
      data: generatedData,
      entitlements: {
        freeGenerationsUsed: updatedUser.free_generations_used,
        freeGenerationsTotal: 5,
        freeGenerationsRemaining: Math.max(0, 5 - updatedUser.free_generations_used),
        credits: updatedUser.credits,
      },
    });
  } catch (error: any) {
    console.error('Generation failure:', error);

    // Record failure in generation_logs (NEVER DEDUCTING CREDITS)
    db.prepare(`
      INSERT INTO generation_logs (
        id, user_id, prompt, model, provider, status, credit_deducted, was_free_generation, error_message, duration_ms, created_at
      ) VALUES (?, ?, ?, 'gemini-3.8-flash', 'gemini', 'failed', 0, 0, ?, ?, ?)
    `).run(
      `gen_fail_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      req.body.prompt || '',
      error.message || 'Unknown generation failure',
      Date.now() - startTime,
      Date.now()
    );

    res.status(500).json({
      error: error.message || 'Failed to generate website project. No credits were deducted.',
    });
  }
});

// AI Refinement endpoint
app.post('/api/refine', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const { currentFiles, instruction, provider = 'auto', projectId } = req.body;

    if (!instruction || typeof instruction !== 'string' || instruction.trim().length < 3) {
      return res.status(400).json({ error: 'Please specify what you would like to refine.' });
    }

    const user = db.prepare('SELECT credits, role FROM users WHERE id = ?').get(userId) as any;
    const isAdmin = user.role === 'admin';
    const sub = db.prepare("SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'").get(userId);

    // Minor refinements cost 3 credits or active plan
    if (!sub && user.credits < 3 && !isAdmin) {
      return res.status(402).json({
        error: 'Insufficient credits for AI refinement (requires 3 credits or active plan).',
        code: 'CREDITS_EXHAUSTED',
      });
    }

    const ai = getGeminiClient();
    const useGemini = (provider === 'gemini' || provider === 'auto') && ai !== null;
    let refinedData: any = null;

    if (useGemini && ai && currentFiles && currentFiles['index.html']) {
      const systemInstruction = `You are LUXORA AI. Modify the website files according to: "${instruction}".
Return JSON:
{
  "summary": "1 sentence description of changes made",
  "files": {
    "index.html": "<!DOCTYPE html>..."
  }
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Here is the current index.html:\n\`\`\`html\n${currentFiles['index.html']}\n\`\`\`\n\nFollow-up:\n"${instruction}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });
        const text = response.text || '';
        refinedData = JSON.parse(text);
      } catch (err) {
        console.warn('Gemini refine error, falling back:', err);
      }
    }

    if (!refinedData) {
      // Fallback synthesizer
      const updatedFiles = { ...currentFiles };
      const html = updatedFiles['index.html'] || '';
      let summary = `Applied modification: "${instruction}"`;
      let modifiedHtml = html;

      const lower = instruction.toLowerCase();
      if (lower.includes('blue') || lower.includes('cobalt')) {
        modifiedHtml = modifiedHtml.replaceAll('#D4FF24', '#1558C9').replaceAll('#d4ff24', '#1558C9');
        summary = 'Changed primary accent to Electric Cobalt Blue (#1558C9)';
      } else if (lower.includes('lime') || lower.includes('green')) {
        modifiedHtml = modifiedHtml.replaceAll('#1558C9', '#D4FF24');
        summary = 'Changed primary accent to Acid Lime (#D4FF24)';
      }

      updatedFiles['index.html'] = modifiedHtml;
      refinedData = { summary, files: updatedFiles };
    }

    // Atomic credit deduction (3 credits) if not admin
    if (!isAdmin && user.credits >= 3) {
      db.prepare('UPDATE users SET credits = credits - 3 WHERE id = ?').run(userId);
      db.prepare(`
        INSERT INTO credit_transactions (id, user_id, amount, type, description, reference_id, balance_after, created_at)
        VALUES (?, ?, -3, 'refine_deduct', ?, ?, ?, ?)
      `).run(
        `ctxn_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        `AI Refinement: "${instruction.slice(0, 30)}..."`,
        projectId || null,
        user.credits - 3,
        Date.now()
      );
    }

    res.json({
      success: true,
      data: refinedData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Refinement failed' });
  }
});

/* ==========================================================================
   6. ADMIN DASHBOARD ENDPOINTS (PROTECTED BY ROLE)
   ========================================================================== */

// Admin statistics
app.get('/api/admin/stats', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const activeSubs = (db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get() as any).count;
    const totalProjects = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as any).count;
    const totalGenerations = (db.prepare("SELECT COUNT(*) as count FROM generation_logs WHERE status = 'success'").get() as any).count;
    const totalRevenuePaise = (db.prepare("SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE status = 'captured'").get() as any).sum;

    const recentLogs = db.prepare(`
      SELECT g.id, g.prompt, g.model, g.status, g.duration_ms, g.created_at, u.email as user_email
      FROM generation_logs g
      LEFT JOIN users u ON g.user_id = u.id
      ORDER BY g.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions: activeSubs,
        totalProjects,
        totalGenerations,
        totalRevenueRupees: Math.round(totalRevenuePaise / 100),
      },
      recentLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin list users
app.get('/api/admin/users', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.provider, u.free_generations_used, u.credits, u.created_at,
             s.plan_name, s.status as subscription_status,
             (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as project_count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      ORDER BY u.created_at DESC
      LIMIT 100
    `).all();

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin credit adjustment
app.post('/api/admin/users/:id/adjust-credits', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { amount, reason } = req.body;
    const targetUserId = req.params.id;

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid numerical credit amount is required.' });
    }

    const targetUser = db.prepare('SELECT credits, email FROM users WHERE id = ?').get(targetUserId) as any;
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newCredits = Math.max(0, targetUser.credits + amount);
    const now = Date.now();

    db.prepare('UPDATE users SET credits = ?, updated_at = ? WHERE id = ?').run(newCredits, now, targetUserId);

    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, description, reference_id, balance_after, created_at)
      VALUES (?, ?, ?, 'admin_adjustment', ?, ?, ?, ?)
    `).run(
      `ctxn_${Math.random().toString(36).substring(2, 9)}`,
      targetUserId,
      amount,
      reason || 'Administrative credit allocation',
      req.user!.id,
      newCredits,
      now
    );

    res.json({
      success: true,
      message: `Adjusted credits for ${targetUser.email} to ${newCredits}.`,
      newCredits,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin change user role
app.put('/api/admin/users/:id/role', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, Date.now(), req.params.id);
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin transactions
app.get('/api/admin/transactions', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const payments = db.prepare(`
      SELECT p.id, p.order_id, p.payment_id, p.amount, p.currency, p.status, p.plan_id, p.created_at, u.email as user_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `).all();

    res.json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin AI settings
app.get('/api/admin/ai-settings', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const settings = db.prepare('SELECT key, value FROM admin_settings').all() as any[];
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    res.json({
      success: true,
      settings: map,
      env: {
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
        hasDeepseekKey: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'MY_DEEPSEEK_API_KEY'),
        hasRazorpayKey: Boolean(process.env.RAZORPAY_KEY_ID),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update AI settings
app.post('/api/admin/ai-settings', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { primaryModel, secondaryModel, freeLimit, creditCostGenerate, creditCostRefine } = req.body;
    const now = Date.now();
    const update = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, ?)');

    if (primaryModel) update.run('primary_ai_model', primaryModel, now);
    if (secondaryModel) update.run('secondary_ai_model', secondaryModel, now);
    if (freeLimit) update.run('free_limit', String(freeLimit), now);
    if (creditCostGenerate) update.run('credit_cost_generate', String(creditCostGenerate), now);
    if (creditCostRefine) update.run('credit_cost_refine', String(creditCostRefine), now);

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   7. HELPER: SYNTHESIZED PROJECT GENERATOR
   ========================================================================== */

function generateSynthesizedProject(params: {
  prompt: string;
  category: string;
  style: string;
  palette: any;
  businessName: string;
  targetAudience: string;
  requirements: string;
}) {
  const { prompt, category, style, palette, businessName } = params;
  const brand = businessName.trim() || deriveBrandName(prompt, category);
  const accent = palette.accent || '#D4FF24';
  const bg = palette.bg || '#030407';
  const card = palette.surface || '#0A0D14';
  const text = palette.text || '#F5F7FF';
  const textMuted = palette.secondaryText || '#9299AB';

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} — ${style} ${category}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandBg: '${bg}',
            brandCard: '${card}',
            brandAccent: '${accent}',
            brandText: '${text}',
            brandMuted: '${textMuted}',
            brandCobalt: '#1558C9',
          },
          fontFamily: {
            heading: ['Space Grotesk', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: ${bg}; color: ${text}; font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, .font-heading { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-brandBg text-brandText antialiased selection:bg-brandAccent selection:text-brandBg min-h-screen flex flex-col justify-between">
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-brandBg/80 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
      <a href="#" class="flex items-center gap-2 text-xl font-bold tracking-tight font-heading">
        <span class="w-2.5 h-2.5 rounded-full bg-brandAccent inline-block"></span>
        <span>${brand}</span>
      </a>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-brandMuted">
        <a href="#overview" class="hover:text-brandText transition">Overview</a>
        <a href="#features" class="hover:text-brandText transition">Capabilities</a>
        <a href="#pricing" class="hover:text-brandText transition">Pricing</a>
      </nav>
      <button onclick="alert('Inquiry submitted.')" class="px-5 py-2.5 text-xs font-semibold rounded-lg bg-brandAccent text-brandBg hover:opacity-90 transition">
        Get Started
      </button>
    </div>
  </header>

  <main class="flex-grow">
    <section id="overview" class="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center relative">
      <div class="max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-brandAccent mb-6">
          <span>${style.toUpperCase()} • ${category.toUpperCase()}</span>
        </div>
        <h1 class="text-4xl sm:text-6xl font-bold font-heading mb-6 tracking-tight">
          Engineered for <span class="text-brandAccent">Visionaries</span>
        </h1>
        <p class="text-base sm:text-lg text-brandMuted max-w-2xl mx-auto mb-10 leading-relaxed">
          ${prompt.slice(0, 180)}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button onclick="alert('Demo action triggered')" class="px-8 py-3.5 rounded-lg bg-brandAccent text-brandBg font-semibold text-sm hover:opacity-90 transition">
            Initiate Project
          </button>
        </div>
      </div>
    </section>

    <section id="features" class="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl bg-brandCard border border-white/10">
          <h3 class="text-lg font-bold font-heading mb-2">Sub-second Latency</h3>
          <p class="text-xs text-brandMuted">Engineered for instantaneous response times and zero visual layout shifts.</p>
        </div>
        <div class="p-8 rounded-2xl bg-brandCard border border-white/10">
          <h3 class="text-lg font-bold font-heading mb-2">Hardened Security</h3>
          <p class="text-xs text-brandMuted">Zero client key leakage, atomic database transactions, and cryptographic verification.</p>
        </div>
        <div class="p-8 rounded-2xl bg-brandCard border border-white/10">
          <h3 class="text-lg font-bold font-heading mb-2">Export Ready</h3>
          <p class="text-xs text-brandMuted">One-click clean ZIP download containing full Vite + React 19 source code.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t border-white/10 py-10 px-6 text-center text-xs text-brandMuted">
    <p>© 2026 ${brand}. Generated by LUXORA AI.</p>
  </footer>
</body>
</html>`;

  const appTsxContent = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#030407] text-[#F5F7FF] font-sans p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold font-heading">${brand}</h1>
        <button className="px-4 py-2 bg-[#D4FF24] text-black text-xs font-semibold rounded">Contact</button>
      </header>
      <main className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-5xl font-bold mb-6">${brand}</h2>
        <p className="text-gray-400 max-w-xl mx-auto">${prompt}</p>
      </main>
    </div>
  );
}`;

  const stylesCssContent = `@import "tailwindcss";

body {
  background-color: ${bg};
  color: ${text};
}
`;

  const packageJsonContent = JSON.stringify(
    {
      name: brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vite build',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        tailwindcss: '^4.0.0',
        typescript: '^5.0.0',
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  const readmeContent = `# ${brand}\n\nBuilt with **LUXORA AI**.\n\n\`\`\`bash\nnpm install\nnpm run dev\nnpm run build\n\`\`\``;

  return {
    projectName: brand,
    tagline: `${style} ${category}`,
    category,
    style,
    palette,
    files: {
      'index.html': htmlContent,
      'src/App.tsx': appTsxContent,
      'src/styles.css': stylesCssContent,
      'package.json': packageJsonContent,
      'README.md': readmeContent,
    },
  };
}

function deriveBrandName(prompt: string, category: string): string {
  const words = prompt.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words[0].length > 3) {
    return `${capitalize(words[0])} ${capitalize(words[1])}`;
  }
  const prefixMap: Record<string, string> = {
    Portfolio: 'Aura Studio',
    'Business website': 'Vanguard Systems',
    'Digital marketing agency': 'Nova Digital',
    'E-commerce storefront': 'Luminaire Objects',
    'SaaS landing page': 'Krona Cloud',
    'Real estate': 'Vanguard Estates',
    Restaurant: 'Nox Dining',
  };
  return prefixMap[category] || 'Luxora Project';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* ==========================================================================
   8. VITE MIDDLEWARE & SERVER STARTUP
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`LUXORA AI Production Server active on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
