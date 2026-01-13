'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Input, PageHeader, Alert } from '@/components/ui';
import { Settings, Store, MapPin, Phone, Mail, Percent, DollarSign, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { settings, updateSettings } = useDataStore();
  const { locale } = useI18n();
  
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { setForm(settings); }, [settings]);

  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn max-w-3xl">
        <PageHeader
          title={locale === 'lo' ? 'ຕັ້ງຄ່າລະບົບ' : 'System Settings'}
          subtitle={locale === 'lo' ? 'ຕັ້ງຄ່າຂໍ້ມູນຮ້ານ ແລະ ລະບົບ' : 'Configure shop information and system'}
        />

        {saved && (
          <Alert variant="success" title={locale === 'lo' ? 'ບັນທຶກສຳເລັດ!' : 'Settings saved!'}>
            {locale === 'lo' ? 'ການຕັ້ງຄ່າຖືກບັນທຶກແລ້ວ' : 'Your settings have been saved successfully'}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ຂໍ້ມູນຮ້ານ' : 'Shop Information'}</h2>
                <p className="text-sm text-gray-500">{locale === 'lo' ? 'ຕັ້ງຄ່າຊື່ ແລະ ຂໍ້ມູນຕິດຕໍ່ຮ້ານ' : 'Configure shop name and contact'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${locale === 'lo' ? 'ຊື່ຮ້ານ' : 'Shop Name'} (EN)`}
                  value={form.shop_name}
                  onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                  icon={<Store className="w-5 h-5" />}
                />
                <Input
                  label={`${locale === 'lo' ? 'ຊື່ຮ້ານ' : 'Shop Name'} (ລາວ)`}
                  value={form.shop_name_lo}
                  onChange={(e) => setForm({ ...form, shop_name_lo: e.target.value })}
                  icon={<Store className="w-5 h-5" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ທີ່ຢູ່' : 'Address'} (EN)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ທີ່ຢູ່' : 'Address'} (ລາວ)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={form.address_lo}
                      onChange={(e) => setForm({ ...form, address_lo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={locale === 'lo' ? 'ເບີໂທລະສັບ' : 'Phone'}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label={locale === 'lo' ? 'ອີເມວ' : 'Email'}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
              </div>
            </div>
          </Card>

          {/* Financial Settings */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ຕັ້ງຄ່າການເງິນ' : 'Financial Settings'}</h2>
                <p className="text-sm text-gray-500">{locale === 'lo' ? 'ສະກຸນເງິນ ແລະ ອັດຕາອາກອນ' : 'Currency and tax rate'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ສະກຸນເງິນ' : 'Currency'}</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg"
                >
                  <option value="LAK">LAK - ກີບລາວ</option>
                  <option value="THB">THB - Thai Baht</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <Input
                label={`${locale === 'lo' ? 'ອັດຕາອາກອນ' : 'Tax Rate'} (%)`}
                type="number"
                value={String(form.tax_rate)}
                onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })}
                icon={<Percent className="w-5 h-5" />}
                min={0}
                max={100}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" icon={<Save className="w-5 h-5" />} className="px-8">
              {locale === 'lo' ? 'ບັນທຶກການຕັ້ງຄ່າ' : 'Save Settings'}
            </Button>
          </div>
        </form>

        {/* App Info */}
        <Card className="bg-gray-50">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Beauty Center Demo</p>
              <p className="text-xs text-gray-500">Version 1.0.0 • Frontend-only demo with localStorage</p>
            </div>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
