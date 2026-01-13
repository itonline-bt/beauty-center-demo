'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockUsers, mockCustomers, mockServices, mockServiceCategories,
  mockInventory, mockInventoryCategories, mockAppointments, mockBills,
  mockNotifications, mockSettings, mockExpenseCategories, mockTransactions,
  mockStockMovements, getDashboardStats,
} from './mockData';

// AUTH STORE
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'demo123') {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

// DATA STORE
interface DataState {
  users: typeof mockUsers;
  customers: typeof mockCustomers;
  services: typeof mockServices;
  serviceCategories: typeof mockServiceCategories;
  inventory: typeof mockInventory;
  inventoryCategories: typeof mockInventoryCategories;
  appointments: typeof mockAppointments;
  bills: typeof mockBills;
  notifications: any[];
  settings: typeof mockSettings;
  expenseCategories: typeof mockExpenseCategories;
  transactions: typeof mockTransactions;
  stockMovements: typeof mockStockMovements;
  
  getDashboard: () => ReturnType<typeof getDashboardStats>;
  
  // Users
  addUser: (user: any) => void;
  updateUser: (id: number, data: any) => void;
  deleteUser: (id: number) => void;
  
  // Customers
  addCustomer: (customer: any) => void;
  updateCustomer: (id: number, data: any) => void;
  deleteCustomer: (id: number) => void;
  searchCustomers: (query: string) => any[];
  
  // Services
  addService: (service: any) => void;
  updateService: (id: number, data: any) => void;
  deleteService: (id: number) => void;
  
  // Inventory
  addInventoryItem: (item: any) => void;
  updateInventoryItem: (id: number, data: any) => void;
  deleteInventoryItem: (id: number) => void;
  updateInventoryImage: (id: number, imageData: string) => void;
  adjustStock: (id: number, quantity: number, type: 'in' | 'out', reason: string, userName?: string) => void;
  
  // Appointments
  addAppointment: (appointment: any) => void;
  updateAppointment: (id: number, data: any) => void;
  deleteAppointment: (id: number) => void;
  
  // Bills
  addBill: (bill: any) => void;
  getBillById: (id: number) => any;
  
  // Notifications
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: any) => void;
  deleteNotification: (id: number) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
  
  // Settings
  updateSettings: (data: any) => void;
  
  // Transactions
  addTransaction: (transaction: any) => void;
  deleteTransaction: (id: number) => void;
  getFinancialSummary: (startDate: string, endDate: string) => any;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: [...mockUsers],
      customers: [...mockCustomers],
      services: [...mockServices],
      serviceCategories: [...mockServiceCategories],
      inventory: [...mockInventory],
      inventoryCategories: [...mockInventoryCategories],
      appointments: [...mockAppointments],
      bills: [...mockBills],
      notifications: [...mockNotifications],
      settings: { ...mockSettings },
      expenseCategories: [...mockExpenseCategories],
      transactions: [...mockTransactions],
      stockMovements: [...mockStockMovements],
      
      getDashboard: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = state.appointments.filter(a => a.appointment_date === today);
        const completedToday = todayAppts.filter(a => a.status === 'done');
        const lowStock = state.inventory.filter(i => i.quantity <= i.min_quantity);
        
        return {
          revenue: {
            today: completedToday.reduce((s, a) => s + a.total_price, 0),
            week: state.bills.slice(0, 20).reduce((s, b) => s + b.grand_total, 0),
            month: state.bills.reduce((s, b) => s + b.grand_total, 0),
          },
          appointments: {
            today: todayAppts.length,
            pending: todayAppts.filter(a => a.status === 'pending').length,
            confirmed: todayAppts.filter(a => a.status === 'confirmed').length,
            in_progress: todayAppts.filter(a => a.status === 'in_progress').length,
            completed: completedToday.length,
          },
          customers: { total: state.customers.length, new_this_month: 3 },
          inventory: { low_stock: lowStock.length, low_stock_items: lowStock },
          top_services: state.services.slice(0, 5).map(s => ({ ...s, booking_count: Math.floor(Math.random() * 20) + 5 })),
        };
      },
      
      // Users CRUD
      addUser: (user) => set(state => ({
        users: [...state.users, { ...user, id: Math.max(...state.users.map(u => u.id)) + 1, created_at: new Date().toISOString().split('T')[0] }]
      })),
      updateUser: (id, data) => set(state => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      deleteUser: (id) => set(state => ({ users: state.users.filter(u => u.id !== id) })),
      
      // Customers CRUD
      addCustomer: (customer) => set(state => ({
        customers: [...state.customers, { ...customer, id: Math.max(...state.customers.map(c => c.id)) + 1, total_visits: 0, total_spent: 0, is_active: true, created_at: new Date().toISOString().split('T')[0] }]
      })),
      updateCustomer: (id, data) => set(state => ({ customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCustomer: (id) => set(state => ({ customers: state.customers.filter(c => c.id !== id) })),
      searchCustomers: (query) => {
        const state = get();
        if (query.length < 2) return [];
        return state.customers.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) || 
          c.phone.includes(query)
        ).slice(0, 10);
      },
      
      // Services CRUD
      addService: (service) => set(state => ({
        services: [...state.services, { ...service, id: Math.max(...state.services.map(s => s.id)) + 1, is_active: true }]
      })),
      updateService: (id, data) => set(state => ({ services: state.services.map(s => s.id === id ? { ...s, ...data } : s) })),
      deleteService: (id) => set(state => ({ services: state.services.filter(s => s.id !== id) })),
      
      // Inventory CRUD
      addInventoryItem: (item) => set(state => ({
        inventory: [...state.inventory, { ...item, id: Math.max(...state.inventory.map(i => i.id)) + 1, is_active: true }]
      })),
      updateInventoryItem: (id, data) => set(state => ({ inventory: state.inventory.map(i => i.id === id ? { ...i, ...data } : i) })),
      deleteInventoryItem: (id) => set(state => ({ inventory: state.inventory.filter(i => i.id !== id) })),
      
      // Update inventory image
      updateInventoryImage: (id, imageData) =>
        set(state => ({
          inventory: state.inventory.map(i =>
            i.id === id ? { ...i, image_url: imageData } : i
          )
      })),
      
      // Adjust stock with notification
      adjustStock: (id, quantity, type, reason, userName = 'Admin') => set(state => {
        const item = state.inventory.find(i => i.id === id);
        if (!item) return state;
        
        const previousQty = item.quantity;
        const newQty = type === 'in' ? previousQty + quantity : Math.max(0, previousQty - quantity);
        
        const movement = {
          id: Math.max(...state.stockMovements.map(m => m.id), 0) + 1,
          inventory_id: id, inventory_name: item.name, inventory_name_lo: item.name_lo,
          type, quantity, previous_qty: previousQty, new_qty: newQty,
          reason, reason_lo: reason,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          created_by: 1, created_by_name: userName,
        };
        
        // Create notification for stock out (เบิกสินค้า)
        const notifications = [...state.notifications];
        if (type === 'out') {
          const newNotification = {
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Stock Deducted',
            title_lo: 'ເບີກສິນຄ້າ',
            message: `${userName} deducted ${quantity} ${item.unit} of "${item.name}" - Reason: ${reason}`,
            message_lo: `${userName} ເບີກ ${quantity} ${item.unit} ຂອງ "${item.name_lo || item.name}" - ເຫດຜົນ: ${reason}`,
            type: 'stock_out',
            item_name: item.name,
            item_name_lo: item.name_lo,
            quantity: quantity,
            previous_qty: previousQty,
            new_qty: newQty,
            reason: reason,
            user_name: userName,
            is_read: false,
            created_at: new Date().toISOString(),
            for_role: 'admin', // แจ้งเตือนไปหา admin
          };
          notifications.unshift(newNotification);
        }
        
        // Create low stock notification
        if (newQty <= item.min_quantity && newQty > 0) {
          const existingLowStockNotif = notifications.find(n => n.type === 'low_stock' && n.inventory_id === id && !n.is_read);
          if (!existingLowStockNotif) {
            notifications.unshift({
              id: Math.max(...notifications.map(n => n.id), 0) + 1,
              title: 'Low Stock Alert',
              title_lo: 'ສິນຄ້າໃກ້ໝົດ',
              message: `"${item.name}" is running low (${newQty} remaining, minimum: ${item.min_quantity})`,
              message_lo: `"${item.name_lo || item.name}" ໃກ້ຈະໝົດ (ເຫຼືອ ${newQty}, ຕ່ຳສຸດ: ${item.min_quantity})`,
              type: 'low_stock',
              inventory_id: id,
              is_read: false,
              created_at: new Date().toISOString(),
              for_role: 'admin',
            });
          }
        }
        
        // Create out of stock notification
        if (newQty === 0) {
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Out of Stock',
            title_lo: 'ສິນຄ້າໝົດແລ້ວ',
            message: `"${item.name}" is now out of stock!`,
            message_lo: `"${item.name_lo || item.name}" ໝົດສະຕັອກແລ້ວ!`,
            type: 'out_of_stock',
            inventory_id: id,
            is_read: false,
            created_at: new Date().toISOString(),
            for_role: 'admin',
          });
        }
        
        return {
          inventory: state.inventory.map(i => i.id === id ? { ...i, quantity: newQty } : i),
          stockMovements: [movement, ...state.stockMovements],
          notifications,
        };
      }),
      
      // Appointments CRUD
      addAppointment: (appointment) => set(state => {
        const newAppt = { ...appointment, id: Math.max(...state.appointments.map(a => a.id)) + 1, created_at: new Date().toISOString().split('T')[0] };
        
        // Add notification for new appointment
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'New Appointment',
          title_lo: 'ນັດໝາຍໃໝ່',
          message: `New appointment: ${appointment.customer_name} - ${appointment.service_name} at ${appointment.appointment_time}`,
          message_lo: `ນັດໝາຍໃໝ່: ${appointment.customer_name} - ${appointment.service_name_lo || appointment.service_name} ເວລາ ${appointment.appointment_time}`,
          type: 'appointment',
          appointment_id: newAppt.id,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        
        return { appointments: [...state.appointments, newAppt], notifications };
      }),
      updateAppointment: (id, data) => set(state => ({ appointments: state.appointments.map(a => a.id === id ? { ...a, ...data } : a) })),
      deleteAppointment: (id) => set(state => ({ appointments: state.appointments.filter(a => a.id !== id) })),
      
      // Bills
      addBill: (bill) => set(state => {
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Payment Received',
          title_lo: 'ຮັບການຊຳລະແລ້ວ',
          message: `Payment of ${bill.grand_total.toLocaleString()} LAK received from ${bill.customer_name}`,
          message_lo: `ໄດ້ຮັບການຊຳລະ ${bill.grand_total.toLocaleString()} ກີບ ຈາກ ${bill.customer_name}`,
          type: 'payment',
          bill_id: bill.id,
          amount: bill.grand_total,
          is_read: false,
          created_at: new Date().toISOString(),
        });
        return { bills: [bill, ...state.bills], notifications };
      }),
      getBillById: (id) => get().bills.find(b => b.id === id),
      
      // Notifications
      markNotificationRead: (id) => set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) })),
      markAllNotificationsRead: () => set(state => ({ notifications: state.notifications.map(n => ({ ...n, is_read: true })) })),
      addNotification: (notif) => set(state => ({
        notifications: [{ ...notif, id: Math.max(...state.notifications.map(n => n.id), 0) + 1, created_at: new Date().toISOString() }, ...state.notifications]
      })),
      deleteNotification: (id) => set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),
      clearAllNotifications: () => set({ notifications: [] }),
      getUnreadCount: () => get().notifications.filter(n => !n.is_read).length,
      
      // Settings
      updateSettings: (data) => set(state => ({ settings: { ...state.settings, ...data } })),
      
      // Transactions
      addTransaction: (transaction) => set(state => ({
        transactions: [{
          ...transaction,
          id: Math.max(...state.transactions.map(t => t.id), 0) + 1,
          reference: `${transaction.type === 'income' ? 'INC' : 'EXP'}-2025-${String(state.transactions.length + 1).padStart(4, '0')}`,
          date: transaction.date || new Date().toISOString().split('T')[0],
        }, ...state.transactions]
      })),
      deleteTransaction: (id) => set(state => ({ transactions: state.transactions.filter(t => t.id !== id) })),
      
      getFinancialSummary: (startDate, endDate) => {
        const state = get();
        const filtered = state.transactions.filter(t => t.date >= startDate && t.date <= endDate);
        const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        
        const expenseByCategory = filtered.filter(t => t.type === 'expense').reduce((acc, t) => {
          acc[t.category_name] = (acc[t.category_name] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
        
        return { totalIncome: income, totalExpenses: expenses, netProfit: income - expenses, expenseByCategory, transactionCount: filtered.length };
      },
    }),
    { name: 'demo-data-storage' }
  )
);
