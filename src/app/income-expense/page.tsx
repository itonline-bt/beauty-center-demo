'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, EmptyState } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Calendar, Banknote, Building, CreditCard, Building2 } from 'lucide-react';

export default function IncomeExpensePage() {
  const router = useRouter();
  const { user, isAuthenticated, currentBranch } = useAuthStore();
  const { transactions, expenseCategories, addTransaction, deleteTransaction, getFinancialSummary } = useDataStore();
  const { locale, formatCurrency } = useI18n();
  
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [form, setForm] = useState({ category_id: '', description: '', amount: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });

  // Filter by branch
  const branchTransactions = useMemo(() => {
    if (!currentBranch) return [];
    return transactions.filter((t: any) => t.branch_id === currentBranch.id || !t.branch_id);
  }, [transactions, currentBranch]);

  const summary = useMemo(() => {
    const filtered = branchTransactions.filter((t: any) => t.date >= dateRange.start && t.date <= dateRange.end);
    const income = filtered.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    const expenses = filtered.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    const expenseByCategory = filtered.filter((t: any) => t.type === 'expense').reduce((acc: Record<string, number>, t: any) => {
      acc[t.category_name] = (acc[t.category_name] || 0) + t.amount;
      return acc;
    }, {});
    return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses, expenseByCategory, transactionCount: filtered.length };
  }, [branchTransactions, dateRange]);
  
  const filteredTransactions = useMemo(() => {
    let filtered = branchTransactions.filter((t: any) => t.date >= dateRange.start && t.date <= dateRange.end);
    if (activeTab === 'income') filtered = filtered.filter((t: any) => t.type === 'income');
    if (activeTab === 'expense') filtered = filtered.filter((t: any) => t.type === 'expense');
    return filtered.sort((a: any, b: any) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [branchTransactions, dateRange, activeTab]);

  // Auth redirect
  useEffect(() => { 
    if (!isAuthenticated) router.push('/login'); 
    else if (!currentBranch) router.push('/select-branch');
  }, [isAuthenticated, currentBranch, router]);
  
  // Early return AFTER all hooks
  if (!isAuthenticated || !currentBranch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = expenseCategories.find(c => c.id === Number(form.category_id));
    addTransaction({
      type: transactionType,
      category_id: transactionType === 'expense' ? Number(form.category_id) : 0,
      category_name: transactionType === 'income' ? (locale === 'lo' ? 'ລາຍຮັບອື່ນ' : 'Other Income') : (category?.name || 'Other'),
      description: form.description,
      amount: Number(form.amount),
      payment_method: form.payment_method,
      date: form.date,
      created_by: user?.id || 1,
      created_by_name: user?.full_name || 'Admin',
      branch_id: currentBranch.id,
    });
    setShowModal(false);
    setForm({ category_id: '', description: '', amount: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });
  };

  const openAddModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setForm({ category_id: '', description: '', amount: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'transfer': return <Building className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, { en: string, lo: string }> = {
      cash: { en: 'Cash', lo: 'ເງິນສົດ' },
      transfer: { en: 'Transfer', lo: 'ໂອນ' },
      card: { en: 'Card', lo: 'ບັດ' },
    };
    return labels[method]?.[locale === 'lo' ? 'lo' : 'en'] || method;
  };

  const setQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateRange({ start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] });
  };

  const setLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Branch indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          <span>{locale === 'lo' ? 'ສາຂາ:' : 'Branch:'}</span>
          <span className="font-medium text-rose-600">{locale === 'lo' ? currentBranch.name : currentBranch.name_en}</span>
        </div>

        <PageHeader
          title={locale === 'lo' ? 'ລາຍຮັບ - ລາຍຈ່າຍ' : 'Income & Expenses'}
          subtitle={locale === 'lo' ? 'ບັນທຶກລາຍຮັບ ແລະ ລາຍຈ່າຍປະຈຳວັນ' : 'Track daily income and expenses'}
          action={
            <div className="flex gap-2">
              <Button variant="success" icon={<ArrowUpCircle className="w-5 h-5" />} onClick={() => openAddModal('income')}>
                {locale === 'lo' ? 'ລາຍຮັບ' : 'Income'}
              </Button>
              <Button variant="danger" icon={<ArrowDownCircle className="w-5 h-5" />} onClick={() => openAddModal('expense')}>
                {locale === 'lo' ? 'ລາຍຈ່າຍ' : 'Expense'}
              </Button>
            </div>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover className="p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{locale === 'lo' ? 'ລາຍຮັບ' : 'Income'}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">+{formatCurrency(summary.totalIncome)}</p>
                <p className="text-xs text-gray-400 mt-1">{formatNumber(branchTransactions.filter((t: any) => t.date >= dateRange.start && t.date <= dateRange.end && t.type === 'income').length)} {locale === 'lo' ? 'ລາຍການ' : 'transactions'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card hover className="p-5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{locale === 'lo' ? 'ລາຍຈ່າຍ' : 'Expenses'}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">-{formatCurrency(summary.totalExpenses)}</p>
                <p className="text-xs text-gray-400 mt-1">{formatNumber(transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end && t.type === 'expense').length)} {locale === 'lo' ? 'ລາຍການ' : 'transactions'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card hover className={`p-5 border-l-4 ${summary.netProfit >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{locale === 'lo' ? 'ຍອດເຫຼືອ' : 'Balance'}</p>
                <p className={`text-2xl font-bold mt-1 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {summary.netProfit >= 0 ? '+' : ''}{formatCurrency(summary.netProfit)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatNumber(summary.transactionCount)} {locale === 'lo' ? 'ລາຍການທັງໝົດ' : 'total transactions'}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <DollarSign className={`w-6 h-6 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </Card>
        </div>

        {/* Date Range Filter */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{locale === 'lo' ? 'ຊ່ວງວັນທີ:' : 'Date Range:'}</span>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
            <span className="text-gray-400">→</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2 ml-auto flex-wrap">
              <button onClick={() => setQuickDate(0)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{locale === 'lo' ? 'ມື້ນີ້' : 'Today'}</button>
              <button onClick={() => setQuickDate(7)} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{locale === 'lo' ? '7 ວັນ' : '7 Days'}</button>
              <button onClick={setThisMonth} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{locale === 'lo' ? 'ເດືອນນີ້' : 'This Month'}</button>
              <button onClick={setLastMonth} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">{locale === 'lo' ? 'ເດືອນກ່ອນ' : 'Last Month'}</button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: locale === 'lo' ? 'ທັງໝົດ' : 'All', count: filteredTransactions.length },
            { key: 'income', label: locale === 'lo' ? 'ລາຍຮັບ' : 'Income', count: transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end && t.type === 'income').length },
            { key: 'expense', label: locale === 'lo' ? 'ລາຍຈ່າຍ' : 'Expense', count: transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end && t.type === 'expense').length },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>{formatNumber(tab.count)}</span>
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <Card padding="none">
          {filteredTransactions.length === 0 ? (
            <EmptyState icon={<DollarSign className="w-8 h-8" />} title={locale === 'lo' ? 'ບໍ່ມີລາຍການ' : 'No transactions'} description={locale === 'lo' ? 'ເລີ່ມບັນທຶກລາຍຮັບ-ຈ່າຍເລີຍ' : 'Start recording income/expense'} />
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((t) => (
                <div key={t.id} className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${t.type === 'income' ? 'border-l-4 border-l-emerald-400' : 'border-l-4 border-l-red-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {t.type === 'income' ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{t.description}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{t.date}</span>
                      <Badge variant={t.type === 'income' ? 'success' : 'danger'} size="sm">{t.category_name}</Badge>
                      <span className="flex items-center gap-1">{getPaymentIcon(t.payment_method)} {getPaymentLabel(t.payment_method)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-xs text-gray-400">{t.created_by_name}</p>
                  </div>
                  <button onClick={() => deleteTransaction(t.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Transaction Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} 
          title={transactionType === 'income' ? (locale === 'lo' ? 'ເພີ່ມລາຍຮັບ' : 'Add Income') : (locale === 'lo' ? 'ເພີ່ມລາຍຈ່າຍ' : 'Add Expense')} size="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {transactionType === 'expense' && (
              <Select
                label={locale === 'lo' ? 'ໝວດໝູ່' : 'Category'}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                options={expenseCategories.map(c => ({ value: c.id, label: locale === 'lo' ? c.name_lo : c.name }))}
                placeholder={`-- ${locale === 'lo' ? 'ເລືອກໝວດໝູ່' : 'Select Category'} --`}
                required
              />
            )}
            <Input label={locale === 'lo' ? 'ລາຍລະອຽດ' : 'Description'} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder={locale === 'lo' ? 'ລາຍລະອຽດ...' : 'Description...'} />
            <div className="grid grid-cols-2 gap-4">
              <Input label={locale === 'lo' ? 'ຈຳນວນເງິນ' : 'Amount'} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min={0} />
              <Input label={locale === 'lo' ? 'ວັນທີ' : 'Date'} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'lo' ? 'ວິທີຊຳລະ' : 'Payment Method'}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'cash', label: locale === 'lo' ? 'ເງິນສົດ' : 'Cash', icon: Banknote },
                  { value: 'transfer', label: locale === 'lo' ? 'ໂອນ' : 'Transfer', icon: Building },
                  { value: 'card', label: locale === 'lo' ? 'ບັດ' : 'Card', icon: CreditCard },
                ].map(method => (
                  <button key={method.value} type="button" onClick={() => setForm({ ...form, payment_method: method.value })}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.payment_method === method.value ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <method.icon className={`w-5 h-5 ${form.payment_method === method.value ? 'text-rose-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${form.payment_method === method.value ? 'text-rose-700' : 'text-gray-600'}`}>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}</Button>
              <Button type="submit" variant={transactionType === 'income' ? 'success' : 'danger'} className="flex-1">
                {locale === 'lo' ? 'ບັນທຶກ' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </SidebarLayout>
  );
}
