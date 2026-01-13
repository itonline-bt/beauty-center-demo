'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'lo' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  lo: {
    // Navigation
    'nav.dashboard': 'ໜ້າຫຼັກ',
    'nav.appointments': 'ນັດໝາຍ',
    'nav.customers': 'ລູກຄ້າ',
    'nav.services': 'ບໍລິການ',
    'nav.inventory': 'ສິນຄ້າຄົງຄັງ',
    'nav.stock': 'ຈັດການສະຕັອກ',
    'nav.billing': 'ໃບບິນ',
    'nav.reports': 'ລາຍງານ',
    'nav.users': 'ຜູ້ໃຊ້',
    'nav.settings': 'ຕັ້ງຄ່າ',
    'nav.notifications': 'ແຈ້ງເຕືອນ',
    'nav.profile': 'ໂປຣໄຟລ໌',
    'nav.logout': 'ອອກຈາກລະບົບ',
    
    // Common
    'common.search': 'ຄົ້ນຫາ...',
    'common.add': 'ເພີ່ມ',
    'common.edit': 'ແກ້ໄຂ',
    'common.delete': 'ລຶບ',
    'common.save': 'ບັນທຶກ',
    'common.cancel': 'ຍົກເລີກ',
    'common.confirm': 'ຢືນຢັນ',
    'common.actions': 'ການດຳເນີນການ',
    'common.status': 'ສະຖານະ',
    'common.all': 'ທັງໝົດ',
    'common.loading': 'ກຳລັງໂຫຼດ...',
    'common.no_data': 'ບໍ່ມີຂໍ້ມູນ',
    'common.demo_mode': '🎯 ໂໝດ Demo - ຂໍ້ມູນບໍ່ໄດ້ບັນທຶກຖາວອນ',
    
    // Dashboard
    'dashboard.title': 'ພາບລວມ',
    'dashboard.today_revenue': 'ລາຍຮັບມື້ນີ້',
    'dashboard.week_revenue': 'ລາຍຮັບອາທິດນີ້',
    'dashboard.month_revenue': 'ລາຍຮັບເດືອນນີ້',
    'dashboard.today_appointments': 'ນັດໝາຍມື້ນີ້',
    'dashboard.total_customers': 'ລູກຄ້າທັງໝົດ',
    'dashboard.low_stock': 'ສິນຄ້າໃກ້ໝົດ',
    'dashboard.top_services': 'ບໍລິການຍອດນິຍົມ',
    
    // Auth
    'auth.login': 'ເຂົ້າສູ່ລະບົບ',
    'auth.email': 'ອີເມວ',
    'auth.password': 'ລະຫັດຜ່ານ',
    'auth.login_button': 'ເຂົ້າສູ່ລະບົບ',
    'auth.demo_accounts': 'ບັນຊີ Demo',
    'auth.invalid': 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ',
    
    // Users
    'users.title': 'ຈັດການຜູ້ໃຊ້',
    'users.add': 'ເພີ່ມຜູ້ໃຊ້ໃໝ່',
    'users.name': 'ຊື່',
    'users.email': 'ອີເມວ',
    'users.phone': 'ເບີໂທ',
    'users.role': 'ບົດບາດ',
    'users.admin': 'ແອດມິນ',
    'users.manager': 'ຜູ້ຈັດການ',
    'users.staff': 'ພະນັກງານ',
    
    // Appointments
    'appointments.title': 'ນັດໝາຍ',
    'appointments.add': 'ນັດໝາຍໃໝ່',
    'appointments.customer': 'ລູກຄ້າ',
    'appointments.service': 'ບໍລິການ',
    'appointments.date': 'ວັນທີ',
    'appointments.time': 'ເວລາ',
    'appointments.staff': 'ພະນັກງານ',
    
    // Customers
    'customers.title': 'ລູກຄ້າ',
    'customers.add': 'ເພີ່ມລູກຄ້າໃໝ່',
    'customers.name': 'ຊື່ລູກຄ້າ',
    'customers.phone': 'ເບີໂທ',
    'customers.email': 'ອີເມວ',
    'customers.visits': 'ຈຳນວນຄັ້ງ',
    'customers.spent': 'ຈ່າຍທັງໝົດ',
    
    // Services
    'services.title': 'ບໍລິການ',
    'services.add': 'ເພີ່ມບໍລິການໃໝ່',
    'services.name': 'ຊື່ບໍລິການ',
    'services.category': 'ໝວດໝູ່',
    'services.price': 'ລາຄາ',
    'services.duration': 'ໄລຍະເວລາ (ນາທີ)',
    
    // Inventory
    'inventory.title': 'ສິນຄ້າຄົງຄັງ',
    'inventory.add': 'ເພີ່ມສິນຄ້າໃໝ່',
    'inventory.name': 'ຊື່ສິນຄ້າ',
    'inventory.sku': 'ລະຫັດສິນຄ້າ',
    'inventory.quantity': 'ຈຳນວນ',
    'inventory.min_quantity': 'ຈຳນວນຕໍ່າສຸດ',
    'inventory.cost': 'ລາຄາຕົ້ນທຶນ',
    'inventory.sell': 'ລາຄາຂາຍ',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.appointments': 'Appointments',
    'nav.customers': 'Customers',
    'nav.services': 'Services',
    'nav.inventory': 'Inventory',
    'nav.stock': 'Stock Management',
    'nav.billing': 'Billing',
    'nav.reports': 'Reports',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Common
    'common.search': 'Search...',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.no_data': 'No data',
    'common.demo_mode': '🎯 Demo Mode - Data is not permanently saved',
    
    // Dashboard
    'dashboard.title': 'Overview',
    'dashboard.today_revenue': 'Today Revenue',
    'dashboard.week_revenue': 'Week Revenue',
    'dashboard.month_revenue': 'Month Revenue',
    'dashboard.today_appointments': 'Today Appointments',
    'dashboard.total_customers': 'Total Customers',
    'dashboard.low_stock': 'Low Stock Items',
    'dashboard.top_services': 'Top Services',
    
    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login_button': 'Sign In',
    'auth.demo_accounts': 'Demo Accounts',
    'auth.invalid': 'Invalid email or password',
    
    // Users
    'users.title': 'User Management',
    'users.add': 'Add New User',
    'users.name': 'Name',
    'users.email': 'Email',
    'users.phone': 'Phone',
    'users.role': 'Role',
    'users.admin': 'Admin',
    'users.manager': 'Manager',
    'users.staff': 'Staff',
    
    // Appointments
    'appointments.title': 'Appointments',
    'appointments.add': 'New Appointment',
    'appointments.customer': 'Customer',
    'appointments.service': 'Service',
    'appointments.date': 'Date',
    'appointments.time': 'Time',
    'appointments.staff': 'Staff',
    
    // Customers
    'customers.title': 'Customers',
    'customers.add': 'Add New Customer',
    'customers.name': 'Customer Name',
    'customers.phone': 'Phone',
    'customers.email': 'Email',
    'customers.visits': 'Visits',
    'customers.spent': 'Total Spent',
    
    // Services
    'services.title': 'Services',
    'services.add': 'Add New Service',
    'services.name': 'Service Name',
    'services.category': 'Category',
    'services.price': 'Price',
    'services.duration': 'Duration (min)',
    
    // Inventory
    'inventory.title': 'Inventory',
    'inventory.add': 'Add New Item',
    'inventory.name': 'Item Name',
    'inventory.sku': 'SKU',
    'inventory.quantity': 'Quantity',
    'inventory.min_quantity': 'Min Quantity',
    'inventory.cost': 'Cost Price',
    'inventory.sell': 'Sell Price',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('lo');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
