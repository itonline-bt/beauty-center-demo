'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useBranchStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import { Building2, MapPin, Phone, ChevronRight, LogOut, Shield, Settings } from 'lucide-react';

export default function SelectBranchPage() {
  const router = useRouter();
  const { user, isAuthenticated, setCurrentBranch, logout } = useAuthStore();
  const { getUserBranches } = useBranchStore();
  const { locale } = useI18n();
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.role === 'admin';
  const availableBranches = getUserBranches(user.id, isAdmin);

  const handleSelectBranch = (branch: any) => {
    setCurrentBranch(branch);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Beauty Center</h1>
              <p className="text-xs text-gray-500">
                {locale === 'lo' ? 'ສະບາຍດີ' : 'Welcome'}, {user.full_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => router.push('/branches')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                {locale === 'lo' ? 'ຈັດການສາຂາ' : 'Manage'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {locale === 'lo' ? 'ອອກຈາກລະບົບ' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'lo' ? 'ເລືອກສາຂາ' : 'Select Branch'}
          </h1>
          <p className="text-gray-500">
            {locale === 'lo' 
              ? 'ກະລຸນາເລືອກສາຂາທີ່ຕ້ອງການເຂົ້າໃຊ້ງານ' 
              : 'Please select the branch you want to access'}
          </p>
          {isAdmin && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              {locale === 'lo' ? 'ທ່ານມີສິດເຂົ້າເຖິງທຸກສາຂາ' : 'You have access to all branches'}
            </div>
          )}
        </div>

        {/* Branch List */}
        {availableBranches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">
              {locale === 'lo' ? 'ບໍ່ມີສາຂາທີ່ສາມາດເຂົ້າເຖິງໄດ້' : 'No branches available'}
            </p>
            <p className="text-sm text-gray-400">
              {locale === 'lo' ? 'ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບ' : 'Please contact administrator'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {availableBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                onMouseEnter={() => setHoveredBranch(branch.id)}
                onMouseLeave={() => setHoveredBranch(null)}
                className={`w-full bg-white rounded-2xl p-6 text-left transition-all duration-300 ${
                  hoveredBranch === branch.id 
                    ? 'shadow-xl shadow-rose-100 scale-[1.02] border-rose-200' 
                    : 'shadow-sm hover:shadow-md border-transparent'
                } border-2`}
              >
                <div className="flex items-center gap-4">
                  {/* Branch Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    hoveredBranch === branch.id 
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white' 
                      : 'bg-rose-100 text-rose-600'
                  }`}>
                    <Building2 className="w-7 h-7" />
                  </div>

                  {/* Branch Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {locale === 'lo' ? branch.name : branch.name_en}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {branch.code}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {branch.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {branch.phone}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    hoveredBranch === branch.id 
                      ? 'bg-rose-500 text-white translate-x-1' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-8">
          {locale === 'lo' 
            ? `ທ່ານສາມາດເຂົ້າເຖິງ ${availableBranches.length} ສາຂາ` 
            : `You have access to ${availableBranches.length} branch(es)`}
        </p>
      </div>
    </div>
  );
}
