'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore, mockBranches } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Badge, PageHeader, StatCard } from '@/components/ui';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart2, Users, Scissors, Package, FileText, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, currentBranch } = useAuthStore();
  const { transactions, appointments, customers, services, inventory, bills, getFinancialSummary } = useDataStore();
  const { locale, formatCurrency } = useI18n();
  
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all'>('all'); // 'all' = ทุกสาขา

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Filter by selected branch (or all branches)
  const filteredTransactions = useMemo(() => {
    if (selectedBranchId === 'all') return transactions;
    return transactions.filter((t: any) => t.branch_id === selectedBranchId || !t.branch_id);
  }, [transactions, selectedBranchId]);

  const filteredAppointments = useMemo(() => {
    if (selectedBranchId === 'all') return appointments;
    return appointments.filter((a: any) => a.branch_id === selectedBranchId || !a.branch_id);
  }, [appointments, selectedBranchId]);

  const filteredBills = useMemo(() => {
    if (selectedBranchId === 'all') return bills;
    return bills.filter((b: any) => b.branch_id === selectedBranchId || !b.branch_id);
  }, [bills, selectedBranchId]);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (period) {
      case 'today': break;
      case 'week': start.setDate(start.getDate() - 7); break;
      case 'month': start.setMonth(start.getMonth() - 1); break;
      case 'year': start.setFullYear(start.getFullYear() - 1); break;
    }
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }, [period]);

  const summary = useMemo(() => {
    const filtered = filteredTransactions.filter((t: any) => t.date >= dateRange.start && t.date <= dateRange.end);
    const income = filtered.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    const expenses = filtered.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    const expenseByCategory = filtered.filter((t: any) => t.type === 'expense').reduce((acc: Record<string, number>, t: any) => {
      acc[t.category_name] = (acc[t.category_name] || 0) + t.amount;
      return acc;
    }, {});
    return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses, expenseByCategory, transactionCount: filtered.length };
  }, [filteredTransactions, dateRange]);

  const stats = useMemo(() => {
    const periodAppts = filteredAppointments.filter((a: any) => a.appointment_date >= dateRange.start && a.appointment_date <= dateRange.end);
    const periodBills = filteredBills.filter((b: any) => b.created_at >= dateRange.start && b.created_at <= dateRange.end);
    
    return {
      totalAppointments: periodAppts.length,
      completedAppointments: periodAppts.filter((a: any) => a.status === 'done').length,
      cancelledAppointments: periodAppts.filter((a: any) => a.status === 'cancelled').length,
      totalBills: periodBills.length,
      averageTicket: periodBills.length > 0 ? Math.round(periodBills.reduce((s: number, b: any) => s + b.grand_total, 0) / periodBills.length) : 0,
    };
  }, [filteredAppointments, filteredBills, dateRange]);

  // Top services by revenue
  const topServices = useMemo(() => {
    const periodBills = filteredBills.filter((b: any) => b.created_at >= dateRange.start && b.created_at <= dateRange.end);
    const serviceRevenue: Record<string, { name: string, revenue: number, count: number }> = {};
    
    periodBills.forEach((b: any) => {
      const key = b.service_name;
      if (!serviceRevenue[key]) serviceRevenue[key] = { name: b.service_name, revenue: 0, count: 0 };
      serviceRevenue[key].revenue += b.grand_total;
      serviceRevenue[key].count += 1;
    });
    
    return Object.values(serviceRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredBills, dateRange]);

  // Expense breakdown
  const expenseBreakdown = useMemo(() => {
    const total = Object.values(summary.expenseByCategory).reduce((a: number, b) => a + (b as number), 0) as number;
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'];
    return Object.entries(summary.expenseByCategory).map(([name, amount], i) => ({
      name, amount: amount as number, percentage: total > 0 ? Math.round(((amount as number) / total) * 100) : 0, color: colors[i % colors.length]
    }));
  }, [summary]);

  // Branch comparison stats (for admin)
  const branchComparison = useMemo(() => {
    if (!isAdmin) return [];
    return mockBranches.map(branch => {
      const branchTrans = transactions.filter((t: any) => t.branch_id === branch.id && t.date >= dateRange.start && t.date <= dateRange.end);
      const branchBillsList = bills.filter((b: any) => b.branch_id === branch.id && b.created_at >= dateRange.start && b.created_at <= dateRange.end);
      const income = branchTrans.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
      const expenses = branchTrans.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
      return {
        id: branch.id,
        name: locale === 'lo' ? branch.name : branch.name_en,
        income,
        expenses,
        profit: income - expenses,
        bills: branchBillsList.length,
      };
    });
  }, [isAdmin, transactions, bills, dateRange, locale]);

  // Auth redirect
  useEffect(() => { 
    if (!isAuthenticated) router.push('/login'); 
    else if (!currentBranch) router.push('/select-branch');
    else if (user?.role === 'staff') router.push('/dashboard');
  }, [isAuthenticated, currentBranch, user, router]);
  
  // Early return AFTER all hooks
  if (!isAuthenticated || !currentBranch || user?.role === 'staff') return null;

  // Get selected branch name
  const getSelectedBranchName = () => {
    if (selectedBranchId === 'all') return locale === 'lo' ? 'ທຸກສາຂາ' : 'All Branches';
    const branch = mockBranches.find(b => b.id === selectedBranchId);
    return branch ? (locale === 'lo' ? branch.name : branch.name_en) : '';
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Branch Selector for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <Building2 className="w-5 h-5 text-rose-500" />
            <span className="font-medium text-gray-700">{locale === 'lo' ? 'ເລືອກສາຂາ:' : 'Select Branch:'}</span>
            <select 
              value={selectedBranchId} 
              onChange={(e) => setSelectedBranchId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 border border-rose-200 rounded-lg bg-white font-medium text-rose-600 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="all">{locale === 'lo' ? '📊 ທຸກສາຂາ (ລວມ)' : '📊 All Branches (Combined)'}</option>
              {mockBranches.filter(b => b.is_active).map(branch => (
                <option key={branch.id} value={branch.id}>
                  {locale === 'lo' ? branch.name : branch.name_en}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-gray-500">
              {locale === 'lo' ? 'ກຳລັງເບິ່ງ:' : 'Viewing:'} <strong className="text-rose-600">{getSelectedBranchName()}</strong>
            </span>
          </div>
        )}

        {/* Non-admin branch indicator */}
        {!isAdmin && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            <span>{locale === 'lo' ? 'ສາຂາ:' : 'Branch:'}</span>
            <span className="font-medium text-rose-600">{locale === 'lo' ? currentBranch.name : currentBranch.name_en}</span>
          </div>
        )}

        <PageHeader
          title={locale === 'lo' ? 'ລາຍງານ' : 'Reports'}
          subtitle={locale === 'lo' ? 'ສະຫຼຸບຂໍ້ມູນທຸລະກິດ' : 'Business summary and analytics'}
          action={
            <Link href="/income-expense">
              <Button variant="secondary" icon={<FileText className="w-5 h-5" />}>
                {locale === 'lo' ? 'ລາຍຮັບ-ຈ່າຍ' : 'Income/Expense'}
              </Button>
            </Link>
          }
        />

        {/* Period Selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'today', label: locale === 'lo' ? 'ມື້ນີ້' : 'Today' },
            { key: 'week', label: locale === 'lo' ? '7 ວັນ' : '7 Days' },
            { key: 'month', label: locale === 'lo' ? '30 ວັນ' : '30 Days' },
            { key: 'year', label: locale === 'lo' ? '1 ປີ' : '1 Year' },
          ].map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p.key ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Branch Comparison Table (Admin only, when viewing all branches) */}
        {isAdmin && selectedBranchId === 'all' && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-rose-500" />
              {locale === 'lo' ? 'ປຽບທຽບສາຂາ' : 'Branch Comparison'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">{locale === 'lo' ? 'ສາຂາ' : 'Branch'}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">{locale === 'lo' ? 'ລາຍຮັບ' : 'Income'}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">{locale === 'lo' ? 'ລາຍຈ່າຍ' : 'Expenses'}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">{locale === 'lo' ? 'ກຳໄລ' : 'Profit'}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">{locale === 'lo' ? 'ບິນ' : 'Bills'}</th>
                  </tr>
                </thead>
                <tbody>
                  {branchComparison.map((branch, i) => (
                    <tr key={branch.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 font-medium">{branch.name}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">+{formatCurrency(branch.income)}</td>
                      <td className="py-3 px-4 text-right text-red-600">-{formatCurrency(branch.expenses)}</td>
                      <td className={`py-3 px-4 text-right font-bold ${branch.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {branch.profit >= 0 ? '+' : ''}{formatCurrency(branch.profit)}
                      </td>
                      <td className="py-3 px-4 text-right">{branch.bills}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="border-t-2 border-gray-300 bg-rose-50 font-bold">
                    <td className="py-3 px-4">{locale === 'lo' ? 'ລວມທັງໝົດ' : 'Total'}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">+{formatCurrency(branchComparison.reduce((s, b) => s + b.income, 0))}</td>
                    <td className="py-3 px-4 text-right text-red-600">-{formatCurrency(branchComparison.reduce((s, b) => s + b.expenses, 0))}</td>
                    <td className="py-3 px-4 text-right text-emerald-700">{formatCurrency(branchComparison.reduce((s, b) => s + b.profit, 0))}</td>
                    <td className="py-3 px-4 text-right">{branchComparison.reduce((s, b) => s + b.bills, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card hover className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">{locale === 'lo' ? 'ລາຍຮັບ' : 'Income'}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-200" />
            </div>
          </Card>
          
          <Card hover className="p-5 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">{locale === 'lo' ? 'ລາຍຈ່າຍ' : 'Expenses'}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-200" />
            </div>
          </Card>
          
          <Card hover className={`p-5 text-white ${summary.netProfit >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={summary.netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'} >{locale === 'lo' ? 'ກຳໄລສຸດທິ' : 'Net Profit'}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.netProfit)}</p>
              </div>
              <DollarSign className={`w-10 h-10 ${summary.netProfit >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
            </div>
          </Card>
          
          <Card hover className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{locale === 'lo' ? 'ບິນສະເລ່ຍ' : 'Avg. Ticket'}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.averageTicket)}</p>
              </div>
              <BarChart2 className="w-10 h-10 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title={locale === 'lo' ? 'ນັດໝາຍທັງໝົດ' : 'Total Appointments'} value={stats.totalAppointments} icon={<Calendar className="w-6 h-6" />} color="blue" />
          <StatCard title={locale === 'lo' ? 'ສຳເລັດ' : 'Completed'} value={stats.completedAppointments} icon={<Calendar className="w-6 h-6" />} color="emerald" />
          <StatCard title={locale === 'lo' ? 'ລູກຄ້າທັງໝົດ' : 'Total Customers'} value={customers.length} icon={<Users className="w-6 h-6" />} color="purple" />
          <StatCard title={locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ' : 'Low Stock'} value={inventory.filter(i => i.quantity <= i.min_quantity).length} icon={<Package className="w-6 h-6" />} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-rose-500" />
                {locale === 'lo' ? 'ບໍລິການຍອດນິຍົມ' : 'Top Services'}
              </h2>
            </div>
            <div className="space-y-3">
              {topServices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{locale === 'lo' ? 'ບໍ່ມີຂໍ້ມູນ' : 'No data'}</p>
              ) : topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.count} {locale === 'lo' ? 'ຄັ້ງ' : 'times'}</p>
                  </div>
                  <span className="font-bold text-emerald-600">{formatCurrency(service.revenue)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-rose-500" />
                {locale === 'lo' ? 'ສັດສ່ວນລາຍຈ່າຍ' : 'Expense Breakdown'}
              </h2>
            </div>
            
            {expenseBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{locale === 'lo' ? 'ບໍ່ມີຂໍ້ມູນ' : 'No expenses'}</p>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className={`${item.color}`} style={{ width: `${item.percentage}%` }} title={`${item.name}: ${item.percentage}%`} />
                  ))}
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-3">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.amount)} ({item.percentage}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <Link href="/income-expense" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{locale === 'lo' ? 'ລາຍຮັບ-ຈ່າຍ' : 'Income/Expense'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/billing" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{locale === 'lo' ? 'ໃບບິນ' : 'Bills'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/stock" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Package className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{locale === 'lo' ? 'ສະຕັອກ' : 'Stock'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
