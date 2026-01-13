'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, SearchInput, EmptyState } from '@/components/ui';
import { formatCurrency, formatNumber, getStatusText } from '@/lib/utils';
import { Plus, Clock, Phone, User, Calendar, ChevronLeft, ChevronRight, Edit2, Check, X, Play, Receipt, Printer, DollarSign, CreditCard, Banknote, Building } from 'lucide-react';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { appointments, customers, services, users, settings, addAppointment, updateAppointment, searchCustomers, bills, addBill, addTransaction } = useDataStore();
  const { locale, t } = useI18n();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Form states
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchedCustomers, setSearchedCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    customer_id: '', customer_name: '', customer_phone: '',
    service_id: '', price: '', discount: '0',
    staff_id: '', appointment_date: '', appointment_time: '09:00', notes: ''
  });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const staffList = users.filter(u => u.role === 'staff' && u.is_active);

  useEffect(() => {
    if (customerSearch.length >= 2) {
      const results = searchCustomers(customerSearch);
      setSearchedCustomers(results);
      setShowCustomerDropdown(true);
    } else {
      setSearchedCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, searchCustomers]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = a.customer_name.toLowerCase().includes(search.toLowerCase()) || a.service_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || a.status === statusFilter;
      const matchDate = a.appointment_date === selectedDate;
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }, [appointments, search, statusFilter, selectedDate]);

  const dateStats = useMemo(() => {
    const dayAppts = appointments.filter(a => a.appointment_date === selectedDate);
    return {
      total: dayAppts.length,
      pending: dayAppts.filter(a => a.status === 'pending').length,
      confirmed: dayAppts.filter(a => a.status === 'confirmed').length,
      in_progress: dayAppts.filter(a => a.status === 'in_progress').length,
      completed: dayAppts.filter(a => a.status === 'done').length,
      revenue: dayAppts.filter(a => a.status === 'done').reduce((s, a) => s + a.total_price, 0),
    };
  }, [appointments, selectedDate]);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === Number(serviceId));
    if (service) setForm(prev => ({ ...prev, service_id: serviceId, price: String(service.price) }));
  };

  const handleSelectCustomer = (customer: any) => {
    setForm(prev => ({ ...prev, customer_id: String(customer.id), customer_name: customer.name, customer_phone: customer.phone }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === Number(form.service_id));
    const staff = users.find(u => u.id === Number(form.staff_id));
    const price = Number(form.price);
    const discount = Number(form.discount) || 0;
    
    const data = {
      customer_id: Number(form.customer_id), customer_name: form.customer_name, customer_phone: form.customer_phone,
      service_id: Number(form.service_id), service_name: service?.name || '', service_name_lo: service?.name_lo || '',
      staff_id: Number(form.staff_id), staff_name: staff?.full_name || '',
      appointment_date: form.appointment_date, appointment_time: form.appointment_time,
      duration: service?.duration || 60, price, discount, total_price: price - discount,
      status: 'pending', notes: form.notes,
    };

    if (editItem) updateAppointment(editItem.id, data);
    else addAppointment(data);
    closeModal();
  };

  // Open payment modal
  const openPaymentModal = (apt: any) => {
    setSelectedAppointment(apt);
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  // Process payment and create bill
  const processPayment = () => {
    if (!selectedAppointment) return;
    
    const apt = selectedAppointment;
    const subtotal = apt.price;
    const discountAmount = apt.discount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round(afterDiscount * settings.tax_rate / 100);
    const grandTotal = afterDiscount + taxAmount;
    
    const bill = {
      id: Math.max(...bills.map((b: any) => b.id), 0) + 1,
      bill_number: `RCP-${new Date().getFullYear()}-${String(bills.length + 1).padStart(5, '0')}`,
      appointment_id: apt.id,
      customer_id: apt.customer_id, customer_name: apt.customer_name, customer_phone: apt.customer_phone,
      service_id: apt.service_id, service_name: apt.service_name, service_name_lo: apt.service_name_lo,
      staff_id: apt.staff_id, staff_name: apt.staff_name,
      subtotal: subtotal, 
      discount_amount: discountAmount,
      tax_rate: settings.tax_rate, 
      tax_amount: taxAmount,
      grand_total: grandTotal,
      payment_method: paymentMethod, 
      payment_status: 'paid',
      notes: '', 
      created_at: new Date().toISOString().split('T')[0],
      created_time: new Date().toTimeString().substring(0, 5),
    };
    
    // Update appointment status
    updateAppointment(apt.id, { status: 'done' });
    
    // Add bill
    addBill(bill);
    
    // Add income transaction
    addTransaction({
      type: 'income', category_id: 0, category_name: 'Service',
      description: `${apt.service_name} - ${apt.customer_name}`,
      amount: grandTotal, payment_method: paymentMethod,
      bill_id: bill.id, created_by: user?.id || 1, created_by_name: user?.full_name || 'Admin',
    });
    
    setShowPaymentModal(false);
    setCurrentBill(bill);
    setShowBillModal(true);
  };

  // View existing bill for completed appointment
  const viewBill = (apt: any) => {
    const bill = bills.find((b: any) => b.appointment_id === apt.id);
    if (bill) {
      setCurrentBill(bill);
      setShowBillModal(true);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setCustomerSearch(item.customer_name);
      setForm({
        customer_id: String(item.customer_id), customer_name: item.customer_name, customer_phone: item.customer_phone,
        service_id: String(item.service_id), price: String(item.price), discount: String(item.discount || 0),
        staff_id: String(item.staff_id), appointment_date: item.appointment_date,
        appointment_time: item.appointment_time, notes: item.notes || '',
      });
    } else {
      setEditItem(null);
      setCustomerSearch('');
      setForm({ customer_id: '', customer_name: '', customer_phone: '', service_id: '', price: '', discount: '0', staff_id: '', appointment_date: selectedDate, appointment_time: '09:00', notes: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); setCustomerSearch(''); setShowCustomerDropdown(false); };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = { done: 'success', confirmed: 'info', in_progress: 'info', pending: 'warning', cancelled: 'danger' };
    return <Badge variant={variants[status] || 'default'}>{getStatusText(status, locale)}</Badge>;
  };

  const formatDateDisplay = (dateStr: string) => new Date(dateStr).toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const getPaymentMethodText = (method: string) => {
    const texts: Record<string, { en: string, lo: string }> = {
      cash: { en: 'Cash', lo: 'ເງິນສົດ' },
      transfer: { en: 'Bank Transfer', lo: 'ໂອນເງິນ' },
      card: { en: 'Credit/Debit Card', lo: 'ບັດເຄຣດິດ/ເດບິດ' },
    };
    return texts[method]?.[locale === 'lo' ? 'lo' : 'en'] || method;
  };

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && currentBill) {
      const b = currentBill;
      printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt #${b.bill_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', monospace; 
      font-size: 12px; 
      width: 80mm; 
      margin: 0 auto; 
      padding: 8mm 4mm;
      line-height: 1.4;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .shop-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
    .shop-info { font-size: 10px; color: #555; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .double-divider { border-top: 2px solid #000; margin: 8px 0; }
    .bill-no { font-size: 14px; font-weight: bold; margin: 8px 0; letter-spacing: 1px; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .label { color: #555; }
    .total-section { background: #f5f5f5; padding: 8px; margin: 8px -4mm; }
    .grand-total { font-size: 18px; font-weight: bold; }
    .footer { font-size: 10px; color: #555; margin-top: 12px; }
    .qr-placeholder { width: 60px; height: 60px; border: 1px dashed #999; margin: 8px auto; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #999; }
  </style>
</head>
<body>
  <div class="center">
    <div class="shop-name">${settings.shop_name}</div>
    <div class="shop-name">${settings.shop_name_lo}</div>
    <div class="shop-info">${settings.address}</div>
    <div class="shop-info">Tel: ${settings.phone}</div>
  </div>
  
  <div class="divider"></div>
  
  <div class="center">
    <div style="font-size: 14px; font-weight: bold;">ໃບຮັບເງິນ / RECEIPT</div>
    <div class="bill-no">#${b.bill_number}</div>
    <div style="font-size: 10px; color: #555;">${b.created_at} ${b.created_time || ''}</div>
  </div>
  
  <div class="divider"></div>
  
  <div class="row"><span class="label">${locale === 'lo' ? 'ລູກຄ້າ' : 'Customer'}:</span><span class="bold">${b.customer_name}</span></div>
  <div class="row"><span class="label">${locale === 'lo' ? 'ເບີໂທ' : 'Phone'}:</span><span>${b.customer_phone}</span></div>
  <div class="row"><span class="label">${locale === 'lo' ? 'ພະນັກງານ' : 'Staff'}:</span><span>${b.staff_name}</span></div>
  
  <div class="double-divider"></div>
  
  <div style="margin-bottom: 4px;">
    <div class="bold">${locale === 'lo' ? b.service_name_lo : b.service_name}</div>
    <div class="right" style="margin-top: -14px;">${formatCurrency(b.subtotal)}</div>
  </div>
  
  <div class="divider"></div>
  
  <div class="row"><span class="label">${locale === 'lo' ? 'ລາຄາ' : 'Subtotal'}</span><span>${formatCurrency(b.subtotal)}</span></div>
  ${b.discount_amount > 0 ? `<div class="row" style="color: #e11d48;"><span>${locale === 'lo' ? 'ສ່ວນຫຼຸດ' : 'Discount'}</span><span>-${formatCurrency(b.discount_amount)}</span></div>` : ''}
  <div class="row"><span class="label">${locale === 'lo' ? 'ອາກອນ' : 'VAT'} (${b.tax_rate}%)</span><span>${formatCurrency(b.tax_amount)}</span></div>
  
  <div class="total-section">
    <div class="row grand-total">
      <span>${locale === 'lo' ? 'ຍອດລວມ' : 'GRAND TOTAL'}</span>
      <span>${formatCurrency(b.grand_total)}</span>
    </div>
  </div>
  
  <div class="row"><span class="label">${locale === 'lo' ? 'ຊຳລະດ້ວຍ' : 'Paid by'}</span><span class="bold">${getPaymentMethodText(b.payment_method)}</span></div>
  <div class="row"><span class="label">${locale === 'lo' ? 'ສະຖານະ' : 'Status'}</span><span style="color: #059669;" class="bold">✓ ${locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'PAID'}</span></div>
  
  <div class="divider"></div>
  
  <div class="center footer">
    <p>${locale === 'lo' ? 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ' : 'Thank you for your visit!'}</p>
    <p>ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ: ${settings.tax_id || 'XXXXXXXXXX'}</p>
    <div class="qr-placeholder">QR Code</div>
    <p style="margin-top: 8px;">--- ${locale === 'lo' ? 'ກະລຸນາເກັບໄວ້ເປັນຫຼັກຖານ' : 'Please keep for your records'} ---</p>
  </div>
</body>
</html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader title={t('appointments.title')} subtitle={locale === 'lo' ? 'ຈັດການນັດໝາຍລູກຄ້າ' : 'Manage customer appointments'}
          action={<Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>{t('appointments.add')}</Button>} />

        {/* Date Navigation */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-lg">
                <Calendar className="w-5 h-5 text-rose-500" />
                <span className="font-semibold text-gray-900">{formatDateDisplay(selectedDate)}</span>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">{locale === 'lo' ? 'ທັງໝົດ' : 'Total'}: <strong>{formatNumber(dateStats.total)}</strong></span>
              <span className="text-amber-600">{locale === 'lo' ? 'ລໍຖ້າ' : 'Pending'}: <strong>{formatNumber(dateStats.pending)}</strong></span>
              <span className="text-blue-600">{locale === 'lo' ? 'ກຳລັງເຮັດ' : 'In Progress'}: <strong>{formatNumber(dateStats.in_progress)}</strong></span>
              <span className="text-emerald-600">{locale === 'lo' ? 'ສຳເລັດ' : 'Done'}: <strong>{formatNumber(dateStats.completed)}</strong></span>
              <span className="text-rose-600 font-bold">{formatCurrency(dateStats.revenue)}</span>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-white">
            <option value="">{t('common.all')} {locale === 'lo' ? 'ສະຖານະ' : 'Status'}</option>
            <option value="pending">{getStatusText('pending', locale)}</option>
            <option value="confirmed">{getStatusText('confirmed', locale)}</option>
            <option value="in_progress">{getStatusText('in_progress', locale)}</option>
            <option value="done">{getStatusText('done', locale)}</option>
            <option value="cancelled">{getStatusText('cancelled', locale)}</option>
          </select>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <Card><EmptyState icon={<Calendar className="w-8 h-8" />} title={locale === 'lo' ? 'ບໍ່ມີນັດໝາຍ' : 'No appointments'} action={<Button onClick={() => openModal()}>{t('appointments.add')}</Button>} /></Card>
          ) : (
            filteredAppointments.map((apt) => (
              <Card key={apt.id} hover className="p-0 overflow-hidden">
                <div className="flex">
                  <div className={`w-24 sm:w-28 p-4 flex flex-col items-center justify-center text-white ${apt.status === 'done' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : apt.status === 'cancelled' ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-rose-500 to-pink-500'}`}>
                    <Clock className="w-5 h-5 mb-1 opacity-80" />
                    <span className="text-xl font-bold">{apt.appointment_time.substring(0, 5)}</span>
                    <span className="text-xs opacity-80">{apt.duration} {locale === 'lo' ? 'ນາທີ' : 'min'}</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{apt.customer_name}</span>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-sm text-rose-600 font-medium">{locale === 'lo' ? apt.service_name_lo : apt.service_name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {apt.customer_phone}</span>
                          <span>{locale === 'lo' ? 'ພະນັກງານ' : 'Staff'}: {apt.staff_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(apt.total_price)}</span>
                          {apt.discount > 0 && <p className="text-xs text-red-500">-{formatCurrency(apt.discount)}</p>}
                        </div>
                        
                        {/* Action Buttons based on Status */}
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => updateAppointment(apt.id, { status: 'confirmed' })} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title={locale === 'lo' ? 'ຢືນຢັນ' : 'Confirm'}>
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => openModal(apt)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => updateAppointment(apt.id, { status: 'cancelled' })} className="p-2 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-red-500" /></button>
                          </>
                        )}
                        
                        {apt.status === 'confirmed' && (
                          <>
                            <button onClick={() => updateAppointment(apt.id, { status: 'in_progress' })} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title={locale === 'lo' ? 'ເລີ່ມ' : 'Start'}>
                              <Play className="w-4 h-4" />
                            </button>
                            <button onClick={() => openModal(apt)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => updateAppointment(apt.id, { status: 'cancelled' })} className="p-2 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-red-500" /></button>
                          </>
                        )}
                        
                        {apt.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="success" icon={<DollarSign className="w-4 h-4" />} onClick={() => openPaymentModal(apt)}>
                              {locale === 'lo' ? 'ຮັບເງິນ' : 'Payment'}
                            </Button>
                            <button onClick={() => updateAppointment(apt.id, { status: 'cancelled' })} className="p-2 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-red-500" /></button>
                          </>
                        )}
                        
                        {apt.status === 'done' && (
                          <Button size="sm" variant="secondary" icon={<Receipt className="w-4 h-4" />} onClick={() => viewBill(apt)}>
                            {locale === 'lo' ? 'ໃບເສັດ' : 'Receipt'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Appointment Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editItem ? t('common.edit') : t('appointments.add')} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('appointments.customer')} *</label>
              <input type="text" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder={locale === 'lo' ? 'ຄົ້ນຫາລູກຄ້າ...' : 'Search customer...'} required />
              {showCustomerDropdown && searchedCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchedCustomers.map(c => (
                    <button key={c.id} type="button" onClick={() => handleSelectCustomer(c)} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between">
                      <span className="font-medium">{c.name}</span><span className="text-gray-500 text-sm">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select label={t('appointments.service')} value={form.service_id} onChange={(e) => handleServiceChange(e.target.value)}
              options={services.filter(s => s.is_active).map(s => ({ value: s.id, label: `${locale === 'lo' ? s.name_lo : s.name} - ${formatCurrency(s.price)}` }))}
              placeholder={`-- ${locale === 'lo' ? 'ເລືອກບໍລິການ' : 'Select Service'} --`} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label={locale === 'lo' ? 'ລາຄາ' : 'Price'} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Input label={locale === 'lo' ? 'ສ່ວນຫຼຸດ' : 'Discount'} type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </div>
            <Select label={t('appointments.staff')} value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
              options={staffList.map(s => ({ value: s.id, label: s.full_name }))} placeholder={`-- ${locale === 'lo' ? 'ເລືອກພະນັກງານ' : 'Select Staff'} --`} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('appointments.date')} type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} required />
              <Input label={t('appointments.time')} type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} required />
            </div>
            <Input label={locale === 'lo' ? 'ໝາຍເຫດ' : 'Notes'} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1">{t('common.save')}</Button>
            </div>
          </form>
        </Modal>

        {/* Payment Modal */}
        <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={locale === 'lo' ? 'ຮັບເງິນ' : 'Receive Payment'} size="md">
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{locale === 'lo' ? 'ລູກຄ້າ' : 'Customer'}</span>
                  <span className="font-medium">{selectedAppointment.customer_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{locale === 'lo' ? 'ບໍລິການ' : 'Service'}</span>
                  <span className="font-medium">{locale === 'lo' ? selectedAppointment.service_name_lo : selectedAppointment.service_name}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{locale === 'lo' ? 'ລາຄາ' : 'Price'}</span>
                    <span>{formatCurrency(selectedAppointment.price)}</span>
                  </div>
                  {selectedAppointment.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{locale === 'lo' ? 'ສ່ວນຫຼຸດ' : 'Discount'}</span>
                      <span>-{formatCurrency(selectedAppointment.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">{locale === 'lo' ? 'ອາກອນ' : 'Tax'} ({settings.tax_rate}%)</span>
                    <span>{formatCurrency(Math.round((selectedAppointment.price - (selectedAppointment.discount || 0)) * settings.tax_rate / 100))}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
                    <span>{locale === 'lo' ? 'ຍອດລວມ' : 'Total'}</span>
                    <span className="text-rose-600">
                      {formatCurrency(selectedAppointment.price - (selectedAppointment.discount || 0) + Math.round((selectedAppointment.price - (selectedAppointment.discount || 0)) * settings.tax_rate / 100))}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'lo' ? 'ວິທີຊຳລະ' : 'Payment Method'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: locale === 'lo' ? 'ເງິນສົດ' : 'Cash', icon: Banknote, color: 'emerald' },
                    { value: 'transfer', label: locale === 'lo' ? 'ໂອນ' : 'Transfer', icon: Building, color: 'blue' },
                    { value: 'card', label: locale === 'lo' ? 'ບັດ' : 'Card', icon: CreditCard, color: 'purple' },
                  ].map(method => (
                    <button key={method.value} type="button" onClick={() => setPaymentMethod(method.value)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === method.value ? `border-${method.color}-500 bg-${method.color}-50` : 'border-gray-200 hover:border-gray-300'}`}>
                      <method.icon className={`w-6 h-6 ${paymentMethod === method.value ? `text-${method.color}-600` : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === method.value ? `text-${method.color}-700` : 'text-gray-600'}`}>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPaymentModal(false)}>{locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}</Button>
                <Button type="button" variant="success" className="flex-1" icon={<DollarSign className="w-5 h-5" />} onClick={processPayment}>
                  {locale === 'lo' ? 'ຢືນຢັນການຮັບເງິນ' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Bill/Receipt Modal */}
        <Modal isOpen={showBillModal} onClose={() => setShowBillModal(false)} title={`${locale === 'lo' ? 'ໃບຮັບເງິນ' : 'Receipt'}`} size="md">
          {currentBill && (
            <div>
              {/* Receipt Preview */}
              <div className="bg-white border rounded-xl p-6 font-mono text-sm max-h-[60vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <h2 className="text-lg font-bold">{settings.shop_name}</h2>
                  <p className="text-gray-600">{settings.shop_name_lo}</p>
                  <p className="text-xs text-gray-500 mt-1">{settings.address}</p>
                  <p className="text-xs text-gray-500">Tel: {settings.phone}</p>
                </div>

                {/* Bill Info */}
                <div className="text-center mb-4">
                  <p className="text-base font-bold">{locale === 'lo' ? 'ໃບຮັບເງິນ' : 'RECEIPT'}</p>
                  <p className="text-lg font-bold text-rose-600">#{currentBill.bill_number}</p>
                  <p className="text-xs text-gray-500">{currentBill.created_at} {currentBill.created_time || ''}</p>
                </div>

                {/* Customer Info */}
                <div className="border-t border-dashed pt-3 mb-3 space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">{locale === 'lo' ? 'ລູກຄ້າ' : 'Customer'}:</span><span className="font-medium">{currentBill.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{locale === 'lo' ? 'ເບີໂທ' : 'Phone'}:</span><span>{currentBill.customer_phone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{locale === 'lo' ? 'ພະນັກງານ' : 'Staff'}:</span><span>{currentBill.staff_name}</span></div>
                </div>

                {/* Service */}
                <div className="border-t border-b border-dashed py-3 mb-3">
                  <p className="font-medium">{locale === 'lo' ? currentBill.service_name_lo : currentBill.service_name}</p>
                  <p className="text-right font-medium">{formatCurrency(currentBill.subtotal)}</p>
                </div>

                {/* Totals */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between"><span className="text-gray-500">{locale === 'lo' ? 'ລາຄາ' : 'Subtotal'}</span><span>{formatCurrency(currentBill.subtotal)}</span></div>
                  {currentBill.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600"><span>{locale === 'lo' ? 'ສ່ວນຫຼຸດ' : 'Discount'}</span><span>-{formatCurrency(currentBill.discount_amount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">{locale === 'lo' ? 'ອາກອນ' : 'VAT'} ({currentBill.tax_rate}%)</span><span>{formatCurrency(currentBill.tax_amount)}</span></div>
                </div>

                {/* Grand Total */}
                <div className="bg-gray-100 -mx-6 px-6 py-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{locale === 'lo' ? 'ຍອດລວມ' : 'GRAND TOTAL'}</span>
                    <span className="text-2xl font-bold text-rose-600">{formatCurrency(currentBill.grand_total)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'lo' ? 'ຊຳລະດ້ວຍ' : 'Paid by'}</span>
                    <span className="font-medium">{getPaymentMethodText(currentBill.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{locale === 'lo' ? 'ສະຖານະ' : 'Status'}</span>
                    <span className="text-emerald-600 font-bold">✓ {locale === 'lo' ? 'ຊຳລະແລ້ວ' : 'PAID'}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center border-t pt-4 text-xs text-gray-500">
                  <p className="font-medium">{locale === 'lo' ? 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ' : 'Thank you for your visit!'}</p>
                  <p className="mt-2">{locale === 'lo' ? 'ກະລຸນາເກັບໄວ້ເປັນຫຼັກຖານ' : 'Please keep for your records'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowBillModal(false)}>{locale === 'lo' ? 'ປິດ' : 'Close'}</Button>
                <Button className="flex-1" icon={<Printer className="w-5 h-5" />} onClick={printBill}>{locale === 'lo' ? 'ພິມໃບເສັດ' : 'Print Receipt'}</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
}
