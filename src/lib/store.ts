'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockUsers, mockCustomers, mockServices, mockServiceCategories,
  mockInventory, mockInventoryCategories, mockAppointments, mockBills,
  mockNotifications, mockSettings, mockExpenseCategories, mockTransactions,
  mockStockMovements, getDashboardStats,
} from './mockData';

// BRANCH DATA
export const mockBranches = [
  { id: 1, name: 'ສາຂາຫຼັກ (ດົງໂດກ)', name_en: 'Main Branch (Dongdok)', code: 'MAIN', address: 'ຖະໜົນ 13 ເໜືອ, ບ້ານດົງໂດກ', phone: '021 312 456', is_active: true, created_at: '2024-01-01' },
  { id: 2, name: 'ສາຂາທາດຫຼວງ', name_en: 'That Luang Branch', code: 'TL', address: 'ຖະໜົນທາດຫຼວງ, ບ້ານທາດຫຼວງ', phone: '021 413 789', is_active: true, created_at: '2024-03-01' },
  { id: 3, name: 'ສາຂາໂພນຕ້ອງ', name_en: 'Phonetong Branch', code: 'PT', address: 'ຖະໜົນໂພນຕ້ອງ, ບ້ານໂພນຕ້ອງ', phone: '021 515 123', is_active: true, created_at: '2024-06-01' },
];

// User branch access
export const mockUserBranches = [
  { user_id: 1, branch_id: 1 }, { user_id: 1, branch_id: 2 }, { user_id: 1, branch_id: 3 }, // Admin - all branches
  { user_id: 2, branch_id: 1 }, { user_id: 2, branch_id: 2 }, // Manager - 2 branches
  { user_id: 3, branch_id: 1 }, // Staff - main only
  { user_id: 4, branch_id: 2 }, // Staff - That Luang only
  { user_id: 5, branch_id: 3 }, // Staff - Phonetong only
];

// AUTH STORE WITH BRANCH
interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  currentBranch: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentBranch: (branch: any) => void;
  clearBranch: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentBranch: null,
      login: async (email: string, password: string) => {
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'demo123') {
          set({ user, isAuthenticated: true, currentBranch: null });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false, currentBranch: null }),
      setCurrentBranch: (branch) => set({ currentBranch: branch }),
      clearBranch: () => set({ currentBranch: null }),
    }),
    { name: 'auth-storage' }
  )
);

// BRANCH STORE
interface BranchState {
  branches: typeof mockBranches;
  userBranches: typeof mockUserBranches;
  
  // Branch CRUD
  addBranch: (branch: any) => void;
  updateBranch: (id: number, data: any) => void;
  deleteBranch: (id: number) => void;
  
  // User Branch Access
  getUserBranches: (userId: number, isAdmin: boolean) => any[];
  setUserBranches: (userId: number, branchIds: number[]) => void;
  
  // Check access
  canAccessBranch: (userId: number, branchId: number, isAdmin: boolean) => boolean;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: [...mockBranches],
      userBranches: [...mockUserBranches],
      
      addBranch: (branch) => set(state => ({
        branches: [...state.branches, { 
          ...branch, 
          id: Math.max(...state.branches.map(b => b.id), 0) + 1, 
          is_active: true,
          created_at: new Date().toISOString().split('T')[0] 
        }]
      })),
      
      updateBranch: (id, data) => set(state => ({
        branches: state.branches.map(b => b.id === id ? { ...b, ...data } : b)
      })),
      
      deleteBranch: (id) => set(state => ({
        branches: state.branches.filter(b => b.id !== id),
        userBranches: state.userBranches.filter(ub => ub.branch_id !== id)
      })),
      
      getUserBranches: (userId, isAdmin) => {
        const state = get();
        if (isAdmin) return state.branches.filter(b => b.is_active);
        const userBranchIds = state.userBranches.filter(ub => ub.user_id === userId).map(ub => ub.branch_id);
        return state.branches.filter(b => userBranchIds.includes(b.id) && b.is_active);
      },
      
