import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from './db.js';

/**
 * Determine if Razorpay credentials are fully configured on the server.
 * In development without credentials, integration is optional and real payments are disabled.
 */
export function isRazorpayConfigured(): boolean {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    return false;
  }

  // Filter out documentation placeholders or mock strings
  if (
    keyId.includes('MY_') ||
    keySecret.includes('MY_') ||
    keyId === 'rzp_test_LUXORA2026' ||
    keySecret === 'luxora_razorpay_secret_test_key'
  ) {
    return false;
  }

  return true;
}

/**
 * Returns current payment gateway mode:
 * - 'development': Credentials not configured; real payments and purchases paused.
 * - 'test': Valid Razorpay Test sandbox key (rzp_test_...) configured.
 * - 'live': Valid Razorpay Production live key (rzp_live_...) configured.
 */
export function getPaymentGatewayMode(): 'live' | 'test' | 'development' {
  if (!isRazorpayConfigured()) {
    return 'development';
  }
  const keyId = process.env.RAZORPAY_KEY_ID!.trim();
  return keyId.startsWith('rzp_test_') ? 'test' : 'live';
}

export function getRazorpayKeyId(): string | null {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return process.env.RAZORPAY_KEY_ID!.trim();
}

export function isSandboxMode(): boolean {
  return getPaymentGatewayMode() === 'test';
}

/**
 * Create a real Razorpay Order.
 * When in development mode (credentials not configured), order creation is disabled.
 */
export async function createRazorpayOrder(params: {
  amountInRupees: number;
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  creditsToGrant: number;
}): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  if (!isRazorpayConfigured()) {
    throw new Error(
      'Payment gateway is in development mode. Real payments and credit purchases are disabled until valid server-side Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are configured. Users can test all website building features with their 5 included Free Website Generations.'
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID!.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET!.trim();

  const razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const amountInPaise = Math.round(params.amountInRupees * 100);
  const now = Date.now();

  const order = await razorpayClient.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${params.userId.slice(-6)}_${now}`,
    notes: {
      userId: params.userId,
      planId: params.planId,
      billingCycle: params.billingCycle,
    },
  });

  // Store payment intent in DB
  const paymentIdRecord = `pay_intent_${Math.random().toString(36).substring(2, 10)}`;
  db.prepare(`
    INSERT INTO payments (id, user_id, order_id, amount, currency, status, plan_id, billing_cycle, credits_to_grant, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'created', ?, ?, ?, ?, ?)
  `).run(
    paymentIdRecord,
    params.userId,
    order.id,
    amountInPaise,
    'INR',
    params.planId,
    params.billingCycle,
    params.creditsToGrant,
    now,
    now
  );

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: keyId,
  };
}

/**
 * Verify cryptographic payment signature and activate subscription & credits.
 * Never fakes payment or grants credits without authentic cryptographic verification against RAZORPAY_KEY_SECRET.
 */
export function verifyAndFulfillPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
}): {
  success: boolean;
  message: string;
  subscription?: any;
  newCredits?: number;
} {
  if (!isRazorpayConfigured()) {
    throw new Error(
      'Payment verification failed: Razorpay payment gateway is in development mode without server credentials. Real payments and credit granting are disabled until server credentials are configured. Fake payments and granting credits without verified payment are strictly prohibited.'
    );
  }

  if (!params.orderId || !params.paymentId || !params.signature) {
    throw new Error('Payment verification requires orderId, paymentId, and signature.');
  }

  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? AND user_id = ?').get(
    params.orderId,
    params.userId
  ) as any;

  if (!payment) {
    throw new Error('Payment record for this order was not found.');
  }

  if (payment.status === 'captured') {
    // Already fulfilled (idempotent)
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(params.userId) as any;
    const sub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'").get(params.userId);
    return {
      success: true,
      message: 'Payment already processed and activated.',
      subscription: sub,
      newCredits: user?.credits || 0,
    };
  }

  // Strict cryptographic HMAC-SHA256 signature verification
  const keySecret = process.env.RAZORPAY_KEY_SECRET!.trim();
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  const isValid = expectedSignature === params.signature;

  if (!isValid) {
    db.prepare("UPDATE payments SET status = 'failed', error_description = 'Invalid signature', updated_at = ? WHERE id = ?").run(
      Date.now(),
      payment.id
    );
    throw new Error('Payment verification failed: Invalid cryptographic signature. No credits were granted.');
  }

  // Execute atomic fulfillment transaction only upon verified signature
  const executeFulfillment = db.transaction(() => {
    const now = Date.now();
    const periodDuration = payment.billing_cycle === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const periodEnd = now + periodDuration;

    // 1. Update payment record to captured
    db.prepare(`
      UPDATE payments
      SET status = 'captured', payment_id = ?, signature = ?, updated_at = ?
      WHERE id = ?
    `).run(params.paymentId, params.signature, now, payment.id);

    // 2. Fetch plan details
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(payment.plan_id) as any;
    const planName = plan ? plan.name : 'Custom Plan';

    // 3. Upsert user subscription
    const existingSub = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(params.userId) as any;
    const subId = existingSub ? existingSub.id : `sub_${Math.random().toString(36).substring(2, 9)}`;

    if (existingSub) {
      db.prepare(`
        UPDATE subscriptions
        SET plan_id = ?, plan_name = ?, status = 'active', billing_cycle = ?, amount = ?,
            credits_per_cycle = ?, current_period_start = ?, current_period_end = ?,
            cancel_at_period_end = 0, updated_at = ?
        WHERE id = ?
      `).run(
        payment.plan_id,
        planName,
        payment.billing_cycle,
        payment.amount,
        payment.credits_to_grant,
        now,
        periodEnd,
        now,
        subId
      );
    } else {
      db.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan_id, plan_name, status, billing_cycle, amount,
          credits_per_cycle, current_period_start, current_period_end,
          cancel_at_period_end, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, 0, ?, ?)
      `).run(
        subId,
        params.userId,
        payment.plan_id,
        planName,
        payment.billing_cycle,
        payment.amount,
        payment.credits_to_grant,
        now,
        periodEnd,
        now,
        now
      );
    }

    // 4. Atomically credit the user's account
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(params.userId) as any;
    const newCreditBalance = (user?.credits || 0) + payment.credits_to_grant;

    db.prepare('UPDATE users SET credits = ?, updated_at = ? WHERE id = ?').run(
      newCreditBalance,
      now,
      params.userId
    );

    // 5. Record credit ledger transaction
    const txnId = `ctxn_${Math.random().toString(36).substring(2, 9)}`;
    db.prepare(`
      INSERT INTO credit_transactions (
        id, user_id, amount, type, description, reference_id, balance_after, created_at
      ) VALUES (?, ?, ?, 'subscription_credit', ?, ?, ?, ?)
    `).run(
      txnId,
      params.userId,
      payment.credits_to_grant,
      `Purchased ${planName} (${payment.billing_cycle})`,
      payment.id,
      newCreditBalance,
      now
    );

    const updatedSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
    return {
      sub: updatedSub,
      newCredits: newCreditBalance,
    };
  });

  const result = executeFulfillment();

  return {
    success: true,
    message: 'Subscription successfully activated and verified credits added.',
    subscription: result.sub,
    newCredits: result.newCredits,
  };
}
