'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Badge, PageHeader, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart2, Users, Scissors, Package, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { transactions, appointments, customers, services, inventory, bills, getFinancialSummary } = useDataStore();
  const { locale } = useI18n();
  
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => { 
    if (!isAuthenticated) router.push('/login'); 
    if (user?.role === 'staff') router.push('/dashboard');
  }, [isAuthenticated, user, router]);
  
  if (!isAuthenticated || user?.role === 'staff') return null;

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

  const summary = useMemo(() => getFinancialSummary(dateRange.start, dateRange.end), [dateRange, transactions, getFinancialSummary]);

  const stats = useMemo(() => {
    const periodAppts = appointments.filter(a => a.appointment_date >= dateRange.start && a.appointment_date <= dateRange.end);
    const periodBills = bills.filter((b: any) => b.created_at >= dateRange.start && b.created_at <= dateRange.end);
    
    return {
      totalAppointments: periodAppts.length,
      completedAppointments: periodAppts.filter(a => a.status === 'done').length,
      cancelledAppointments: periodAppts.filter(a => a.status === 'cancelled').length,
      totalBills: periodBills.length,
      averageTicket: periodBills.length > 0 ? Math.round(periodBills.reduce((s: number, b: any) => s + b.grand_total, 0) / periodBills.length) : 0,
    };
  }, [appointments, bills, dateRange]);

  // Top services by revenue
  const topServices = useMemo(() => {
    const periodBills = bills.filter((b: any) => b.created_at >= dateRange.start && b.created_at <= dateRange.end);
    const serviceRevenue: Record<string, { name: string, revenue: number, count: number }> = {};
    
    periodBills.forEach((b: any) => {
      const key = b.service_name;
      if (!serviceRevenue[key]) serviceRevenue[key] = { name: b.service_name, revenue: 0, count: 0 };
      serviceRevenue[key].revenue += b.grand_total;
      serviceRevenue[key].count += 1;
    });
    
    return Object.values(serviceRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [bills, dateRange]);

  // Expense breakdown
  const expenseBreakdown = useMemo(() => {
    const total = Object.values(summary.expenseByCategory).reduce((a: number, b) => a + (b as number), 0) as number;
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'];
    return Object.entries(summary.expenseByCategory).map(([name, amount], i) => ({
      name, amount: amount as number, percentage: total > 0 ? Math.round(((amount as number) / total) * 100) : 0, color: colors[i % colors.length]
    }));
  }, [summary]);

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
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
        <div className="flex gap-2">
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
