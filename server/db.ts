import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'luxora.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      provider TEXT NOT NULL DEFAULT 'email',
      free_generations_used INTEGER NOT NULL DEFAULT 0,
      credits INTEGER NOT NULL DEFAULT 0,
      reset_token TEXT,
      reset_token_expiry INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      amount INTEGER NOT NULL,
      credits_per_cycle INTEGER NOT NULL,
      current_period_start INTEGER NOT NULL,
      current_period_end INTEGER NOT NULL,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      razorpay_subscription_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      price_monthly INTEGER NOT NULL,
      price_yearly INTEGER NOT NULL,
      credits_monthly INTEGER NOT NULL,
      credits_yearly INTEGER NOT NULL,
      features TEXT NOT NULL, -- JSON array
      highlighted INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      reference_id TEXT,
      balance_after INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT UNIQUE NOT NULL,
      payment_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'created',
      plan_id TEXT NOT NULL,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      credits_to_grant INTEGER NOT NULL,
      signature TEXT,
      error_description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      style TEXT NOT NULL,
      palette TEXT NOT NULL, -- JSON string
      files TEXT NOT NULL,   -- JSON string
      cover_image TEXT,
      generation_count INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS generation_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      prompt TEXT NOT NULL,
      category TEXT,
      style TEXT,
      model TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      credit_deducted INTEGER NOT NULL DEFAULT 0,
      was_free_generation INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      duration_ms INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_scripts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      platform TEXT NOT NULL,
      duration TEXT NOT NULL,
      language TEXT NOT NULL,
      tone TEXT NOT NULL,
      hook TEXT NOT NULL,
      viral_hooks TEXT NOT NULL,
      scenes TEXT NOT NULL,
      call_to_action TEXT NOT NULL,
      caption_and_hashtags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default plans if not already present
  const planCount = db.prepare('SELECT COUNT(*) as count FROM plans').get() as { count: number };
  if (planCount.count === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO plans (id, name, tagline, price_monthly, price_yearly, credits_monthly, credits_yearly, features, highlighted, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPlan.run(
      'starter',
      'Starter Pro',
      'For creators and independent developers',
      999, // ₹999/mo
      9590, // ₹9,590/yr (~20% off)
      50,
      600,
      JSON.stringify([
        '50 AI Website Credits / month',
        'Unlimited Project Storage',
        'Direct Source ZIP Export (React + Vite)',
        'Full Multi-Device Responsive Testing',
        'Standard Email Support',
      ]),
      0,
      1
    );

    insertPlan.run(
      'pro',
      'Studio Pro',
      'For design agencies and high-velocity teams',
      2499, // ₹2,499/mo
      23990, // ₹23,990/yr
      150,
      1800,
      JSON.stringify([
        '150 AI Website Credits / month',
        'Autonomous Follow-Up AI Code Refinement',
        'Uncapped Source Code ZIP Downloads',
        'Priority Gemini 3.8 Flash SDK Inference',
        'Interactive Component Injection Library',
        'Priority 24/7 Slack & Email Channel',
      ]),
      1,
      1
    );

    insertPlan.run(
      'studio',
      'Enterprise Studio',
      'For enterprises requiring bespoke architectures',
      6999, // ₹6,999/mo
      66990, // ₹66,990/yr
      500,
      6000,
      JSON.stringify([
        '500 AI Website Credits / month',
        'Multi-Page Routing Architecture Engine',
        'DeepSeek & Gemini Hybrid Model Switching',
        'Custom Design System Token Presets',
        'Dedicated Solution Architect Onboarding',
        '99.99% Uptime Guarantee & Custom VPCs',
      ]),
      0,
      1
    );
  }

  // Seed default Super Admin account if not existing
  const adminEmail = 'admin@luxora.ai';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const adminPasswordHash = bcrypt.hashSync('AdminPassword123!', 10);
    const now = Date.now();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, provider, free_generations_used, credits, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_admin_001',
      adminEmail,
      adminPasswordHash,
      'Luxora Administrator',
      'admin',
      'email',
      0,
      99999,
      now,
      now
    );
  }

  // Also make sure user priyanshu845939@gmail.com has admin privileges if they sign in
  const ownerEmail = 'priyanshu845939@gmail.com';
  const existingOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(ownerEmail) as { id: string } | undefined;
  if (!existingOwner) {
    const ownerHash = bcrypt.hashSync('LuxoraOwner2026!', 10);
    const now = Date.now();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, provider, free_generations_used, credits, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_owner_001',
      ownerEmail,
      ownerHash,
      'Priyanshu (Owner)',
      'admin',
      'email',
      0,
      99999,
      now,
      now
    );
  } else {
    // Elevate role to admin if not already
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(ownerEmail);
  }

  // Also seed default Demo User account if not existing
  const demoEmail = 'demo@luxora.ai';
  const existingDemo = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);
  if (!existingDemo) {
    const demoPasswordHash = bcrypt.hashSync('DemoPassword123!', 10);
    const now = Date.now();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, provider, free_generations_used, credits, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr_demo_001',
      demoEmail,
      demoPasswordHash,
      'Alex Mercer (Demo)',
      'user',
      'email',
      1, // 1 of 5 used, 4 remaining
      15, // 15 credits
      now,
      now
    );

    // Add a sample credit ledger entry
    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, description, reference_id, balance_after, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'tx_demo_welcome',
      'usr_demo_001',
      15,
      'bonus',
      'Welcome bonus credits',
      'welcome_bonus',
      15,
      now
    );
  }

  // Seed default admin settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM admin_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, ?)');
    const now = Date.now();
    insertSetting.run('primary_ai_model', 'gemini-3.8-flash', now);
    insertSetting.run('secondary_ai_model', 'deepseek-chat', now);
    insertSetting.run('free_limit', '5', now);
    insertSetting.run('credit_cost_generate', '10', now);
    insertSetting.run('credit_cost_refine', '3', now);
    insertSetting.run('razorpay_mode', 'sandbox', now);
  }
}