      setUserBranches: (userId, branchIds) => set(state => ({
        userBranches: [
          ...state.userBranches.filter(ub => ub.user_id !== userId),
          ...branchIds.map(branch_id => ({ user_id: userId, branch_id }))
        ]
      })),
      
      canAccessBranch: (userId, branchId, isAdmin) => {
        if (isAdmin) return true;
        const state = get();
        return state.userBranches.some(ub => ub.user_id === userId && ub.branch_id === branchId);
      },
    }),
    { name: 'branch-storage' }
  )
);

// DATA STORE - with branch filtering
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
  
  getDashboard: (branchId?: number) => ReturnType<typeof getDashboardStats>;
  
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
      
      // Users CRUD with notifications
      addUser: (user) => set(state => {
        const newUser = { ...user, id: Math.max(...state.users.map(u => u.id)) + 1, created_at: new Date().toISOString().split('T')[0] };
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'New User Added', title_lo: 'ເພີ່ມຜູ້ໃຊ້ໃໝ່',
          message: `New user "${user.full_name}" (${user.role}) has been added`,
          message_lo: `ເພີ່ມຜູ້ໃຊ້ໃໝ່ "${user.full_name}" (${user.role})`,
          type: 'user', is_read: false, created_at: new Date().toISOString(),
        });
        return { users: [...state.users, newUser], notifications };
      }),
      updateUser: (id, data) => set(state => {
        const user = state.users.find(u => u.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'User Updated', title_lo: 'ອັບເດດຜູ້ໃຊ້',
          message: `User "${user?.full_name}" has been updated`,
          message_lo: `ອັບເດດຜູ້ໃຊ້ "${user?.full_name}"`,
          type: 'user', is_read: false, created_at: new Date().toISOString(),
        });
        return { users: state.users.map(u => u.id === id ? { ...u, ...data } : u), notifications };
      }),
      deleteUser: (id) => set(state => {
        const user = state.users.find(u => u.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'User Deleted', title_lo: 'ລຶບຜູ້ໃຊ້',
          message: `User "${user?.full_name}" has been deleted`,
          message_lo: `ລຶບຜູ້ໃຊ້ "${user?.full_name}"`,
          type: 'user', is_read: false, created_at: new Date().toISOString(),
        });
        return { users: state.users.filter(u => u.id !== id), notifications };
      }),
      
      // Customers CRUD with notifications
      addCustomer: (customer) => set(state => {
        const newCustomer = { ...customer, id: Math.max(...state.customers.map(c => c.id)) + 1, total_visits: 0, total_spent: 0, is_active: true, created_at: new Date().toISOString().split('T')[0] };
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'New Customer', title_lo: 'ລູກຄ້າໃໝ່',
          message: `New customer "${customer.name}" has been registered`,
          message_lo: `ລົງທະບຽນລູກຄ້າໃໝ່ "${customer.name}"`,
          type: 'customer', is_read: false, created_at: new Date().toISOString(),
        });
        return { customers: [...state.customers, newCustomer], notifications };
      }),
      updateCustomer: (id, data) => set(state => {
        const customer = state.customers.find(c => c.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Customer Updated', title_lo: 'ອັບເດດລູກຄ້າ',
          message: `Customer "${customer?.name}" info has been updated`,
          message_lo: `ອັບເດດຂໍ້ມູນລູກຄ້າ "${customer?.name}"`,
          type: 'customer', is_read: false, created_at: new Date().toISOString(),
        });
        return { customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c), notifications };
      }),
      deleteCustomer: (id) => set(state => {
        const customer = state.customers.find(c => c.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Customer Deleted', title_lo: 'ລຶບລູກຄ້າ',
          message: `Customer "${customer?.name}" has been deleted`,
          message_lo: `ລຶບລູກຄ້າ "${customer?.name}"`,
          type: 'customer', is_read: false, created_at: new Date().toISOString(),
        });
        return { customers: state.customers.filter(c => c.id !== id), notifications };
      }),
      searchCustomers: (query) => {
        const state = get();
        if (query.length < 2) return [];
        return state.customers.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) || 
          c.phone.includes(query)
        ).slice(0, 10);
      },
      
      // Services CRUD with notifications
      addService: (service) => set(state => {
        const newService = { ...service, id: Math.max(...state.services.map(s => s.id)) + 1, is_active: true };
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'New Service', title_lo: 'ບໍລິການໃໝ່',
          message: `New service "${service.name}" has been added`,
          message_lo: `ເພີ່ມບໍລິການໃໝ່ "${service.name_lo || service.name}"`,
          type: 'service', is_read: false, created_at: new Date().toISOString(),
        });
        return { services: [...state.services, newService], notifications };
      }),
      updateService: (id, data) => set(state => {
        const service = state.services.find(s => s.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Service Updated', title_lo: 'ອັບເດດບໍລິການ',
          message: `Service "${service?.name}" has been updated`,
          message_lo: `ອັບເດດບໍລິການ "${service?.name_lo || service?.name}"`,
          type: 'service', is_read: false, created_at: new Date().toISOString(),
        });
        return { services: state.services.map(s => s.id === id ? { ...s, ...data } : s), notifications };
      }),
      deleteService: (id) => set(state => {
        const service = state.services.find(s => s.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Service Deleted', title_lo: 'ລຶບບໍລິການ',
          message: `Service "${service?.name}" has been deleted`,
          message_lo: `ລຶບບໍລິການ "${service?.name_lo || service?.name}"`,
          type: 'service', is_read: false, created_at: new Date().toISOString(),
        });
        return { services: state.services.filter(s => s.id !== id), notifications };
      }),
      
      // Inventory CRUD with notifications
      addInventoryItem: (item) => set(state => {
        const newItem = { ...item, id: Math.max(...state.inventory.map(i => i.id)) + 1, is_active: true };
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'New Product', title_lo: 'ສິນຄ້າໃໝ່',
          message: `New product "${item.name}" has been added (Qty: ${item.quantity})`,
          message_lo: `ເພີ່ມສິນຄ້າໃໝ່ "${item.name_lo || item.name}" (ຈຳນວນ: ${item.quantity})`,
          type: 'inventory', is_read: false, created_at: new Date().toISOString(),
        });
        return { inventory: [...state.inventory, newItem], notifications };
      }),
      updateInventoryItem: (id, data) => set(state => {
        const item = state.inventory.find(i => i.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Product Updated', title_lo: 'ອັບເດດສິນຄ້າ',
          message: `Product "${item?.name}" has been updated`,
          message_lo: `ອັບເດດສິນຄ້າ "${item?.name_lo || item?.name}"`,
          type: 'inventory', is_read: false, created_at: new Date().toISOString(),
        });
        return { inventory: state.inventory.map(i => i.id === id ? { ...i, ...data } : i), notifications };
      }),
      deleteInventoryItem: (id) => set(state => {
        const item = state.inventory.find(i => i.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Product Deleted', title_lo: 'ລຶບສິນຄ້າ',
          message: `Product "${item?.name}" has been deleted`,
          message_lo: `ລຶບສິນຄ້າ "${item?.name_lo || item?.name}"`,
          type: 'inventory', is_read: false, created_at: new Date().toISOString(),
        });
        return { inventory: state.inventory.filter(i => i.id !== id), notifications };
      }),
      
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
        
        // Create notification for stock in (รับสินค้า)
        if (type === 'in') {
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Stock Added',
            title_lo: 'ເພີ່ມສະຕັອກ',
            message: `${userName} added ${quantity} ${item.unit} of "${item.name}" - Reason: ${reason}`,
            message_lo: `${userName} ເພີ່ມ ${quantity} ${item.unit} ຂອງ "${item.name_lo || item.name}" - ເຫດຜົນ: ${reason}`,
            type: 'stock_in',
            item_name: item.name,
            quantity: quantity,
            previous_qty: previousQty,
            new_qty: newQty,
            is_read: false,
            created_at: new Date().toISOString(),
          });
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
      updateAppointment: (id, data) => set(state => {
        const appt = state.appointments.find(a => a.id === id);
        const notifications = [...state.notifications];
        
        // Check if status changed
        if (data.status && appt?.status !== data.status) {
          const statusText: Record<string, { en: string, lo: string }> = {
            pending: { en: 'Pending', lo: 'ລໍຖ້າ' },
            confirmed: { en: 'Confirmed', lo: 'ຢືນຢັນແລ້ວ' },
            in_progress: { en: 'In Progress', lo: 'ກຳລັງບໍລິການ' },
            done: { en: 'Completed', lo: 'ສຳເລັດ' },
            cancelled: { en: 'Cancelled', lo: 'ຍົກເລີກ' },
          };
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Appointment Status Changed', title_lo: 'ສະຖານະນັດໝາຍປ່ຽນ',
            message: `${appt?.customer_name}'s appointment changed to "${statusText[data.status]?.en || data.status}"`,
            message_lo: `ນັດໝາຍຂອງ ${appt?.customer_name} ປ່ຽນເປັນ "${statusText[data.status]?.lo || data.status}"`,
            type: 'appointment_status', is_read: false, created_at: new Date().toISOString(),
          });
        } else {
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Appointment Updated', title_lo: 'ອັບເດດນັດໝາຍ',
            message: `Appointment for ${appt?.customer_name} has been updated`,
            message_lo: `ອັບເດດນັດໝາຍຂອງ ${appt?.customer_name}`,
            type: 'appointment', is_read: false, created_at: new Date().toISOString(),
          });
        }
        return { appointments: state.appointments.map(a => a.id === id ? { ...a, ...data } : a), notifications };
      }),
      deleteAppointment: (id) => set(state => {
        const appt = state.appointments.find(a => a.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Appointment Cancelled', title_lo: 'ຍົກເລີກນັດໝາຍ',
          message: `Appointment for ${appt?.customer_name} has been cancelled`,
          message_lo: `ຍົກເລີກນັດໝາຍຂອງ ${appt?.customer_name}`,
          type: 'appointment', is_read: false, created_at: new Date().toISOString(),
        });
        return { appointments: state.appointments.filter(a => a.id !== id), notifications };
      }),
      
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
      
      // Transactions with notifications
      addTransaction: (transaction) => set(state => {
        const newTrans = {
          ...transaction,
          id: Math.max(...state.transactions.map(t => t.id), 0) + 1,
          reference: `${transaction.type === 'income' ? 'INC' : 'EXP'}-2025-${String(state.transactions.length + 1).padStart(4, '0')}`,
          date: transaction.date || new Date().toISOString().split('T')[0],
        };
        const notifications = [...state.notifications];
        if (transaction.type === 'income') {
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Income Recorded', title_lo: 'ບັນທຶກລາຍຮັບ',
            message: `Income of ${transaction.amount.toLocaleString()} LAK - ${transaction.description}`,
            message_lo: `ລາຍຮັບ ${transaction.amount.toLocaleString()} ກີບ - ${transaction.description}`,
            type: 'income', amount: transaction.amount, is_read: false, created_at: new Date().toISOString(),
          });
        } else {
          notifications.unshift({
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            title: 'Expense Recorded', title_lo: 'ບັນທຶກລາຍຈ່າຍ',
            message: `Expense of ${transaction.amount.toLocaleString()} LAK - ${transaction.description}`,
            message_lo: `ລາຍຈ່າຍ ${transaction.amount.toLocaleString()} ກີບ - ${transaction.description}`,
            type: 'expense', amount: transaction.amount, is_read: false, created_at: new Date().toISOString(),
          });
        }
        return { transactions: [newTrans, ...state.transactions], notifications };
      }),
      deleteTransaction: (id) => set(state => {
        const trans = state.transactions.find(t => t.id === id);
        const notifications = [...state.notifications];
        notifications.unshift({
          id: Math.max(...notifications.map(n => n.id), 0) + 1,
          title: 'Transaction Deleted', title_lo: 'ລຶບລາຍການ',
          message: `${trans?.type === 'income' ? 'Income' : 'Expense'} of ${trans?.amount.toLocaleString()} LAK has been deleted`,
          message_lo: `ລຶບ${trans?.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'} ${trans?.amount.toLocaleString()} ກີບ`,
          type: 'transaction', is_read: false, created_at: new Date().toISOString(),
        });
        return { transactions: state.transactions.filter(t => t.id !== id), notifications };
      }),
      
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
