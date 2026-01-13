'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Bell, Calendar, Package, DollarSign, Users, Trash2, Check, CheckCheck, AlertTriangle, ArrowDown, ArrowUp, Clock, X } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } = useDataStore();
  const { locale } = useI18n();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'stock' | 'appointment' | 'payment'>('all');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    
    // Filter by role (admin sees all, staff sees only relevant)
    if (user?.role === 'staff') {
      filtered = filtered.filter(n => !n.for_role || n.for_role !== 'admin');
    }
    
    switch (filter) {
      case 'unread': return filtered.filter(n => !n.is_read);
      case 'stock': return filtered.filter(n => ['stock_out', 'low_stock', 'out_of_stock'].includes(n.type));
      case 'appointment': return filtered.filter(n => n.type === 'appointment');
      case 'payment': return filtered.filter(n => n.type === 'payment');
      default: return filtered;
    }
  }, [notifications, filter, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'stock_out': return <ArrowDown className="w-5 h-5" />;
      case 'low_stock': return <AlertTriangle className="w-5 h-5" />;
      case 'out_of_stock': return <Package className="w-5 h-5" />;
      case 'customer': return <Users className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-emerald-100 text-emerald-600';
      case 'stock_out': return 'bg-red-100 text-red-600';
      case 'low_stock': return 'bg-amber-100 text-amber-600';
      case 'out_of_stock': return 'bg-red-100 text-red-600';
      case 'customer': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string, lo: string }> = {
      appointment: { en: 'Appointment', lo: 'ນັດໝາຍ' },
      payment: { en: 'Payment', lo: 'ການຊຳລະ' },
      stock_out: { en: 'Stock Out', lo: 'ເບີກສິນຄ້າ' },
      low_stock: { en: 'Low Stock', lo: 'ສິນຄ້າໃກ້ໝົດ' },
      out_of_stock: { en: 'Out of Stock', lo: 'ສິນຄ້າໝົດ' },
      customer: { en: 'Customer', lo: 'ລູກຄ້າ' },
    };
    return labels[type]?.[locale === 'lo' ? 'lo' : 'en'] || type;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return locale === 'lo' ? 'ຫາກໍ' : 'Just now';
    if (diffMins < 60) return locale === 'lo' ? `${diffMins} ນາທີກ່ອນ` : `${diffMins}m ago`;
    if (diffHours < 24) return locale === 'lo' ? `${diffHours} ຊົ່ວໂມງກ່ອນ` : `${diffHours}h ago`;
    if (diffDays < 7) return locale === 'lo' ? `${diffDays} ວັນກ່ອນ` : `${diffDays}d ago`;
    return date.toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const handleClick = (notif: any) => {
    if (!notif.is_read) markNotificationRead(notif.id);
    
    // Navigate based on type
    if (notif.type === 'appointment' && notif.appointment_id) router.push('/appointments');
    else if (notif.type === 'payment' && notif.bill_id) router.push('/billing');
    else if (['stock_out', 'low_stock', 'out_of_stock'].includes(notif.type)) router.push('/stock');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={locale === 'lo' ? 'ແຈ້ງເຕືອນ' : 'Notifications'}
          subtitle={locale === 'lo' ? `${unreadCount} ຂໍ້ຄວາມທີ່ຍັງບໍ່ໄດ້ອ່ານ` : `${unreadCount} unread notifications`}
          action={
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={markAllNotificationsRead}>
                  {locale === 'lo' ? 'ອ່ານທັງໝົດ' : 'Mark all read'}
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={clearAllNotifications}>
                  {locale === 'lo' ? 'ລຶບທັງໝົດ' : 'Clear all'}
                </Button>
              )}
            </div>
          }
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: locale === 'lo' ? 'ທັງໝົດ' : 'All', count: notifications.length },
            { key: 'unread', label: locale === 'lo' ? 'ຍັງບໍ່ອ່ານ' : 'Unread', count: unreadCount },
            { key: 'stock', label: locale === 'lo' ? 'ສະຕັອກ' : 'Stock', count: notifications.filter(n => ['stock_out', 'low_stock', 'out_of_stock'].includes(n.type)).length },
            { key: 'appointment', label: locale === 'lo' ? 'ນັດໝາຍ' : 'Appointments', count: notifications.filter(n => n.type === 'appointment').length },
            { key: 'payment', label: locale === 'lo' ? 'ການຊຳລະ' : 'Payments', count: notifications.filter(n => n.type === 'payment').length },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === tab.key ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>{formatNumber(tab.count)}</span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <Card padding="none">
          {filteredNotifications.length === 0 ? (
            <EmptyState 
              icon={<Bell className="w-8 h-8" />} 
              title={locale === 'lo' ? 'ບໍ່ມີແຈ້ງເຕືອນ' : 'No notifications'} 
              description={locale === 'lo' ? 'ແຈ້ງເຕືອນໃໝ່ຈະປາກົດຢູ່ນີ້' : 'New notifications will appear here'}
            />
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleClick(notif)}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-rose-50/50' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-900 ${!notif.is_read ? 'text-rose-900' : ''}`}>
                        {locale === 'lo' ? notif.title_lo : notif.title}
                      </h3>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {locale === 'lo' ? notif.message_lo : notif.message}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <Badge variant={notif.type === 'payment' ? 'success' : notif.type.includes('stock') ? 'warning' : 'info'} size="sm">
                        {getTypeLabel(notif.type)}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(notif.created_at)}
                      </span>
                      {notif.user_name && (
                        <span className="text-gray-400">
                          {locale === 'lo' ? 'ໂດຍ' : 'by'}: {notif.user_name}
                        </span>
                      )}
                      {notif.amount && (
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(notif.amount)}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Details */}
                    {notif.type === 'stock_out' && notif.quantity && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-red-700">
                            <strong>{locale === 'lo' ? 'ເບີກ' : 'Deducted'}:</strong> {formatNumber(notif.quantity)}
                          </span>
                          <span className="text-gray-600">
                            {formatNumber(notif.previous_qty)} → <strong>{formatNumber(notif.new_qty)}</strong>
                          </span>
                          {notif.reason && (
                            <span className="text-gray-500">
                              ({notif.reason})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!notif.is_read && (
                      <button onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                        className="p-2 hover:bg-gray-100 rounded-lg" title={locale === 'lo' ? 'ໝາຍວ່າອ່ານແລ້ວ' : 'Mark as read'}>
                        <Check className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-2 hover:bg-red-50 rounded-lg" title={locale === 'lo' ? 'ລຶບ' : 'Delete'}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SidebarLayout>
  );
}
