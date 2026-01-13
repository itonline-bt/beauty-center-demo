'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, PageHeader, SearchInput, EmptyState, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Plus, User, Phone, Mail, Edit2, Trash2, Star, Calendar, DollarSign, Users } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { customers, appointments, addCustomer, updateCustomer, deleteCustomer } = useDataStore();
  const { locale, t } = useI18n();
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: 'female', notes: '' });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const filtered = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const stats = useMemo(() => ({
    total: customers.length,
    totalSpent: customers.reduce((s, c) => s + c.total_spent, 0),
    avgSpent: customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.total_spent, 0) / customers.length) : 0,
    vip: customers.filter(c => c.total_visits >= 10).length,
  }), [customers]);

  const getCustomerAppointments = (customerId: number) => {
    return appointments.filter(a => a.customer_id === customerId)
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateCustomer(editItem.id, form);
    } else {
      addCustomer(form);
    }
    closeModal();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, phone: item.phone, email: item.email || '', gender: item.gender, notes: item.notes || '' });
    } else {
      setEditItem(null);
      setForm({ name: '', phone: '', email: '', gender: 'female', notes: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', phone: '', email: '', gender: 'female', notes: '' });
  };

  const openDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={t('customers.title')}
          subtitle={locale === 'lo' ? 'ຈັດການຂໍ້ມູນລູກຄ້າ' : 'Manage customer information'}
          action={
            <Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
              {t('customers.add')}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={locale === 'lo' ? 'ລູກຄ້າທັງໝົດ' : 'Total Customers'}
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title={locale === 'lo' ? 'ລູກຄ້າ VIP' : 'VIP Customers'}
            value={stats.vip}
            icon={<Star className="w-6 h-6" />}
            color="amber"
          />
          <StatCard
            title={locale === 'lo' ? 'ຍອດໃຊ້ຈ່າຍລວມ' : 'Total Spent'}
            value={formatCurrency(stats.totalSpent)}
            icon={<DollarSign className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title={locale === 'lo' ? 'ສະເລ່ຍຕໍ່ຄົນ' : 'Average per Customer'}
            value={formatCurrency(stats.avgSpent)}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <EmptyState
                  icon={<Users className="w-8 h-8" />}
                  title={locale === 'lo' ? 'ບໍ່ພົບລູກຄ້າ' : 'No customers found'}
                  action={<Button onClick={() => openModal()}>{t('customers.add')}</Button>}
                />
              </Card>
            </div>
          ) : (
            filtered.map((customer) => (
              <Card key={customer.id} hover className="cursor-pointer" onClick={() => openDetail(customer)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center gap-2">
                        {customer.total_visits >= 10 && (
                          <Badge variant="warning"><Star className="w-3 h-3 mr-1" />VIP</Badge>
                        )}
                        <span className="text-xs text-gray-500">{customer.total_visits} {locale === 'lo' ? 'ຄັ້ງ' : 'visits'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openModal(customer)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => deleteCustomer(customer.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-gray-500">{locale === 'lo' ? 'ຍອດໃຊ້ຈ່າຍ' : 'Total Spent'}</span>
                  <span className="font-bold text-rose-600">{formatCurrency(customer.total_spent)}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editItem ? t('common.edit') : t('customers.add')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('customers.name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={locale === 'lo' ? 'ຊື່ລູກຄ້າ' : 'Customer name'}
              required
            />
            <Input
              label={t('customers.phone')}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="020 xxxx xxxx"
              required
            />
            <Input
              label={t('customers.email')}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ເພດ' : 'Gender'}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="female" checked={form.gender === 'female'}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })} className="text-rose-500" />
                  <span>{locale === 'lo' ? 'ຍິງ' : 'Female'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value="male" checked={form.gender === 'male'}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })} className="text-rose-500" />
                  <span>{locale === 'lo' ? 'ຊາຍ' : 'Male'}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'lo' ? 'ໝາຍເຫດ' : 'Notes'}</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Customer Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} 
          title={selectedCustomer?.name || ''} size="lg">
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-rose-600">{selectedCustomer.total_visits}</p>
                  <p className="text-sm text-gray-600">{locale === 'lo' ? 'ຄັ້ງ' : 'Visits'}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedCustomer.total_spent)}</p>
                  <p className="text-sm text-gray-600">{locale === 'lo' ? 'ໃຊ້ຈ່າຍ' : 'Spent'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedCustomer.total_visits > 0 ? Math.round(selectedCustomer.total_spent / selectedCustomer.total_visits) : 0)}
                  </p>
                  <p className="text-sm text-gray-600">{locale === 'lo' ? 'ສະເລ່ຍ' : 'Avg'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{locale === 'lo' ? 'ປະຫວັດນັດໝາຍ' : 'Appointment History'}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getCustomerAppointments(selectedCustomer.id).slice(0, 10).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{locale === 'lo' ? apt.service_name_lo : apt.service_name}</p>
                        <p className="text-xs text-gray-500">{apt.appointment_date} • {apt.appointment_time.substring(0, 5)}</p>
                      </div>
                      <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'info'}>
                        {formatCurrency(apt.total_price)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
}
