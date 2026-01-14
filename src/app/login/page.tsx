'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, User, Shield, Users } from 'lucide-react';

const demoAccounts = [
  { email: 'admin@demo.com', role: 'admin', icon: Shield, color: 'from-rose-500 to-red-600' },
  { email: 'manager@demo.com', role: 'manager', icon: User, color: 'from-blue-500 to-indigo-600' },
  { email: 'staff@demo.com', role: 'staff', icon: Users, color: 'from-gray-400 to-gray-600' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const { locale, setLocale } = useI18n();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [hydrated, setHydrated] = useState(false);

  // รอ zustand hydrate
  useEffect(() => {
    setHydrated(true);
  }, []);

  // redirect หลัง hydrate เท่านั้น
  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (success) router.push('/dashboard');
    else setError(locale === 'lo' ? 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' : 'Invalid email or password');
    setLoading(false);
  };

  const quickLogin = (account: typeof demoAccounts[0]) => { setEmail(account.email); setPassword('demo123'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 to-pink-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Beauty Center</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">{locale === 'lo' ? 'ລະບົບຈັດການຮ້ານເສີມສວຍ' : 'Beauty Salon Management System'}</h1>
          <p className="text-rose-100 text-lg">{locale === 'lo' ? 'ຈັດການນັດໝາຍ, ລູກຄ້າ, ບໍລິການ, ແລະ ສິນຄ້າຄົງຄັງຢ່າງງ່າຍດາຍ' : 'Easily manage appointments, customers, services, and inventory'}</p>
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[{ icon: '📅', label: locale === 'lo' ? 'ນັດໝາຍ' : 'Appointments' }, { icon: '👥', label: locale === 'lo' ? 'ລູກຄ້າ' : 'Customers' }, { icon: '💅', label: locale === 'lo' ? 'ບໍລິການ' : 'Services' }, { icon: '📦', label: locale === 'lo' ? 'ສິນຄ້າ' : 'Inventory' }].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
                <span className="text-2xl">{item.icon}</span><span className="text-white font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-rose-200 text-sm">© 2025 Beauty Center Demo</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Beauty Center</span>
          </div>

          <div className="flex justify-end mb-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLocale('lo')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${locale === 'lo' ? 'bg-white shadow text-rose-600' : 'text-gray-600'}`}>ລາວ</button>
              <button onClick={() => setLocale('en')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${locale === 'en' ? 'bg-white shadow text-rose-600' : 'text-gray-600'}`}>EN</button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{locale === 'lo' ? 'ເຂົ້າສູ່ລະບົບ' : 'Welcome Back'}</h2>
            <p className="text-gray-500 mt-2">{locale === 'lo' ? 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອດຳເນີນການ' : 'Sign in to continue to your dashboard'}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3 text-center">{locale === 'lo' ? 'ເລືອກບັນຊີທົດລອງ:' : 'Quick login:'}</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((account) => (
                <button key={account.email} onClick={() => quickLogin(account)} className={`p-3 rounded-xl bg-gradient-to-br ${account.color} text-white hover:opacity-90 transition-all hover:scale-105`}>
                  <account.icon className="w-5 h-5 mx-auto mb-1" /><span className="text-xs font-medium capitalize">{account.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">{locale === 'lo' ? 'ຫຼື' : 'or'}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'lo' ? 'ອີເມວ' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" placeholder="email@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'lo' ? 'ລະຫັດຜ່ານ' : 'Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? (locale === 'lo' ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'Signing in...') : (locale === 'lo' ? 'ເຂົ້າສູ່ລະບົບ' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">{locale === 'lo' ? 'ລະຫັດຜ່ານສຳລັບບັນຊີທົດລອງ:' : 'Demo password:'} <code className="bg-gray-100 px-2 py-1 rounded">demo123</code></p>
        </div>
      </div>
    </div>
  );
}
