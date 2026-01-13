'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, SearchInput, StatCard, EmptyState } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Plus, Printer, Eye, DollarSign, Clock, CheckCircle, CreditCard, Banknote, Building } from 'lucide-react';

export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { bills, appointments, customers, services, settings, addTransaction } = useDataStore();
  const { locale } = useI18n();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [form, setForm] = useState({ customer_id: '', services: [] as number[], discount: '0', payment_method: 'cash' });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const filtered = useMemo(() => {
    return bills.filter(b => {
      const matchSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || b.bill_number.includes(search);
      const matchStatus = !statusFilter || b.payment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bills, search, statusFilter]);

  const stats = useMemo(() => ({
    total: bills.length,
    paid: bills.filter(b => b.payment_status === 'paid').length,
    pending: bills.filter(b => b.payment_status === 'pending').length,
    revenue: bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0),
  }), [bills]);

  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const viewBill = (bill: any) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'transfer': return <Building className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={locale === 'lo' ? 'ໃບບິນ' : 'Billing'}
          subtitle={locale === 'lo' ? 'ຈັດການໃບບິນ ແລະ ການຊຳລະເງິນ' : 'Manage invoices and payments'}
          action={
            <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowCreateModal(true)}>
              {locale === 'lo' ? 'ສ້າງໃບບິນໃໝ່' : 'Create Invoice'}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={locale === 'lo' ? 'ໃບບິນທັງໝົດ' : 'Total Invoices'} value={stats.total} icon={<Receipt className="w-6 h-6" />} color="blue" />
          <StatCard title={locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'Paid'} value={stats.paid} icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
          <StatCard title={locale === 'lo' ? 'ລໍຖ້າຊຳລະ' : 'Pending'} value={stats.pending} icon={<Clock className="w-6 h-6" />} color="amber" />
          <StatCard title={locale === 'lo' ? 'ລາຍຮັບທັງໝົດ' : 'Total Revenue'} value={formatCurrency(stats.revenue)} icon={<DollarSign className="w-6 h-6" />} color="rose" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder={locale === 'lo' ? 'ຄົ້ນຫາໃບບິນ...' : 'Search invoices...'} /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-white">
            <option value="">{locale === 'lo' ? 'ທຸກສະຖານະ' : 'All Status'}</option>
            <option value="paid">{locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'Paid'}</option>
            <option value="pending">{locale === 'lo' ? 'ລໍຖ້າຊຳລະ' : 'Pending'}</option>
          </select>
        </div>

        {/* Bills List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState icon={<Receipt className="w-8 h-8" />} title={locale === 'lo' ? 'ບໍ່ພົບໃບບິນ' : 'No invoices found'} />
            </Card>
          ) : filtered.map((bill) => (
            <Card key={bill.id} hover className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-rose-600 font-semibold">{bill.bill_number}</span>
                    <Badge variant={bill.payment_status === 'paid' ? 'success' : 'warning'}>
                      {bill.payment_status === 'paid' ? (locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'Paid') : (locale === 'lo' ? 'ລໍຖ້າ' : 'Pending')}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{bill.customer_name}</p>
                  <p className="text-sm text-gray-500">{bill.created_at}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{locale === 'lo' ? 'ຍອດລວມ' : 'Total'}</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.total_amount)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {getPaymentIcon(bill.payment_method)}
                    <span className="text-sm capitalize">{bill.payment_method}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => viewBill(bill)} className="p-2 hover:bg-gray-100 rounded-lg" title={locale === 'lo' ? 'ເບິ່ງ' : 'View'}>
                      <Eye className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title={locale === 'lo' ? 'ພິມ' : 'Print'}>
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View Bill Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedBill?.bill_number || ''} size="lg">
          {selectedBill && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-rose-600">{settings.shop_name}</h2>
                <p className="text-sm text-gray-500">{settings.address}</p>
                <p className="text-sm text-gray-500">{settings.phone}</p>
              </div>

              {/* Customer Info */}
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{locale === 'lo' ? 'ລູກຄ້າ' : 'Customer'}</p>
                  <p className="font-semibold">{selectedBill.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{locale === 'lo' ? 'ວັນທີ' : 'Date'}</p>
                  <p className="font-semibold">{selectedBill.created_at}</p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">{locale === 'lo' ? 'ລາຍການ' : 'Item'}</th>
                      <th className="px-4 py-2 text-right text-sm">{locale === 'lo' ? 'ຈຳນວນ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3">{locale === 'lo' ? 'ບໍລິການ' : 'Services'}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(selectedBill.subtotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{locale === 'lo' ? 'ຍອດລວມ' : 'Subtotal'}</span>
                  <span>{formatCurrency(selectedBill.subtotal)}</span>
                </div>
                {selectedBill.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>{locale === 'lo' ? 'ສ່ວນຫຼຸດ' : 'Discount'}</span>
                    <span>-{formatCurrency(selectedBill.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{locale === 'lo' ? 'ອາກອນ' : 'Tax'} ({settings.tax_rate}%)</span>
                  <span>{formatCurrency(selectedBill.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>{locale === 'lo' ? 'ຍອດສຸດທິ' : 'Total'}</span>
                  <span className="text-rose-600">{formatCurrency(selectedBill.total_amount)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getPaymentIcon(selectedBill.payment_method)}
                  <span className="capitalize">{selectedBill.payment_method}</span>
                </div>
                <Badge variant={selectedBill.payment_status === 'paid' ? 'success' : 'warning'} size="md">
                  {selectedBill.payment_status === 'paid' ? (locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'Paid') : (locale === 'lo' ? 'ລໍຖ້າ' : 'Pending')}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  {locale === 'lo' ? 'ປິດ' : 'Close'}
                </Button>
                <Button className="flex-1" icon={<Printer className="w-5 h-5" />}>
                  {locale === 'lo' ? 'ພິມ' : 'Print'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Bill Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={locale === 'lo' ? 'ສ້າງໃບບິນໃໝ່' : 'Create New Invoice'} size="lg">
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{locale === 'lo' ? 'ກຳລັງພັດທະນາ...' : 'Coming soon...'}</p>
            <p className="text-sm mt-2">{locale === 'lo' ? 'ໃຊ້ຂໍ້ມູນຈາກນັດໝາຍທີ່ສຳເລັດແລ້ວ' : 'Use completed appointments to create bills'}</p>
          </div>
        </Modal>
      </div>
    </SidebarLayout>
  );
}
