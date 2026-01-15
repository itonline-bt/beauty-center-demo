'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'lo' | 'en';
type Currency = 'LAK' | 'THB' | 'USD' | 'CNY';

interface CurrencyConfig {
  symbol: string;
  name: string;
  name_lo: string;
  rate: number;
  decimals: number;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number, showSymbol?: boolean) => string;
  formatCurrencyWithCode: (amount: number) => string;
  convertCurrency: (amountInLAK: number, toCurrency?: Currency) => number;
  convertToLAK: (amount: number, fromCurrency: Currency) => number;
  getCurrencyConfig: (curr?: Currency) => CurrencyConfig;
  availableCurrencies: Currency[];
  exchangeRates: Record<Currency, number>;
  updateExchangeRate: (currency: Currency, rate: number) => void;
  resetExchangeRates: () => void;
}

// Default exchange rates (base: LAK)
const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  LAK: 1,
  THB: 435,      // 1 THB = 435 LAK
  USD: 21250,    // 1 USD = 21,250 LAK  
  CNY: 2940,     // 1 CNY = 2,940 LAK
};

const CURRENCY_CONFIG: Record<Currency, Omit<CurrencyConfig, 'rate'>> = {
  LAK: { symbol: '₭', name: 'Lao Kip', name_lo: 'ກີບ', decimals: 0 },
  THB: { symbol: '฿', name: 'Thai Baht', name_lo: 'ບາດ', decimals: 2 },
  USD: { symbol: '$', name: 'US Dollar', name_lo: 'ໂດລາ', decimals: 2 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', name_lo: 'ຢວນ', decimals: 2 },
};

const translations: Record<Locale, Record<string, string>> = {
  lo: {
    'nav.dashboard': 'ໜ້າຫຼັກ', 'nav.appointments': 'ນັດໝາຍ', 'nav.customers': 'ລູກຄ້າ',
    'nav.services': 'ບໍລິການ', 'nav.inventory': 'ສິນຄ້າຄົງຄັງ', 'nav.stock': 'ຈັດການສະຕັອກ',
    'nav.billing': 'ໃບບິນ', 'nav.incomeExpense': 'ລາຍຮັບ-ລາຍຈ່າຍ', 'nav.reports': 'ລາຍງານ',
    'nav.users': 'ຜູ້ໃຊ້', 'nav.settings': 'ຕັ້ງຄ່າ', 'nav.notifications': 'ແຈ້ງເຕືອນ',
    'nav.profile': 'ໂປຣໄຟລ໌', 'nav.logout': 'ອອກຈາກລະບົບ',
    'common.search': 'ຄົ້ນຫາ...', 'common.add': 'ເພີ່ມ', 'common.edit': 'ແກ້ໄຂ',
    'common.delete': 'ລຶບ', 'common.save': 'ບັນທຶກ', 'common.cancel': 'ຍົກເລີກ',
    'common.confirm': 'ຢືນຢັນ', 'common.actions': 'ການດຳເນີນການ', 'common.status': 'ສະຖານະ',
    'common.all': 'ທັງໝົດ', 'common.loading': 'ກຳລັງໂຫຼດ...', 'common.no_data': 'ບໍ່ມີຂໍ້ມູນ',
    'common.demo_mode': '🎯 ໂໝດ Demo - ຂໍ້ມູນບໍ່ໄດ້ບັນທຶກຖາວອນ',
    'dashboard.title': 'ພາບລວມ', 'dashboard.today_revenue': 'ລາຍຮັບມື້ນີ້',
    'dashboard.week_revenue': 'ລາຍຮັບອາທິດນີ້', 'dashboard.month_revenue': 'ລາຍຮັບເດືອນນີ້',
    'dashboard.today_appointments': 'ນັດໝາຍມື້ນີ້', 'dashboard.total_customers': 'ລູກຄ້າທັງໝົດ',
    'dashboard.low_stock': 'ສິນຄ້າໃກ້ໝົດ', 'dashboard.top_services': 'ບໍລິການຍອດນິຍົມ',
    'auth.login': 'ເຂົ້າສູ່ລະບົບ', 'auth.email': 'ອີເມວ', 'auth.password': 'ລະຫັດຜ່ານ',
    'auth.login_button': 'ເຂົ້າສູ່ລະບົບ', 'auth.demo_accounts': 'ບັນຊີ Demo',
    'auth.invalid': 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ',
    'users.title': 'ຈັດການຜູ້ໃຊ້', 'users.add': 'ເພີ່ມຜູ້ໃຊ້ໃໝ່', 'users.name': 'ຊື່',
    'users.email': 'ອີເມວ', 'users.phone': 'ເບີໂທ', 'users.role': 'ບົດບາດ',
    'users.admin': 'ແອດມິນ', 'users.manager': 'ຜູ້ຈັດການ', 'users.staff': 'ພະນັກງານ',
    'appointments.title': 'ນັດໝາຍ', 'appointments.add': 'ນັດໝາຍໃໝ່',
    'appointments.customer': 'ລູກຄ້າ', 'appointments.service': 'ບໍລິການ',
    'appointments.date': 'ວັນທີ', 'appointments.time': 'ເວລາ', 'appointments.staff': 'ພະນັກງານ',
    'appointments.deposit': 'ເງິນມັດຈຳ', 'appointments.deposit_paid': 'ຈ່າຍມັດຈຳແລ້ວ',
    'appointments.deposit_pending': 'ລໍຖ້າມັດຈຳ', 'appointments.remaining': 'ຍອດຄ້າງຊຳລະ',
    'customers.title': 'ລູກຄ້າ', 'customers.add': 'ເພີ່ມລູກຄ້າໃໝ່', 'customers.name': 'ຊື່ລູກຄ້າ',
    'customers.phone': 'ເບີໂທ', 'customers.email': 'ອີເມວ', 'customers.visits': 'ຈຳນວນຄັ້ງ',
    'customers.spent': 'ຈ່າຍທັງໝົດ',
    'services.title': 'ບໍລິການ', 'services.add': 'ເພີ່ມບໍລິການໃໝ່', 'services.name': 'ຊື່ບໍລິການ',
    'services.category': 'ໝວດໝູ່', 'services.price': 'ລາຄາ', 'services.duration': 'ໄລຍະເວລາ (ນາທີ)',
    'inventory.title': 'ສິນຄ້າຄົງຄັງ', 'inventory.add': 'ເພີ່ມສິນຄ້າໃໝ່', 'inventory.name': 'ຊື່ສິນຄ້າ',
    'inventory.sku': 'ລະຫັດສິນຄ້າ', 'inventory.quantity': 'ຈຳນວນ', 'inventory.min_quantity': 'ຈຳນວນຕໍ່າສຸດ',
    'inventory.cost': 'ລາຄາຕົ້ນທຶນ', 'inventory.sell': 'ລາຄາຂາຍ',
    'currency.title': 'ສະກຸນເງິນ', 'currency.LAK': 'ກີບ', 'currency.THB': 'ບາດ',
    'currency.USD': 'ໂດລາ', 'currency.CNY': 'ຢວນ', 'currency.exchange_rate': 'ອັດຕາແລກປ່ຽນ',
    'payment.cash': 'ເງິນສົດ', 'payment.transfer': 'ໂອນເງິນ', 'payment.card': 'ບັດ',
    'payment.method': 'ວິທີຊຳລະ', 'payment.receive': 'ຮັບເງິນ', 'payment.paid': 'ຊຳລະແລ້ວ',
    'payment.pending': 'ລໍຖ້າຊຳລະ',
  },
  en: {
    'nav.dashboard': 'Dashboard', 'nav.appointments': 'Appointments', 'nav.customers': 'Customers',
    'nav.services': 'Services', 'nav.inventory': 'Inventory', 'nav.stock': 'Stock Management',
    'nav.billing': 'Billing', 'nav.incomeExpense': 'Income & Expense', 'nav.reports': 'Reports',
    'nav.users': 'Users', 'nav.settings': 'Settings', 'nav.notifications': 'Notifications',
    'nav.profile': 'Profile', 'nav.logout': 'Logout',
    'common.search': 'Search...', 'common.add': 'Add', 'common.edit': 'Edit',
    'common.delete': 'Delete', 'common.save': 'Save', 'common.cancel': 'Cancel',
    'common.confirm': 'Confirm', 'common.actions': 'Actions', 'common.status': 'Status',
    'common.all': 'All', 'common.loading': 'Loading...', 'common.no_data': 'No data',
    'common.demo_mode': '🎯 Demo Mode - Data is not permanently saved',
    'dashboard.title': 'Overview', 'dashboard.today_revenue': 'Today Revenue',
    'dashboard.week_revenue': 'Week Revenue', 'dashboard.month_revenue': 'Month Revenue',
    'dashboard.today_appointments': 'Today Appointments', 'dashboard.total_customers': 'Total Customers',
    'dashboard.low_stock': 'Low Stock Items', 'dashboard.top_services': 'Top Services',
    'auth.login': 'Login', 'auth.email': 'Email', 'auth.password': 'Password',
    'auth.login_button': 'Sign In', 'auth.demo_accounts': 'Demo Accounts',
    'auth.invalid': 'Invalid email or password',
    'users.title': 'User Management', 'users.add': 'Add New User', 'users.name': 'Name',
    'users.email': 'Email', 'users.phone': 'Phone', 'users.role': 'Role',
    'users.admin': 'Admin', 'users.manager': 'Manager', 'users.staff': 'Staff',
    'appointments.title': 'Appointments', 'appointments.add': 'New Appointment',
    'appointments.customer': 'Customer', 'appointments.service': 'Service',
    'appointments.date': 'Date', 'appointments.time': 'Time', 'appointments.staff': 'Staff',
    'appointments.deposit': 'Deposit', 'appointments.deposit_paid': 'Deposit Paid',
    'appointments.deposit_pending': 'Deposit Pending', 'appointments.remaining': 'Remaining Balance',
    'customers.title': 'Customers', 'customers.add': 'Add New Customer', 'customers.name': 'Customer Name',
    'customers.phone': 'Phone', 'customers.email': 'Email', 'customers.visits': 'Visits',
    'customers.spent': 'Total Spent',
    'services.title': 'Services', 'services.add': 'Add New Service', 'services.name': 'Service Name',
    'services.category': 'Category', 'services.price': 'Price', 'services.duration': 'Duration (min)',
    'inventory.title': 'Inventory', 'inventory.add': 'Add New Item', 'inventory.name': 'Item Name',
    'inventory.sku': 'SKU', 'inventory.quantity': 'Quantity', 'inventory.min_quantity': 'Min Quantity',
    'inventory.cost': 'Cost Price', 'inventory.sell': 'Sell Price',
    'currency.title': 'Currency', 'currency.LAK': 'Kip', 'currency.THB': 'Baht',
    'currency.USD': 'Dollar', 'currency.CNY': 'Yuan', 'currency.exchange_rate': 'Exchange Rate',
    'payment.cash': 'Cash', 'payment.transfer': 'Transfer', 'payment.card': 'Card',
    'payment.method': 'Payment Method', 'payment.receive': 'Receive Payment', 'payment.paid': 'Paid',
    'payment.pending': 'Pending',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('lo');
  const [currency, setCurrency] = useState<Currency>('LAK');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(DEFAULT_EXCHANGE_RATES);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    const savedCurrency = localStorage.getItem('currency') as Currency;
    const savedRates = localStorage.getItem('exchangeRates');
    
    if (savedLocale) setLocale(savedLocale);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedRates) {
      try {
        setExchangeRates(JSON.parse(savedRates));
      } catch (e) {
        setExchangeRates(DEFAULT_EXCHANGE_RATES);
      }
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const updateExchangeRate = (curr: Currency, rate: number) => {
    const newRates = { ...exchangeRates, [curr]: rate };
    setExchangeRates(newRates);
    localStorage.setItem('exchangeRates', JSON.stringify(newRates));
  };

  const resetExchangeRates = () => {
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
    localStorage.setItem('exchangeRates', JSON.stringify(DEFAULT_EXCHANGE_RATES));
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const getCurrencyConfig = (curr?: Currency): CurrencyConfig => {
    const targetCurrency = curr || currency;
    return { ...CURRENCY_CONFIG[targetCurrency], rate: exchangeRates[targetCurrency] };
  };

  const convertCurrency = (amountInLAK: number, toCurrency?: Currency): number => {
    const targetCurrency = toCurrency || currency;
    const rate = exchangeRates[targetCurrency];
    return amountInLAK / rate;
  };

  const convertToLAK = (amount: number, fromCurrency: Currency): number => {
    const rate = exchangeRates[fromCurrency];
    return amount * rate;
  };

  const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
    const config = getCurrencyConfig(currency);
    const convertedAmount = convertCurrency(amount, currency);
    
    const formatted = new Intl.NumberFormat(locale === 'lo' ? 'lo-LA' : 'en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(convertedAmount);
    
    return showSymbol ? `${formatted} ${config.symbol}` : formatted;
  };

  const formatCurrencyWithCode = (amount: number): string => {
    const config = getCurrencyConfig(currency);
    const convertedAmount = convertCurrency(amount, currency);
    
    const formatted = new Intl.NumberFormat(locale === 'lo' ? 'lo-LA' : 'en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(convertedAmount);
    
    return `${formatted} ${currency}`;
  };

  return (
    <I18nContext.Provider value={{ 
      locale, setLocale: handleSetLocale, 
      currency, setCurrency: handleSetCurrency,
      t, formatCurrency, formatCurrencyWithCode,
      convertCurrency, convertToLAK, getCurrencyConfig,
      availableCurrencies: ['LAK', 'THB', 'USD', 'CNY'],
      exchangeRates,
      updateExchangeRate,
      resetExchangeRates,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
