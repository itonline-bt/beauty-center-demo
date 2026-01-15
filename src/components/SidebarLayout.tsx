'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import { LayoutDashboard, Calendar, Users, Scissors, Package, Receipt, UserCog, Settings, Bell, LogOut, Menu, X, ChevronDown, BoxesIcon, Sparkles, User, BarChart3, Wallet, Search } from 'lucide-react';

interface NavItem { href: string; icon: React.ElementType; labelKey: string; labelLo: string; roles?: string[]; }

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'Dashboard', labelLo: 'ໜ້າຫຼັກ' },
  { href: '/appointments', icon: Calendar, labelKey: 'Appointments', labelLo: 'ນັດໝາຍ' },
  { href: '/customers', icon: Users, labelKey: 'Customers', labelLo: 'ລູກຄ້າ' },
  { href: '/services', icon: Scissors, labelKey: 'Services', labelLo: 'ບໍລິການ' },
  { href: '/inventory', icon: Package, labelKey: 'Inventory', labelLo: 'ສິນຄ້າ' },
  { href: '/stock', icon: BoxesIcon, labelKey: 'Stock', labelLo: 'ສະຕັອກ' },
  { href: '/billing', icon: Receipt, labelKey: 'Billing', labelLo: 'ໃບບິນ' },
  { href: '/income-expense', icon: Wallet, labelKey: 'Income/Expense', labelLo: 'ລາຍຮັບ-ຈ່າຍ', roles: ['admin', 'manager'] },
  { href: '/reports', icon: BarChart3, labelKey: 'Reports', labelLo: 'ລາຍງານ', roles: ['admin', 'manager'] },
  { href: '/users', icon: UserCog, labelKey: 'Users', labelLo: 'ຜູ້ໃຊ້', roles: ['admin', 'manager'] },
  { href: '/settings', icon: Settings, labelKey: 'Settings', labelLo: 'ຕັ້ງຄ່າ' },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { notifications } = useDataStore();
  const { locale, setLocale, currency, setCurrency, availableCurrencies, getCurrencyConfig } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const recentNotifs = notifications.slice(0, 5);
  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

  const handleLogout = () => { logout(); router.push('/login'); };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = () => { setShowNotifDropdown(false); setUserMenuOpen(false); };
    if (showNotifDropdown || userMenuOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showNotifDropdown, userMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden lg:flex fixed top-0 left-72 right-0 h-16 bg-white border-b z-20 px-6 items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={locale === 'lo' ? 'ຄົ້ນຫາ...' : 'Search...'} 
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button onClick={() => setLocale('lo')} className={`px-2 py-1 text-xs font-medium rounded transition-all ${locale === 'lo' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>🇱🇦</button>
            <button onClick={() => setLocale('en')} className={`px-2 py-1 text-xs font-medium rounded transition-all ${locale === 'en' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>🇬🇧</button>
          </div>

          {/* Currency Selector */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
            className="px-2 py-1.5 text-xs font-medium bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            {availableCurrencies.map((curr) => {
              const config = getCurrencyConfig(curr);
              return (
                <option key={curr} value={curr}>
                  {config.symbol} {curr}
                </option>
              );
            })}
          </select>

          {/* Notifications */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowNotifDropdown(!showNotifDropdown); }} 
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{locale === 'lo' ? 'ແຈ້ງເຕືອນ' : 'Notifications'}</span>
                  {unreadCount > 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">{unreadCount} {locale === 'lo' ? 'ໃໝ່' : 'new'}</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">{locale === 'lo' ? 'ບໍ່ມີແຈ້ງເຕືອນ' : 'No notifications'}</p>
                    </div>
                  ) : recentNotifs.map(n => (
                    <Link key={n.id} href="/notifications" className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-0 ${!n.is_read ? 'bg-rose-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!n.is_read ? 'bg-rose-500' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {locale === 'lo' ? n.title_lo : n.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{locale === 'lo' ? n.message_lo : n.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/notifications" className="block px-4 py-3 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 border-t">
                  {locale === 'lo' ? 'ເບິ່ງທັງໝົດ' : 'View all'}
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }} 
              className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="px-4 py-3 border-b bg-gray-50">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700">
                  <User className="w-4 h-4" /> {locale === 'lo' ? 'ໂປຣໄຟລ໌' : 'Profile'}
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700">
                  <Settings className="w-4 h-4" /> {locale === 'lo' ? 'ຕັ້ງຄ່າ' : 'Settings'}
                </Link>
                <hr />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600">
                  <LogOut className="w-4 h-4" /> {locale === 'lo' ? 'ອອກຈາກລະບົບ' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 px-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Beauty Center</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => router.push('/notifications')} className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">Beauty Center</span>
                <span className="block text-[10px] text-rose-500 font-medium tracking-wide">DEMO MODE</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{locale === 'lo' ? item.labelLo : item.labelKey}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom User Info (Mobile) */}
          <div className="p-4 border-t lg:hidden">
            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
              <LogOut className="w-4 h-4" /> {locale === 'lo' ? 'ອອກຈາກລະບົບ' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-16">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
