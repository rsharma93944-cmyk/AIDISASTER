import { useState, FormEvent } from 'react';
import { 
  Lock, Mail, User, MapPin, ArrowRight, 
  AlertCircle, Mountain, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NER_STATES = [
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export default function Register() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredRegion, setPreferredRegion] = useState(NER_STATES[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

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
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the usage agreement for disaster-risk monitoring.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, preferredRegion);
      // Redirect to profile or risk monitoring
      window.history.pushState({}, '', '/profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (_err) {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto flex flex-col items-center justify-center font-sans selection:bg-[#244A36]/20">
      
      {/* Main Register Card */}
      <div className="w-full max-w-lg liquid-glass rounded-3xl border border-white/70 p-7 sm:p-9 shadow-2xl shadow-[#244A36]/10 relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#244A36] via-[#526E48] to-[#C87941]" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 border border-white/80 text-[#244A36] mb-3 shadow-md shadow-[#244A36]/5">
            <Mountain className="w-6 h-6 text-[#244A36]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1C2826] tracking-tight">
            Create Monitor Account
          </h2>
          <p className="text-xs text-[#5E7E67] font-medium mt-1.5 leading-relaxed max-w-sm mx-auto">
            Register for authorized access to geotechnical sensors, early warnings, and AI terrain analysis.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-[#7A2E2E]/10 border border-[#7A2E2E]/25 text-[#7A2E2E] rounded-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Er. Rohit Debnath"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
              Official / Work Email
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

          {/* Preferred Region (8 NER States) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
              Primary Monitoring Region (NER)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={preferredRegion}
                onChange={(e) => setPreferredRegion(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 appearance-none cursor-pointer shadow-inner"
              >
                {NER_STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7E67] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7E67]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl text-sm text-[#1C2826] placeholder-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/40 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#244A36] focus:ring-[#244A36] border-[#244A36]/20 flex-shrink-0 cursor-pointer"
              />
              <span className="text-xs text-[#3A4D43] leading-snug font-medium">
                I agree to use ResQAI for disaster-risk monitoring and early warning purposes across the North Eastern Region.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#244A36] hover:bg-[#1B3828] text-[#FAF7F2] rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#244A36]/25 active:scale-98 transition-all disabled:opacity-50 mt-2 hover:scale-[1.02]"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 pt-5 border-t border-[#244A36]/10 text-center">
          <p className="text-xs text-[#5E7E67] font-medium">
            Already have an account?{' '}
            <button
              type="button"
              onClick={navigateToLogin}
              className="font-bold text-[#244A36] hover:underline"
            >
              Back to Sign In
            </button>
          </p>
        </div>

      </div>

    </div>
  );
}
