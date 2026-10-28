import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { apiFetchPlans, apiFetchPaymentConfig } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanForCheckout: (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlanForCheckout,
}) => {
  const { user, openAuthModal } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [gatewayConfig, setGatewayConfig] = useState<any>({ configured: false, mode: 'development' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        apiFetchPlans().catch(() => []),
        apiFetchPaymentConfig().catch(() => ({ configured: false, mode: 'development' })),
      ]).then(([p, cfg]) => {
        setPlans(p);
        setGatewayConfig(cfg);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (plan: SubscriptionPlan) => {
    if (!user) {
      onClose();
      openAuthModal('signup');
      return;
    }
    onSelectPlanForCheckout(plan, billingCycle);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0D14] border border-white/15 rounded-3xl max-w-5xl w-full p-6 sm:p-10 text-left shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-[#D4FF24] mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>INSTANT AI CREDITS &amp; UNLIMITED EXPORTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
            Choose Your Building Velocity
          </h2>
          <p className="text-xs sm:text-sm text-[#9299AB] mt-2">
            Every new account starts with 5 free generations. Upgrade to unlock autonomous follow-up code edits and high-volume inference.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-[#101521] border border-white/10 mt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-[#030407] text-[#D4FF24]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-[#030407] text-[#D4FF24]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] bg-[#D4FF24]/20 text-[#D4FF24] px-1.5 py-0.5 rounded font-mono font-bold">
                -20%
              </span>
            </button>
          </div>

          {/* Gateway Status Badge */}
          <div className="mt-4 flex items-center justify-center">
            {gatewayConfig.configured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1558C9]"></span>
                <span>{gatewayConfig.mode === 'test' ? 'Razorpay Test Sandbox Active' : 'Razorpay Production Gateway'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Test / Development Mode: Real Payments Paused (5 Free Generations Included)</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const credits = billingCycle === 'yearly' ? plan.creditsYearly : plan.creditsMonthly;

            return (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 rounded-2xl bg-[#07090F] border flex flex-col justify-between relative ${
                  plan.highlighted
                    ? 'border-[#D4FF24] shadow-[0_0_35px_-5px_rgba(212,255,36,0.25)]'
                    : 'border-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#D4FF24] text-[#030407] text-[10px] font-bold uppercase tracking-wider font-mono">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-[#9299AB] uppercase tracking-wider font-mono">
                    {plan.name}
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-heading text-white mt-3 tabular-nums">
                    ₹{price.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      / {billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Credits pill */}
                  <div className="mt-2 mb-6">
                    <span className="text-xs font-mono font-bold text-[#D4FF24] bg-[#D4FF24]/10 border border-[#D4FF24]/20 px-2.5 py-1 rounded-md inline-block">
                      +{credits} AI Generation Credits
                    </span>
                  </div>

                  <p className="text-xs text-[#9299AB] mb-6">{plan.tagline}</p>

                  <div className="border-t border-white/5 pt-6 space-y-3">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#D4FF24] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                  <div className="pt-8">
                    <button
                      onClick={() => handleSelect(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      plan.highlighted
                        ? 'bg-[#D4FF24] text-[#030407] hover:opacity-90 shadow-[0_0_15px_rgba(212,255,36,0.3)]'
                        : 'bg-[#101521] border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>
                      {gatewayConfig.configured
                        ? `Activate with Razorpay`
                        : `Select ${plan.name} (Dev Mode)`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Trust Note */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4FF24]" />
            <span>
              {gatewayConfig.configured
                ? '256-Bit SSL Encrypted • Powered by Razorpay INR Gateway'
                : 'Development Mode Active • Verified Payments Enforced • 5 Free Generations Included'}
            </span>
          </div>
          <span>Cancel or switch anytime. Zero hidden fees.</span>
        </div>
      </div>
    </div>
  );
};
