'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Badge, StatCard } from '@/components/ui';
import { formatNumber, getStatusText, getProductImageUrl } from '@/lib/utils';
import { Calendar, Users, DollarSign, AlertTriangle, Clock, TrendingUp, Scissors, Package, ArrowRight, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { appointments, customers, services, inventory, bills, getDashboard } = useDataStore();
  const { locale, t, formatCurrency } = useI18n();

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const today = new Date().toISOString().split('T')[0];
  const dashboard = useMemo(() => getDashboard(), [appointments, bills, inventory, getDashboard]);
  const todayAppointments = appointments.filter(a => a.appointment_date === today).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  const lowStockItems = inventory.filter(i => i.quantity <= i.min_quantity).slice(0, 5);

  // Calculate monthly stats
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const monthlyRevenue = bills.filter((b: any) => b.created_at >= monthStart).reduce((s: number, b: any) => s + b.grand_total, 0);
  const monthlyAppointments = appointments.filter(a => a.appointment_date >= monthStart && a.status === 'done').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = { done: 'success', confirmed: 'info', in_progress: 'info', pending: 'warning', cancelled: 'danger' };
    return <Badge variant={variants[status] || 'default'} size="sm">{getStatusText(status, locale)}</Badge>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">
            {locale === 'lo' ? 'ສະບາຍດີ' : 'Welcome back'}, {user?.full_name || 'Admin'}! 👋
          </h1>
          <p className="text-rose-100">
            {locale === 'lo' ? 'ນີ້ແມ່ນສະຖານະຮ້ານຂອງທ່ານມື້ນີ້' : "Here's what's happening with your salon today"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={locale === 'lo' ? 'ລາຍຮັບເດືອນນີ້' : 'Monthly Revenue'} 
            value={formatCurrency(monthlyRevenue)} 
            icon={<DollarSign className="w-6 h-6" />} 
            color="emerald"
            trend={{ value: 12, isUp: true }}
          />
          <StatCard 
            title={locale === 'lo' ? 'ນັດໝາຍມື້ນີ້' : "Today's Appointments"} 
            value={formatNumber(todayAppointments.length)} 
            icon={<Calendar className="w-6 h-6" />} 
            color="blue" 
          />
          <StatCard 
            title={locale === 'lo' ? 'ລູກຄ້າທັງໝົດ' : 'Total Customers'} 
            value={formatNumber(customers.length)} 
            icon={<Users className="w-6 h-6" />} 
            color="purple" 
          />
          <StatCard 
            title={locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ' : 'Low Stock Items'} 
            value={formatNumber(lowStockItems.length)} 
            icon={<AlertTriangle className="w-6 h-6" />} 
            color={lowStockItems.length > 0 ? 'amber' : 'emerald'} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  <h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ນັດໝາຍມື້ນີ້' : "Today's Schedule"}</h2>
                  <Badge variant="info">{formatNumber(todayAppointments.length)}</Badge>
                </div>
                <Link href="/appointments" className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1">
                  {locale === 'lo' ? 'ເບິ່ງທັງໝົດ' : 'View all'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>{locale === 'lo' ? 'ບໍ່ມີນັດໝາຍມື້ນີ້' : 'No appointments today'}</p>
                  </div>
                ) : (
                  todayAppointments.slice(0, 8).map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white ${apt.status === 'done' ? 'bg-emerald-500' : apt.status === 'in_progress' ? 'bg-blue-500' : 'bg-gradient-to-br from-rose-500 to-pink-500'}`}>
                        <Clock className="w-4 h-4 opacity-75" />
                        <span className="text-sm font-bold">{apt.appointment_time.substring(0, 5)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{apt.customer_name}</span>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-sm text-rose-600">{locale === 'lo' ? apt.service_name_lo : apt.service_name}</p>
                        <p className="text-xs text-gray-500">{locale === 'lo' ? 'ພະນັກງານ' : 'Staff'}: {apt.staff_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(apt.total_price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">{locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ' : 'Low Stock Alert'}</h3>
                </div>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img 
                        src={item.image_url || getProductImageUrl(item.name, item.category)}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getProductImageUrl(item.name, item.category); }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{locale === 'lo' ? item.name_lo : item.name}</p>
                        <p className="text-xs text-amber-600 font-medium">{locale === 'lo' ? 'ເຫຼືອ' : 'Left'}: {formatNumber(item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/stock" className="mt-4 block">
                  <Button variant="secondary" size="sm" className="w-full">{locale === 'lo' ? 'ຈັດການສະຕັອກ' : 'Manage Stock'}</Button>
                </Link>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">{locale === 'lo' ? 'ສະຖິຕິໄວ' : 'Quick Stats'}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600">{locale === 'lo' ? 'ສຳເລັດມື້ນີ້' : 'Completed Today'}</span>
                  </div>
                  <span className="font-bold text-emerald-600">{formatNumber(dashboard.appointments.completed)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-gray-600">{locale === 'lo' ? 'ລໍຖ້າຢືນຢັນ' : 'Pending'}</span>
                  </div>
                  <span className="font-bold text-amber-600">{formatNumber(dashboard.appointments.pending)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">{locale === 'lo' ? 'ລາຍຮັບມື້ນີ້' : "Today's Revenue"}</span>
                  </div>
                  <span className="font-bold text-blue-600">{formatCurrency(dashboard.revenue.today)}</span>
                </div>
              </div>
            </Card>

            {/* Top Services */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold text-gray-900">{locale === 'lo' ? 'ບໍລິການຍອດນິຍົມ' : 'Top Services'}</h3>
              </div>
              <div className="space-y-3">
                {services.slice(0, 5).map((service, index) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{locale === 'lo' ? service.name_lo : service.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(service.price)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
