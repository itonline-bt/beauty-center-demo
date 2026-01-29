'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Input, PageHeader, Alert } from '@/components/ui';
import { Settings, Store, MapPin, Phone, Mail, Percent, DollarSign, Save, Wallet, Coins, RotateCcw, Edit2, Check, X } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { settings, updateSettings } = useDataStore();
  const { locale, availableCurrencies, getCurrencyConfig, exchangeRates, updateExchangeRate, resetExchangeRates } = useI18n();
  
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState('');
  const [rateSaved, setRateSaved] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { setForm(settings); }, [settings]);
  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const startEditRate = (curr: string) => {
    setEditingRate(curr);
    setRateValue(String(exchangeRates[curr as keyof typeof exchangeRates]));
  };

  const saveRate = (curr: string) => {
    const rate = parseFloat(rateValue);
    if (!isNaN(rate) && rate > 0) {
      updateExchangeRate(curr as any, rate);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
    }
    setEditingRate(null);
  };

  const cancelEditRate = () => {
    setEditingRate(null);
    setRateValue('');
  };

  const handleResetRates = () => {
    if (confirm(locale === 'lo' ? 'ຕ້ອງການຣີເຊັດອັດຕາແລກປ່ຽນເປັນຄ່າເລີ່ມຕົ້ນບໍ?' : 'Reset exchange rates to default values?')) {
      resetExchangeRates();
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn max-w-3xl">
        <PageHeader title={locale === 'lo' ? 'ຕັ້ງຄ່າລະບົບ' : 'System Settings'} subtitle={locale === 'lo' ? 'ຕັ້ງຄ່າຂໍ້ມູນຮ້ານ ແລະ ລະບົບ' : 'Configure shop information and system'} />

        {saved && <Alert variant="success" title={locale === 'lo' ? 'ບັນທຶກສຳເລັດ!' : 'Settings saved!'}>{locale === 'lo' ? 'ການຕັ້ງຄ່າຖືກບັນທຶກແລ້ວ' : 'Your settings have been saved successfully'}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><Store className="w-5 h-5 text-rose-600" /></div>
              <div><h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ຂໍ້ມູນຮ້ານ' : 'Shop Information'}</h2><p className="text-sm text-gray-500">{locale === 'lo' ? 'ຕັ້ງຄ່າຊື່ ແລະ ຂໍ້ມູນຕິດຕໍ່ຮ້ານ' : 'Configure shop name and contact'}</p></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={`${locale === 'lo' ? 'ຊື່ຮ້ານ' : 'Shop Name'} (EN)`} value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} icon={<Store className="w-5 h-5" />} />
                <Input label={`${locale === 'lo' ? 'ຊື່ຮ້ານ' : 'Shop Name'} (ລາວ)`} value={form.shop_name_lo} onChange={(e) => setForm({ ...form, shop_name_lo: e.target.value })} icon={<Store className="w-5 h-5" />} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ທີ່ຢູ່' : 'Address'} (EN)</label>
                  <div className="relative"><MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg resize-none" rows={2} /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ທີ່ຢູ່' : 'Address'} (ລາວ)</label>
                  <div className="relative"><MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><textarea value={form.address_lo} onChange={(e) => setForm({ ...form, address_lo: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg resize-none" rows={2} /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={locale === 'lo' ? 'ເບີໂທລະສັບ' : 'Phone'} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} icon={<Phone className="w-5 h-5" />} />
                <Input label={locale === 'lo' ? 'ອີເມວ' : 'Email'} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<Mail className="w-5 h-5" />} />
              </div>
            </div>
          </Card>

          {/* Financial Settings */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
              <div><h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ຕັ້ງຄ່າການເງິນ' : 'Financial Settings'}</h2><p className="text-sm text-gray-500">{locale === 'lo' ? 'ສະກຸນເງິນ, ອາກອນ ແລະ ມັດຈຳ' : 'Currency, tax and deposit'}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ສະກຸນເງິນຫຼັກ' : 'Base Currency'}</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg">
                  <option value="LAK">LAK - ກີບລາວ</option><option value="THB">THB - ບາດ</option><option value="USD">USD - ໂດລາ</option><option value="CNY">CNY - ຢວນ</option>
                </select>
              </div>
              <Input label={`${locale === 'lo' ? 'ອັດຕາອາກອນ' : 'Tax Rate'} (%)`} type="number" value={String(form.tax_rate)} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} icon={<Percent className="w-5 h-5" />} min={0} max={100} />
              <Input label={`${locale === 'lo' ? 'ມັດຈຳເລີ່ມຕົ້ນ' : 'Default Deposit'} (%)`} type="number" value={String(form.deposit_percentage || 30)} onChange={(e) => setForm({ ...form, deposit_percentage: Number(e.target.value) })} icon={<Wallet className="w-5 h-5" />} min={0} max={100} />
            </div>
          </Card>

          {/* Exchange Rates - Editable */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Coins className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ອັດຕາແລກປ່ຽນ' : 'Exchange Rates'}</h2>
                  <p className="text-sm text-gray-500">{locale === 'lo' ? 'ກົດແກ້ໄຂເພື່ອປ່ຽນອັດຕາ (ອີງໃສ່ກີບ)' : 'Click edit to change rates (based on LAK)'}</p>
                </div>
              </div>
              <Button type="button" variant="secondary" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={handleResetRates}>
                {locale === 'lo' ? 'ຣີເຊັດ' : 'Reset'}
              </Button>
            </div>

            {rateSaved && <Alert variant="success" className="mb-4">{locale === 'lo' ? 'ອັດຕາແລກປ່ຽນຖືກບັນທຶກແລ້ວ' : 'Exchange rate saved'}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCurrencies.map((curr) => {
                const config = getCurrencyConfig(curr);
                const isEditing = editingRate === curr;
                const isLAK = curr === 'LAK';
                
                return (
                  <div key={curr} className={`p-4 rounded-xl border-2 transition-all ${isEditing ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.symbol}</span>
                        <div>
                          <span className="font-bold text-gray-900">{curr}</span>
                          <p className="text-xs text-gray-500">{locale === 'lo' ? config.name_lo : config.name}</p>
                        </div>
                      </div>
                      {!isLAK && !isEditing && (
                        <button type="button" onClick={() => startEditRate(curr)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">1 {curr} =</span>
                            <input
                              type="number"
                              value={rateValue}
                              onChange={(e) => setRateValue(e.target.value)}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              min="0"
                              step="0.01"
                              autoFocus
                            />
                            <span className="text-sm text-gray-500 ml-2">LAK</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => saveRate(curr)} className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-600">
                          <Check className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={cancelEditRate} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-purple-600 font-medium">
                          1 {curr} = <span className="text-lg font-bold">{exchangeRates[curr].toLocaleString()}</span> LAK
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>💡 {locale === 'lo' ? 'ໝາຍເຫດ' : 'Note'}:</strong> {locale === 'lo' 
                  ? 'ອັດຕາແລກປ່ຽນຈະຖືກໃຊ້ໃນການແປງລາຄາໃນທົ່ວລະບົບ. ກະລຸນາອັບເດດອັດຕາຕາມຕະຫຼາດປະຈຳວັນ.'
                  : 'Exchange rates are used for price conversion throughout the system. Please update rates according to daily market rates.'}
              </p>
            </div>
          </Card>

          <div className="flex justify-end"><Button type="submit" icon={<Save className="w-5 h-5" />} className="px-8">{locale === 'lo' ? 'ບັນທຶກການຕັ້ງຄ່າ' : 'Save Settings'}</Button></div>
        </form>

        {/* Reset Data Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-red-500" />
            {locale === 'lo' ? 'ລ້າງຂໍ້ມູນ' : 'Reset Data'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {locale === 'lo' 
              ? 'ລ້າງຂໍ້ມູນທັງໝົດ ແລະ ເລີ່ມຕົ້ນໃໝ່ດ້ວຍຂໍ້ມູນ Demo. ນີ້ຈະແກ້ໄຂບັນຫາຂໍ້ມູນບໍ່ແສດງ.'
              : 'Clear all data and start fresh with Demo data. This fixes display issues with inventory.'}
          </p>
          <Button 
            variant="danger" 
            onClick={() => {
              if (confirm(locale === 'lo' ? 'ຕ້ອງການລ້າງຂໍ້ມູນທັງໝົດແທ້ບໍ?' : 'Are you sure you want to reset all data?')) {
                localStorage.removeItem('demo-data-storage');
                localStorage.removeItem('branch-storage');
                window.location.reload();
              }
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {locale === 'lo' ? 'ລ້າງຂໍ້ມູນ ແລະ ໂຫຼດໃໝ່' : 'Reset Data & Reload'}
          </Button>
        </Card>

        <Card className="bg-gray-50">
          <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-700">Beauty Center Demo</p><p className="text-xs text-gray-500">Version 1.4.0 • Multi-Branch Support</p></div></div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
