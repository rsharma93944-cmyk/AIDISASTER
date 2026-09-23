import { useState, FormEvent } from 'react';
import { 
  Lock, Mail, ArrowRight, Eye, EyeOff, 
  Sparkles, CheckCircle2, AlertCircle, Mountain, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginAsDemo } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Retrieve redirect target from URL query params
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get('redirect') || '/risk-monitoring';

  const handleRedirect = () => {
    window.history.pushState({}, '', redirectTarget);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      handleRedirect();
    } catch (_err) {
      setErrorMessage('Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsDemo();
      handleRedirect();
    } catch (_err) {
      setErrorMessage('Failed to initiate demo session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    window.history.pushState({}, '', '/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto flex flex-col items-center justify-center font-sans selection:bg-[#244A36]/20">
      
      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#1C2826]/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setForgotPasswordModal(false)}
        >
          <div 
            className="liquid-glass-modal border border-white/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#244A36]/10 text-[#244A36] flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2826]">Password Recovery</h3>
                <span className="text-xs text-[#5E7E67] font-medium">Prototype Authentication Flow</span>
              </div>
            </div>

            {resetEmailSent ? (
              <div className="p-4 glass-card rounded-2xl border border-white/70 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#526E48] mx-auto" />
                <h4 className="text-sm font-bold text-[#1C2826]">Recovery Link Dispatched</h4>
                <p className="text-xs text-[#5E7E67] font-medium">
                  A sample password reset link has been dispatched to <strong>{email || 'your email'}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotPasswordModal(false); setResetEmailSent(false); }}
                  className="mt-3 w-full py-2 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#244A36]/20"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-[#3A4D43] font-medium">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  placeholder="name@organization.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-xl text-xs text-[#1C2826] focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 shadow-inner"
                />
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(false)}
                    className="flex-1 py-2.5 glass-button text-[#1C2826] rounded-xl font-bold transition-all hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetEmailSent(true)}
                    className="flex-1 py-2.5 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-xl font-bold transition-all shadow-md shadow-[#244A36]/20 hover:scale-[1.02]"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-md liquid-glass rounded-3xl border border-white/70 p-7 sm:p-9 shadow-2xl shadow-[#244A36]/10 relative overflow-hidden">
        
        {/* Top Decorative Nature Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#244A36] via-[#526E48] to-[#C87941]" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 border border-white/80 text-[#244A36] mb-3 shadow-md shadow-[#244A36]/5">
            <Mountain className="w-6 h-6 text-[#244A36]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C2826] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-[#5E7E67] font-medium mt-1.5 leading-relaxed max-w-xs mx-auto">
            Sign in to monitor landslide risks, alerts and analyses across Northeast India.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-[#7A2E2E]/10 border border-[#7A2E2E]/25 text-[#7A2E2E] rounded-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="officer@disastermgmt.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5E7E67]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-[11px] font-semibold text-[#C87941] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5E7E67] hover:text-[#1C2826]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 cursor-pointer"
              />
              <span className="text-xs font-medium text-[#3A4D43]">Remember my session</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#244A36]/25 active:scale-98 transition-all disabled:opacity-50 mt-2 hover:scale-[1.02]"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#244A36]/10" />
          </div>
          <span className="relative bg-white/90 backdrop-blur-sm px-3 text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] rounded-full">
            Or Quick Access
          </span>
        </div>

        {/* Demo Login Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleDemoLogin}
          className="w-full py-2.5 glass-button text-[#1C2826] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-[#C87941]" />
          <span>Continue as Demo User</span>
        </button>

        {/* Register Link */}
        <div className="mt-6 pt-5 border-t border-[#244A36]/10 text-center">
          <p className="text-xs text-[#5E7E67] font-medium">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={navigateToRegister}
              className="font-bold text-[#244A36] hover:underline"
            >
              Create one
            </button>
          </p>
        </div>

      </div>

      {/* Bottom Environmental Trust Note */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-[#5E7E67] font-medium liquid-glass px-4 py-2 rounded-full border border-white/60 shadow-sm">
        <Compass className="w-3.5 h-3.5 text-[#244A36]" />
        <span>ResQAI Early Warning Platform • SIH Smart India Hackathon</span>
      </div>

    </div>
  );
}
