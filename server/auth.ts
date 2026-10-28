import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

// Resolve secure JWT secret strictly on the backend
function getBackendJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }

  // If not configured in environment, retrieve or initialize a persistent 256-bit secret in SQLite
  try {
    const row = db.prepare("SELECT value FROM admin_settings WHERE key = 'server_jwt_secret'").get() as { value: string } | undefined;
    if (row && row.value && row.value.length >= 32) {
      return row.value;
    }

    const generated = crypto.randomBytes(32).toString('hex');
    db.prepare("INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES ('server_jwt_secret', ?, ?)").run(
      generated,
      Date.now()
    );
    return generated;
  } catch (err) {
    // Fallback if db is not ready
    return 'luxora_sec_' + crypto.randomBytes(24).toString('hex');
  }
}

export const getJwtSecret = (): string => getBackendJwtSecret();

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  freeGenerationsUsed: number;
  credits: number;
  avatarUrl?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Generate JWT token
export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

// Authentication middleware
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string };
    const user = db.prepare(`
      SELECT id, email, name, role, free_generations_used, credits, avatar_url
      FROM users WHERE id = ?
    `).get(decoded.id) as {
      id: string;
      email: string;
      name: string;
      role: string;
      free_generations_used: number;
      credits: number;
      avatar_url?: string;
    } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User account not found or has been revoked.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      freeGenerationsUsed: user.free_generations_used,
      credits: user.credits,
      avatarUrl: user.avatar_url,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

// Admin only middleware
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}
