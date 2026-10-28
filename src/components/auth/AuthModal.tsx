import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiForgotPassword, apiResetPassword, apiFetchAuthConfig } from '../../services/api';
import { X, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight, Sparkles, Shield, AlertTriangle, Key } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, signup, googleLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Sync mode with prop changes
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMessage(null);
    setGoogleNotice(null);
  }, [authModalMode]);

  // Check backend Google OAuth configuration status
  useEffect(() => {
    apiFetchAuthConfig().then((cfg) => {
      if (cfg?.googleClientId) {
        setGoogleClientId(cfg.googleClientId);
      }
    });
  }, []);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId || !(window as any).google?.accounts?.id) return;
    try {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (res: any) => {
          if (res?.credential) {
            setLoading(true);
            try {
              await googleLogin(res.credential);
            } catch (err: any) {
              setError(err.message || 'Google authentication failed.');
            } finally {
              setLoading(false);
            }
          }
        },
      });

      if (googleBtnRef.current) {
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 380,
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
        });
      }
    } catch (e) {
      console.warn('GIS initialization error:', e);
    }
  }, [googleClientId, mode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setGoogleNotice(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password, name);
      } else if (mode === 'forgot') {
        const res = await apiForgotPassword(email);
        setSuccessMessage(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        const res = await apiResetPassword({ token: resetToken, newPassword });
        setSuccessMessage(res.message);
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'demo' | 'admin' | 'owner') => {
    setError(null);
    setGoogleNotice(null);
    setLoading(true);
    try {
      if (userType === 'admin') {
        await login('admin@luxora.ai', 'AdminPassword123!');
      } else if (userType === 'owner') {
        await login('priyanshu845939@gmail.com', 'LuxoraOwner2026!');
      } else {
        // Quick demo user
        const demoEmail = `creator_${Math.random().toString(36).substring(2, 6)}@luxora.test`;
        await signup(demoEmail, 'DemoPass2026!', 'Creative Founder');
      }
    } catch (err: any) {
      setError(err?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError(null);
    setSuccessMessage(null);

    // If Google OAuth credentials are not configured, inform the user clearly rather than faking login
    if (!googleClientId) {
      setGoogleNotice(
        'Google OAuth Client ID is not configured on this instance. To enable real Google Sign-In, add GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID to your .env file. Real authentication is strictly enforced; please use Email & Password sign-in or the instant accounts below.'
      );
      return;
    }

    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
      } catch (err: any) {
        setError('Could not open Google Sign-In prompt. Please check popup blockers or use email login.');
      }
    } else {
      setGoogleNotice('Google Identity Services SDK is loading. Please try again in a few seconds or use email login.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0D14] border border-white/15 rounded-2xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl relative my-8">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF24] shadow-[0_0_12px_#D4FF24]"></span>
          <span className="font-heading font-bold text-lg text-white">
            LUXORA <span className="text-[#D4FF24]">AI</span>
          </span>
        </div>

        <h2 className="text-2xl font-bold font-heading text-white">
          {mode === 'login' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'reset' && 'Enter new password'}
        </h2>
        <p className="text-xs text-[#9299AB] mt-1 mb-6">
          {mode === 'login' && 'Access your website projects, credits, and AI tools.'}
          {mode === 'signup' && 'Get 5 free full website generations instantly upon registration.'}
          {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          {mode === 'reset' && 'Create a new secure password for your account.'}
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {googleNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-amber-200">Google OAuth Not Configured</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">{googleNotice}</p>
            </div>
          </div>
        )}

        {/* Google Authentication */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="mb-6 space-y-3">
            {googleClientId ? (
              <div className="flex flex-col items-center justify-center">
                <div ref={googleBtnRef} className="min-h-[44px] flex justify-center w-full" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#101521] border border-white/10 hover:border-white/25 text-white font-medium text-xs transition flex items-center justify-center gap-2.5 cursor-pointer hover:bg-white/5 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.95 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[11px] text-gray-500 font-mono">OR EMAIL</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF24] transition"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF24] transition"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#D4FF24] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF24] transition"
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4FF24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 disabled:opacity-40 transition shadow-[0_0_20px_-4px_rgba(212,255,36,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account & Get 5 Free Generations'}
                  {mode === 'forgot' && 'Send Recovery Instructions'}
                  {mode === 'reset' && 'Update Password'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#D4FF24] font-semibold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#D4FF24] font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Development Quick Accounts */}
        <div className="mt-6 pt-4 border-t border-white/5 bg-[#050811] -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl">
          <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500 block mb-2">
            Instant Test Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('demo')}
              className="py-1.5 px-2.5 rounded-lg bg-[#101521] border border-white/10 text-[11px] text-gray-300 hover:text-white hover:border-[#D4FF24]/40 transition text-left flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#D4FF24]" />
              <span>New User (5 Free)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-[#101521] border border-white/10 text-[11px] text-gray-300 hover:text-white hover:border-purple-400/40 transition text-left flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
