import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { apiCreatePaymentOrder, apiVerifyPayment, apiFetchPaymentConfig } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Building2,
  Smartphone,
  Lock,
  Info,
  Sliders,
} from 'lucide-react';

interface RazorpayCheckoutModalProps {
  plan: SubscriptionPlan | null;
  billingCycle: 'monthly' | 'yearly';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAdmin?: () => void;
  onOpenCreateProject?: () => void;
}

interface PaymentGatewayConfig {
  configured: boolean;
  mode: 'live' | 'test' | 'development';
  keyId: string | null;
  currency: string;
  isSandbox: boolean;
  message?: string;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  plan,
  billingCycle,
  isOpen,
  onClose,
  onSuccess,
  onOpenAdmin,
  onOpenCreateProject,
}) => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>({
    configured: false,
    mode: 'development',
    keyId: null,
    currency: 'INR',
    isSandbox: true,
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setErrorDetails(null);
      setLoadingConfig(true);

      apiFetchPaymentConfig()
        .then((cfg) => {
          setGatewayConfig(cfg);
          setLoadingConfig(false);
        })
        .catch(() => {
          setGatewayConfig({
            configured: false,
            mode: 'development',
            keyId: null,
            currency: 'INR',
            isSandbox: true,
          });
          setLoadingConfig(false);
        });
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const priceRupees = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const credits = billingCycle === 'yearly' ? plan.creditsYearly : plan.creditsMonthly;

  // Real Razorpay Standard Checkout launch
  const handleLaunchRazorpay = async () => {
    if (!gatewayConfig.configured) {
      setErrorDetails(
        'Payment gateway is in development mode. Real payments are paused until valid server-side Razorpay credentials are provided.'
      );
      return;
    }

    setStep('processing');
    setErrorDetails(null);

    try {
      // 1. Create order on backend with official Razorpay SDK
      const order = await apiCreatePaymentOrder(plan.id, billingCycle);

      // 2. Ensure Razorpay checkout.js script is loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
          document.body.appendChild(script);
        });
      }

      // 3. Configure Razorpay modal options
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'LUXORA AI',
        description: `${plan.name} (${billingCycle} subscription)`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#D4FF24',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Strictly verify HMAC signature on backend
            const verifyRes = await apiVerifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              await refreshProfile();
              setStep('success');
              onSuccess();
            } else {
              setStep('failed');
              setErrorDetails(verifyRes.message || 'Signature verification could not be validated.');
            }
          } catch (vErr: any) {
            setStep('failed');
            setErrorDetails(vErr.message || 'Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setStep('checkout');
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      setStep('failed');
      setErrorDetails(err.message || 'Failed to initiate Razorpay order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0D14] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 text-left shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'checkout' && (
          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  gatewayConfig.configured
                    ? gatewayConfig.mode === 'live'
                      ? 'bg-green-400'
                      : 'bg-[#1558C9]'
                    : 'bg-amber-400 animate-pulse'
                }`}
              ></span>
              <span className="text-[11px] font-mono text-[#9299AB] uppercase tracking-wider">
                {gatewayConfig.configured
                  ? gatewayConfig.mode === 'live'
                    ? 'Razorpay Live Production'
                    : 'Razorpay Sandbox (Test Mode)'
                  : 'Test / Development Mode'}
              </span>
            </div>

            <h2 className="text-2xl font-bold font-heading text-white">Activate {plan.name}</h2>
            <p className="text-xs text-[#9299AB] mt-1 mb-6">
              {gatewayConfig.configured
                ? 'Instant activation with UPI, Debit/Credit Cards, or Net Banking.'
                : 'Razorpay payment gateway is optional and currently running in development mode.'}
            </p>

            {/* Plan summary badge */}
            <div className="p-4 rounded-xl bg-[#101521] border border-white/10 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Total Investment ({billingCycle})</span>
                <div className="text-3xl font-bold font-heading text-[#D4FF24] mt-0.5 tabular-nums">
                  ₹{priceRupees.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Credits Granted</span>
                <span className="px-2.5 py-1 rounded bg-[#D4FF24]/10 text-[#D4FF24] font-mono text-xs font-bold">
                  +{credits} AI Credits
                </span>
              </div>
            </div>

            {/* GATEWAY STATE 1: DEVELOPMENT MODE (CREDENTIALS NOT CONFIGURED) */}
            {!gatewayConfig.configured && (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold font-mono text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Real Payments Disabled in Development Mode</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Razorpay server credentials (<code className="text-amber-300 font-mono">RAZORPAY_KEY_ID</code> &amp;{' '}
                    <code className="text-amber-300 font-mono">RAZORPAY_KEY_SECRET</code>) are not configured in the
                    environment. Real payments and credit purchases are disabled until valid credentials are added.
                  </p>
                  <div className="pt-1 text-[11px] text-gray-400 flex items-start gap-1.5 border-t border-amber-500/20">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Security Policy:</strong> Paid credits are never faked without verified payment.
                      You have <strong>5 Free Website Generations</strong> included to test full generation and preview features.
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Payments Disabled (Awaiting Razorpay Keys)</span>
                  </button>

                  {onOpenCreateProject && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreateProject();
                      }}
                      className="w-full py-3 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,255,36,0.25)]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Test with 5 Free Generations Included</span>
                    </button>
                  )}

                  {user?.role === 'admin' && onOpenAdmin && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#101521] border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#D4FF24]" />
                      <span>Admin Console: Manually Adjust Test Credits</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* GATEWAY STATE 2: CONFIGURED (TEST OR LIVE MODE) */}
            {gatewayConfig.configured && (
              <div className="space-y-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4FF24] shrink-0" />
                  <span>
                    {gatewayConfig.mode === 'test'
                      ? 'Razorpay Sandbox Test Gateway: Uses verified HMAC signatures.'
                      : 'Razorpay Live Production Gateway: 256-bit SSL encrypted.'}
                  </span>
                </div>

                <button
                  onClick={handleLaunchRazorpay}
                  className="w-full py-3.5 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition shadow-[0_0_20px_-4px_rgba(212,255,36,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Razorpay Checkout (₹{priceRupees.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-2 border-[#1558C9]/40 border-t-[#D4FF24] animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold font-heading text-white">Communicating with Razorpay</h3>
            <p className="text-xs text-[#9299AB] max-w-xs mx-auto leading-relaxed">
              Verifying cryptographic HMAC-SHA256 signature with Razorpay and fulfilling your subscription ledger...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#D4FF24]/20 text-[#D4FF24] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(212,255,36,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-white">Subscription Activated!</h3>
            <p className="text-xs text-[#9299AB] max-w-sm mx-auto leading-relaxed">
              Thank you! <strong className="text-white">₹{priceRupees.toLocaleString('en-IN')}</strong> was captured with
              verified cryptographic signature. We've added{' '}
              <strong className="text-[#D4FF24]">+{credits} AI credits</strong> to your account.
            </p>

            <div className="p-3.5 rounded-xl bg-[#101521] border border-white/10 text-xs text-left max-w-xs mx-auto font-mono text-gray-300">
              <div>Plan: {plan.name}</div>
              <div>Billing: {billingCycle}</div>
              <div className="text-green-400">Status: Active (Auto-renewal)</div>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition cursor-pointer"
              >
                Go to Builder Workspace
              </button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white">Payment Request Declined</h3>
            <p className="text-xs text-red-400 max-w-sm mx-auto leading-relaxed">
              {errorDetails || 'Payment authorization was rejected. No funds were captured and zero credits were added.'}
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              {gatewayConfig.configured && (
                <button
                  onClick={() => setStep('checkout')}
                  className="px-5 py-2 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Payment</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
