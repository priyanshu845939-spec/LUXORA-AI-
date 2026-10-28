import {
  UserProfile,
  SubscriptionPlan,
  CreditTransaction,
  PaymentRecord,
  WebsiteProject,
  GeneratorRequest,
  ProjectFiles,
  WebsitePlan,
  VideoScript,
} from '../types';

const TOKEN_KEY = 'luxora_auth_token_v2';

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ================= AUTHENTICATION API ================= */

export async function apiSignup(data: { email: string; password?: string; name?: string }) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Signup failed');
  if (json.token) setAuthToken(json.token);
  return json;
}

export async function apiLogin(data: { email: string; password?: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  if (json.token) setAuthToken(json.token);
  return json;
}

export async function apiFetchAuthConfig(): Promise<{ googleClientId: string | null }> {
  try {
    const res = await fetch('/api/auth/config');
    if (!res.ok) return { googleClientId: null };
    return await res.json();
  } catch {
    return { googleClientId: null };
  }
}

export async function apiGoogleLogin(credential: string) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Google authentication failed');
  if (json.token) setAuthToken(json.token);
  return json;
}


export async function apiForgotPassword(email: string) {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Forgot password failed');
  return json;
}

export async function apiResetPassword(data: { token: string; newPassword?: string }) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Reset password failed');
  return json;
}

export async function apiGetMe(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch('/api/auth/me', { headers: authHeaders() });
  if (!res.ok) {
    removeAuthToken();
    return null;
  }
  const json = await res.json();
  return json.user;
}

export async function apiUpdateProfile(data: any): Promise<UserProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Update profile failed');
  return json.user;
}

/* ================= SUBSCRIPTIONS & CREDITS API ================= */

export async function apiFetchPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch('/api/subscriptions/plans');
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch plans');
  return json.plans;
}

export async function apiFetchCreditHistory(): Promise<{
  currentCredits: number;
  freeGenerationsRemaining: number;
  transactions: CreditTransaction[];
}> {
  const res = await fetch('/api/credits/history', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch credit history');
  return json;
}

export async function apiCancelSubscription() {
  const res = await fetch('/api/subscriptions/cancel', {
    method: 'POST',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to cancel subscription');
  return json;
}

/* ================= PAYMENTS (RAZORPAY) API ================= */

export async function apiFetchPaymentConfig() {
  const res = await fetch('/api/payments/config');
  return await res.json();
}

export async function apiCreatePaymentOrder(planId: string, billingCycle: 'monthly' | 'yearly') {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ planId, billingCycle }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create payment order');
  return json;
}

export async function apiVerifyPayment(data: {
  orderId: string;
  paymentId: string;
  signature?: string;
}) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Payment verification failed');
  return json;
}

export async function apiFetchPaymentHistory(): Promise<PaymentRecord[]> {
  const res = await fetch('/api/payments/history', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch payment history');
  return json.payments;
}

/* ================= PROJECTS API ================= */

export async function apiFetchProjects(): Promise<WebsiteProject[]> {
  const res = await fetch('/api/projects', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch projects');
  return json.projects;
}

export async function apiSaveProject(project: WebsiteProject) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save project');
  return json;
}

export async function apiDuplicateProject(id: string) {
  const res = await fetch(`/api/projects/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to duplicate project');
  return json;
}

export async function apiDeleteProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete project');
  return json;
}

/* ================= AI GENERATION & REFINE API ================= */

export async function apiGenerateWebsite(req: GeneratorRequest) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(req),
  });
  const json = await res.json();
  if (!res.ok) {
    const error: any = new Error(json.error || 'Generation failed');
    error.code = json.code;
    error.freeGenerationsUsed = json.freeGenerationsUsed;
    throw error;
  }
  return json;
}

export async function apiRefineWebsite(data: {
  currentFiles: ProjectFiles;
  instruction: string;
  projectId?: string;
}) {
  const res = await fetch('/api/refine', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const error: any = new Error(json.error || 'Refinement failed');
    error.code = json.code;
    throw error;
  }
  return json;
}

export async function apiFetchStatus() {
  const res = await fetch('/api/status');
  return await res.json();
}

/* ================= ADMIN API ================= */

export async function apiFetchAdminStats() {
  const res = await fetch('/api/admin/stats', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Admin stats failed');
  return json;
}

export async function apiFetchAdminUsers() {
  const res = await fetch('/api/admin/users', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Admin users failed');
  return json.users;
}

export async function apiAdjustCredits(userId: string, amount: number, reason: string) {
  const res = await fetch(`/api/admin/users/${userId}/adjust-credits`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount, reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Adjust credits failed');
  return json;
}

export async function apiUpdateUserRole(userId: string, role: string) {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Update role failed');
  return json;
}

export async function apiFetchAdminTransactions() {
  const res = await fetch('/api/admin/transactions', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Admin transactions failed');
  return json.payments;
}

export async function apiFetchAdminAiSettings() {
  const res = await fetch('/api/admin/ai-settings', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Admin settings failed');
  return json;
}

export async function apiSaveAdminAiSettings(data: any) {
  const res = await fetch('/api/admin/ai-settings', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Save settings failed');
  return json;
}

/* ================= MULTI-PAGE GENERATOR PLANNING API ================= */

export async function apiPlanWebsite(data: {
  prompt: string;
  category: string;
  style: string;
  businessName?: string;
  location?: string;
}): Promise<WebsitePlan> {
  const res = await fetch('/api/generator/plan', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Website planning failed');
  return json.plan;
}

/* ================= AI SCRIPT STUDIO API ================= */

export async function apiGenerateScript(data: {
  topic: string;
  platform: string;
  duration: string;
  language: string;
  tone: string;
  targetAudience?: string;
  projectId?: string;
}): Promise<VideoScript> {
  const res = await fetch('/api/scripts/generate', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Script generation failed');
  return json.script;
}

export async function apiRefineScript(data: {
  script: VideoScript;
  action: 'regenerate-hook' | 'make-professional' | 'shorten' | 'translate';
  targetLanguage?: string;
}): Promise<VideoScript> {
  const res = await fetch('/api/scripts/refine', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Script refinement failed');
  return json.script;
}

export async function apiFetchUserScripts(): Promise<VideoScript[]> {
  const res = await fetch('/api/scripts', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch scripts');
  return json.scripts;
}

export async function apiSaveScript(script: VideoScript) {
  const res = await fetch('/api/scripts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ script }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save script');
  return json;
}

