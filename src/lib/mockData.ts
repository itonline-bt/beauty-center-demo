/**
 * Mock Data Store - Demo Version
 * Complete data matching production system
 */

export const mockUsers = [
  { id: 1, email: 'admin@demo.com', full_name: 'Admin Demo', full_name_lo: 'ແອດມິນ ເດໂມ', phone: '020 9999 0001', role: 'admin', is_active: true, created_at: '2024-01-01' },
  { id: 2, email: 'manager@demo.com', full_name: 'Manager Demo', full_name_lo: 'ຜູ້ຈັດການ ເດໂມ', phone: '020 9999 0002', role: 'manager', is_active: true, created_at: '2024-01-01' },
  { id: 3, email: 'staff@demo.com', full_name: 'Staff Demo', full_name_lo: 'ພະນັກງານ ເດໂມ', phone: '020 9999 0003', role: 'staff', is_active: true, created_at: '2024-01-01' },
  { id: 4, email: 'somchai@demo.com', full_name: 'Somchai Vongsa', full_name_lo: 'ສົມໄຊ ວົງສາ', phone: '020 5555 1234', role: 'staff', is_active: true, created_at: '2024-02-15' },
  { id: 5, email: 'nina@demo.com', full_name: 'Nina Phommachan', full_name_lo: 'ນິນາ ພົມມະຈັນ', phone: '020 5555 5678', role: 'staff', is_active: false, created_at: '2024-03-01' },
];

export const mockCustomers = [
  // Branch 1 - Main Branch (Dongdok) - 5 customers
  { id: 1, name: 'ນາງ ສຸພາພອນ ແກ້ວວົງສາ', phone: '020 5551 1001', email: 'suphaphone@email.com', gender: 'female', date_of_birth: '1990-05-15', address: 'ບ້ານ ໂນນສະຫວ່າງ', total_visits: 25, total_spent: 5500000, notes: 'VIP Customer', is_active: true, created_at: '2024-01-15', branch_id: 1 },
  { id: 2, name: 'ນາງ ວັນນາ ສີສຸວັນ', phone: '020 5551 1002', email: 'vanna@email.com', gender: 'female', date_of_birth: '1988-08-20', address: 'ບ້ານ ດົງໂດກ', total_visits: 18, total_spent: 3200000, notes: 'Prefers morning', is_active: true, created_at: '2024-02-01', branch_id: 1 },
  { id: 3, name: 'ນາງ ມະນີຈັນ ພົມມະວົງ', phone: '020 5551 1003', email: 'manichan@email.com', gender: 'female', date_of_birth: '1995-12-10', address: 'ບ້ານ ໜອງບົວ', total_visits: 5, total_spent: 750000, notes: 'New customer', is_active: true, created_at: '2024-12-01', branch_id: 1 },
  { id: 4, name: 'ທ້າວ ສົມພອນ ແກ້ວມະນີ', phone: '020 5551 1004', email: 'somphone@email.com', gender: 'male', date_of_birth: '1985-03-25', address: 'ບ້ານ ທາດຫຼວງ', total_visits: 30, total_spent: 1500000, notes: 'Regular haircut', is_active: true, created_at: '2024-01-01', branch_id: 1 },
  { id: 5, name: 'ນາງ ສົມສຸກ ໄຊຍະວົງ', phone: '020 5551 1011', email: 'somsuk@email.com', gender: 'female', date_of_birth: '1992-03-18', address: 'ບ້ານ ດົງໂດກ', total_visits: 15, total_spent: 2100000, notes: '', is_active: true, created_at: '2024-02-15', branch_id: 1 },
  
  // Branch 2 - That Luang - 5 customers
  { id: 6, name: 'ນາງ ຈັນທະລາ ສີພັນດອນ', phone: '020 5551 1005', email: 'chanthala@email.com', gender: 'female', date_of_birth: '1992-07-08', address: 'ບ້ານ ໂພນໄຊ', total_visits: 12, total_spent: 2800000, notes: 'Weekend customer', is_active: true, created_at: '2024-03-15', branch_id: 2 },
  { id: 7, name: 'ນາງ ບຸນມີ ວົງປະເສີດ', phone: '020 5551 1006', email: 'bounmi@email.com', gender: 'female', date_of_birth: '2000-11-30', address: 'ບ້ານ ດົງປ່າແຫຼບ', total_visits: 8, total_spent: 600000, notes: 'Student', is_active: true, created_at: '2024-04-01', branch_id: 2 },
  { id: 8, name: 'ທ້າວ ພູວົງ ຈັນທະວົງ', phone: '020 5551 1007', email: 'phouvong@email.com', gender: 'male', date_of_birth: '1978-01-15', address: 'ບ້ານ ສີສະເກດ', total_visits: 15, total_spent: 4500000, notes: 'VIP', is_active: true, created_at: '2024-01-20', branch_id: 2 },
  { id: 9, name: 'ນາງ ແກ້ວມະນີ ສຸວັນນະພູມ', phone: '020 5551 1012', email: 'keomani@email.com', gender: 'female', date_of_birth: '1989-06-22', address: 'ບ້ານ ທາດຫຼວງ', total_visits: 10, total_spent: 1800000, notes: '', is_active: true, created_at: '2024-03-01', branch_id: 2 },
  { id: 10, name: 'ນາງ ດາວອນ ພອນສະຫວັນ', phone: '020 5551 1013', email: 'daovone@email.com', gender: 'female', date_of_birth: '1995-09-10', address: 'ບ້ານ ໂພນສະຫວັນ', total_visits: 6, total_spent: 950000, notes: '', is_active: true, created_at: '2024-05-01', branch_id: 2 },
  
  // Branch 3 - Phonetong - 5 customers
  { id: 11, name: 'ນາງ ນິດຕະຍາ ແສງຈັນ', phone: '020 5551 1008', email: 'nittaya@email.com', gender: 'female', date_of_birth: '1993-09-12', address: 'ບ້ານ ໂພນທັນ', total_visits: 20, total_spent: 2000000, notes: 'Nail art lover', is_active: true, created_at: '2024-02-10', branch_id: 3 },
  { id: 12, name: 'ນາງ ອຳພອນ ສຸລິຍະວົງ', phone: '020 5551 1009', email: 'amphon@email.com', gender: 'female', date_of_birth: '1987-04-20', address: 'ບ້ານ ຫາດຊາຍຟອງ', total_visits: 10, total_spent: 1800000, notes: 'Sensitive skin', is_active: true, created_at: '2024-03-01', branch_id: 3 },
  { id: 13, name: 'ທ້າວ ວິລະກອນ ພົມມະສອນ', phone: '020 5551 1010', email: 'vilakon@email.com', gender: 'male', date_of_birth: '1990-06-05', address: 'ບ້ານ ໂນນແກ້ວ', total_visits: 12, total_spent: 720000, notes: 'Beard trim', is_active: true, created_at: '2024-02-20', branch_id: 3 },
  { id: 14, name: 'ນາງ ພອນສະຫວັນ ວົງໄຊ', phone: '020 5551 1014', email: 'phonsavan@email.com', gender: 'female', date_of_birth: '1991-12-03', address: 'ບ້ານ ໂພນຕ້ອງ', total_visits: 8, total_spent: 1200000, notes: '', is_active: true, created_at: '2024-04-15', branch_id: 3 },
  { id: 15, name: 'ນາງ ຄຳພູ ແສງສະຫວ່າງ', phone: '020 5551 1015', email: 'khamphou@email.com', gender: 'female', date_of_birth: '1988-07-28', address: 'ບ້ານ ໂພນຕ້ອງ', total_visits: 14, total_spent: 2500000, notes: 'VIP', is_active: true, created_at: '2024-01-10', branch_id: 3 },
];

export const mockServiceCategories = [
  { id: 1, name: 'Hair', name_lo: 'ຜົມ', icon: '💇', color: '#ec4899' },
  { id: 2, name: 'Facial', name_lo: 'ໜ້າ', icon: '✨', color: '#8b5cf6' },
  { id: 3, name: 'Nails', name_lo: 'ເລັບ', icon: '💅', color: '#f43f5e' },
  { id: 4, name: 'Massage', name_lo: 'ນວດ', icon: '💆', color: '#10b981' },
  { id: 5, name: 'Makeup', name_lo: 'ແຕ່ງໜ້າ', icon: '💄', color: '#f59e0b' },
  { id: 6, name: 'Waxing', name_lo: 'ແວັກຂົນ', icon: '🌟', color: '#06b6d4' },
];

export const mockServices = [
  { id: 1, name: 'Haircut - Women', name_lo: 'ຕັດຜົມຍິງ', description: 'Professional haircut with wash and blow dry', description_lo: 'ຕັດຜົມມືອາຊີບ ພ້ອມສະຜົມ ແລະ ເປົ່າ', category: 'Hair', category_id: 1, price: 80000, duration: 45, is_active: true },
  { id: 2, name: 'Haircut - Men', name_lo: 'ຕັດຜົມຊາຍ', description: 'Men haircut with styling', description_lo: 'ຕັດຜົມຊາຍ ພ້ອມຈັດແຕ່ງ', category: 'Hair', category_id: 1, price: 50000, duration: 30, is_active: true },
  { id: 3, name: 'Hair Coloring', name_lo: 'ຍ້ອມຜົມ', description: 'Full hair coloring with premium products', description_lo: 'ຍ້ອມຜົມເຕັມຫົວ ດ້ວຍຜະລິດຕະພັນຄຸນນະພາບ', category: 'Hair', category_id: 1, price: 350000, duration: 120, is_active: true },
  { id: 4, name: 'Hair Treatment', name_lo: 'ທຣີດເມັນຜົມ', description: 'Deep conditioning treatment', description_lo: 'ບຳລຸງຜົມຢ່າງເລິກເຊິ່ງ', category: 'Hair', category_id: 1, price: 200000, duration: 60, is_active: true },
  { id: 5, name: 'Hair Straightening', name_lo: 'ຢືດຜົມ', description: 'Permanent hair straightening', description_lo: 'ຢືດຜົມແບບຖາວອນ', category: 'Hair', category_id: 1, price: 500000, duration: 180, is_active: true },
  { id: 6, name: 'Hair Perm', name_lo: 'ດັດຜົມ', description: 'Permanent wave styling', description_lo: 'ດັດຜົມແບບຖາວອນ', category: 'Hair', category_id: 1, price: 400000, duration: 150, is_active: true },
  { id: 7, name: 'Basic Facial', name_lo: 'ທຳຄວາມສະອາດໜ້າ', description: 'Deep cleansing facial', description_lo: 'ທຳຄວາມສະອາດໜ້າແບບເລິກ', category: 'Facial', category_id: 2, price: 150000, duration: 60, is_active: true },
  { id: 8, name: 'Premium Facial', name_lo: 'ຟັດເຊົ້າພິເສດ', description: 'Premium facial with serum', description_lo: 'ບຳລຸງໜ້າແບບພິເສດ ພ້ອມເຊລັ່ມ', category: 'Facial', category_id: 2, price: 300000, duration: 90, is_active: true },
  { id: 9, name: 'Acne Treatment', name_lo: 'ຮັກສາສິວ', description: 'Specialized acne treatment', description_lo: 'ຮັກສາສິວແບບພິເສດ', category: 'Facial', category_id: 2, price: 250000, duration: 75, is_active: true },
  { id: 10, name: 'Anti-Aging Facial', name_lo: 'ບຳລຸງຜິວຕ້ານຄວາມແກ່', description: 'Anti-aging treatment with collagen', description_lo: 'ບຳລຸງຜິວຕ້ານຄວາມແກ່ ພ້ອມຄໍລາເຈັນ', category: 'Facial', category_id: 2, price: 400000, duration: 90, is_active: true },
  { id: 11, name: 'Manicure', name_lo: 'ເຮັດເລັບມື', description: 'Basic manicure with polish', description_lo: 'ເຮັດເລັບມື ພ້ອມທາສີ', category: 'Nails', category_id: 3, price: 60000, duration: 45, is_active: true },
  { id: 12, name: 'Pedicure', name_lo: 'ເຮັດເລັບຕີນ', description: 'Basic pedicure with polish', description_lo: 'ເຮັດເລັບຕີນ ພ້ອມທາສີ', category: 'Nails', category_id: 3, price: 80000, duration: 60, is_active: true },
  { id: 13, name: 'Gel Nails', name_lo: 'ເຮັດເລັບເຈວ', description: 'Gel nail application', description_lo: 'ເຮັດເລັບເຈວ', category: 'Nails', category_id: 3, price: 150000, duration: 90, is_active: true },
  { id: 14, name: 'Nail Art', name_lo: 'ແຕ້ມເລັບ', description: 'Custom nail art design', description_lo: 'ແຕ້ມເລັບຕາມແບບ', category: 'Nails', category_id: 3, price: 100000, duration: 60, is_active: true },
  { id: 15, name: 'Thai Massage', name_lo: 'ນວດແຜນໄທ', description: 'Traditional Thai massage', description_lo: 'ນວດແຜນໄທແບບດັ້ງເດີມ', category: 'Massage', category_id: 4, price: 200000, duration: 60, is_active: true },
  { id: 16, name: 'Oil Massage', name_lo: 'ນວດນ້ຳມັນ', description: 'Aromatherapy oil massage', description_lo: 'ນວດນ້ຳມັນອະໂຣມາ', category: 'Massage', category_id: 4, price: 250000, duration: 60, is_active: true },
  { id: 17, name: 'Foot Massage', name_lo: 'ນວດຕີນ', description: 'Relaxing foot massage', description_lo: 'ນວດຕີນຜ່ອນຄາຍ', category: 'Massage', category_id: 4, price: 100000, duration: 45, is_active: true },
  { id: 18, name: 'Hot Stone Massage', name_lo: 'ນວດຫີນຮ້ອນ', description: 'Hot stone therapy massage', description_lo: 'ນວດດ້ວຍຫີນຮ້ອນ', category: 'Massage', category_id: 4, price: 350000, duration: 90, is_active: true },
  { id: 19, name: 'Party Makeup', name_lo: 'ແຕ່ງໜ້າງານລ້ຽງ', description: 'Makeup for parties and events', description_lo: 'ແຕ່ງໜ້າສຳລັບງານລ້ຽງ', category: 'Makeup', category_id: 5, price: 200000, duration: 60, is_active: true },
  { id: 20, name: 'Bridal Makeup', name_lo: 'ແຕ່ງໜ້າເຈົ້າສາວ', description: 'Complete bridal makeup', description_lo: 'ແຕ່ງໜ້າເຈົ້າສາວຄົບຊຸດ', category: 'Makeup', category_id: 5, price: 500000, duration: 120, is_active: true },
  { id: 21, name: 'Eyebrow Waxing', name_lo: 'ແວັກສ໌ຄິ້ວ', description: 'Eyebrow shaping with wax', description_lo: 'ແຕ່ງຄິ້ວດ້ວຍແວັກ', category: 'Waxing', category_id: 6, price: 30000, duration: 15, is_active: true },
  { id: 22, name: 'Full Leg Waxing', name_lo: 'ແວັກສ໌ຂາ', description: 'Full leg hair removal', description_lo: 'ກຳຈັດຂົນຂາທັງໝົດ', category: 'Waxing', category_id: 6, price: 150000, duration: 45, is_active: true },
];

export const mockInventoryCategories = [
  { id: 1, name: 'Hair Products', name_lo: 'ຜະລິດຕະພັນຜົມ' },
  { id: 2, name: 'Skincare', name_lo: 'ຜະລິດຕະພັນດູແລຜິວ' },
  { id: 3, name: 'Nail Products', name_lo: 'ຜະລິດຕະພັນເລັບ' },
  { id: 4, name: 'Massage Oils', name_lo: 'ນ້ຳມັນນວດ' },
  { id: 5, name: 'Makeup', name_lo: 'ເຄື່ອງສຳອາງ' },
  { id: 6, name: 'Equipment', name_lo: 'ອຸປະກອນ' },
  { id: 7, name: 'Consumables', name_lo: 'ວັດຖຸສິ້ນເປືອງ' },
];

export const mockInventory = [
  // Branch 1 - Main Branch (Dongdok)
  { id: 1, name: 'Shampoo Professional 500ml', name_lo: 'ແຊມພູມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-001', quantity: 25, min_quantity: 10, unit: 'bottle', cost_price: 80000, sell_price: 120000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 2, name: 'Conditioner Professional 500ml', name_lo: 'ຄອນດິຊັນເນີມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-002', quantity: 20, min_quantity: 10, unit: 'bottle', cost_price: 85000, sell_price: 130000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 3, name: 'Hair Color - Black', name_lo: 'ສີຍ້ອມຜົມ - ດຳ', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-003', quantity: 15, min_quantity: 5, unit: 'box', cost_price: 150000, sell_price: 250000, supplier: 'Color Pro Ltd.', location: 'Shelf A2', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 4, name: 'Hair Color - Brown', name_lo: 'ສີຍ້ອມຜົມ - ນ້ຳຕານ', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-004', quantity: 3, min_quantity: 5, unit: 'box', cost_price: 150000, sell_price: 250000, supplier: 'Color Pro Ltd.', location: 'Shelf A2', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 5, name: 'Hair Spray 300ml', name_lo: 'ສະເປຣຜົມ 300ml', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-005', quantity: 18, min_quantity: 8, unit: 'bottle', cost_price: 45000, sell_price: 75000, supplier: 'Beauty Supply Co.', location: 'Shelf A3', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 6, name: 'Hair Treatment Mask', name_lo: 'ມາສ໌ທຣີດເມັນຜົມ', category: 'Hair Products', category_id: 1, sku: 'MAIN-HAIR-006', quantity: 4, min_quantity: 5, unit: 'jar', cost_price: 120000, sell_price: 200000, supplier: 'Premium Hair Co.', location: 'Shelf A3', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 7, name: 'Facial Cleanser 200ml', name_lo: 'ນ້ຳຢາລ້າງໜ້າ 200ml', category: 'Skincare', category_id: 2, sku: 'MAIN-SKIN-001', quantity: 30, min_quantity: 15, unit: 'bottle', cost_price: 60000, sell_price: 95000, supplier: 'Skin Care Plus', location: 'Shelf B1', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 8, name: 'Moisturizer 50ml', name_lo: 'ຄຣີມບຳລຸງຜິວ 50ml', category: 'Skincare', category_id: 2, sku: 'MAIN-SKIN-002', quantity: 22, min_quantity: 10, unit: 'jar', cost_price: 90000, sell_price: 150000, supplier: 'Skin Care Plus', location: 'Shelf B1', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 9, name: 'Facial Serum 30ml', name_lo: 'ເຊລັ່ມບຳລຸງ 30ml', category: 'Skincare', category_id: 2, sku: 'MAIN-SKIN-003', quantity: 15, min_quantity: 8, unit: 'bottle', cost_price: 150000, sell_price: 280000, supplier: 'Premium Skin Co.', location: 'Shelf B2', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 10, name: 'Face Mask Sheet (10pcs)', name_lo: 'ແຜ່ນມາສ໌ໜ້າ (10ແຜ່ນ)', category: 'Skincare', category_id: 2, sku: 'MAIN-SKIN-004', quantity: 40, min_quantity: 20, unit: 'pack', cost_price: 80000, sell_price: 120000, supplier: 'K-Beauty Import', location: 'Shelf B2', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 11, name: 'Nail Polish Set (12 colors)', name_lo: 'ຊຸດທາເລັບ (12ສີ)', category: 'Nail Products', category_id: 3, sku: 'MAIN-NAIL-001', quantity: 10, min_quantity: 5, unit: 'set', cost_price: 200000, sell_price: 350000, supplier: 'Nail Art Co.', location: 'Shelf C1', image_url: null as string | null, is_active: true, branch_id: 1 },
  { id: 12, name: 'Gel Base Coat', name_lo: 'ເຈວຮອງພື້ນ', category: 'Nail Products', category_id: 3, sku: 'MAIN-NAIL-002', quantity: 20, min_quantity: 10, unit: 'bottle', cost_price: 45000, sell_price: 80000, supplier: 'Nail Art Co.', location: 'Shelf C1', image_url: null as string | null, is_active: true, branch_id: 1 },
  
  // Branch 2 - That Luang
  { id: 13, name: 'Shampoo Professional 500ml', name_lo: 'ແຊມພູມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'TL-HAIR-001', quantity: 18, min_quantity: 10, unit: 'bottle', cost_price: 80000, sell_price: 120000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 14, name: 'Conditioner Professional 500ml', name_lo: 'ຄອນດິຊັນເນີມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'TL-HAIR-002', quantity: 12, min_quantity: 10, unit: 'bottle', cost_price: 85000, sell_price: 130000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 15, name: 'Hair Color - Black', name_lo: 'ສີຍ້ອມຜົມ - ດຳ', category: 'Hair Products', category_id: 1, sku: 'TL-HAIR-003', quantity: 8, min_quantity: 5, unit: 'box', cost_price: 150000, sell_price: 250000, supplier: 'Color Pro Ltd.', location: 'Shelf A2', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 16, name: 'Lavender Massage Oil 500ml', name_lo: 'ນ້ຳມັນນວດລາເວນເດີ 500ml', category: 'Massage Oils', category_id: 4, sku: 'TL-OIL-001', quantity: 10, min_quantity: 8, unit: 'bottle', cost_price: 120000, sell_price: 200000, supplier: 'Aroma Thailand', location: 'Shelf D1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 17, name: 'Coconut Massage Oil 500ml', name_lo: 'ນ້ຳມັນນວດໝາກພ້າວ 500ml', category: 'Massage Oils', category_id: 4, sku: 'TL-OIL-002', quantity: 5, min_quantity: 10, unit: 'bottle', cost_price: 100000, sell_price: 180000, supplier: 'Aroma Thailand', location: 'Shelf D1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 18, name: 'Facial Cleanser 200ml', name_lo: 'ນ້ຳຢາລ້າງໜ້າ 200ml', category: 'Skincare', category_id: 2, sku: 'TL-SKIN-001', quantity: 20, min_quantity: 15, unit: 'bottle', cost_price: 60000, sell_price: 95000, supplier: 'Skin Care Plus', location: 'Shelf B1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 19, name: 'Moisturizer 50ml', name_lo: 'ຄຣີມບຳລຸງຜິວ 50ml', category: 'Skincare', category_id: 2, sku: 'TL-SKIN-002', quantity: 15, min_quantity: 10, unit: 'jar', cost_price: 90000, sell_price: 150000, supplier: 'Skin Care Plus', location: 'Shelf B1', image_url: null as string | null, is_active: true, branch_id: 2 },
  { id: 20, name: 'Foundation Set', name_lo: 'ຊຸດຮອງພື້ນ', category: 'Makeup', category_id: 5, sku: 'TL-MAKE-001', quantity: 6, min_quantity: 5, unit: 'set', cost_price: 300000, sell_price: 500000, supplier: 'K-Beauty Import', location: 'Shelf E1', image_url: null as string | null, is_active: true, branch_id: 2 },
  
  // Branch 3 - Phonetong
  { id: 21, name: 'Shampoo Professional 500ml', name_lo: 'ແຊມພູມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'PT-HAIR-001', quantity: 12, min_quantity: 10, unit: 'bottle', cost_price: 80000, sell_price: 120000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 22, name: 'Conditioner Professional 500ml', name_lo: 'ຄອນດິຊັນເນີມືອາຊີບ 500ml', category: 'Hair Products', category_id: 1, sku: 'PT-HAIR-002', quantity: 8, min_quantity: 10, unit: 'bottle', cost_price: 85000, sell_price: 130000, supplier: 'Beauty Supply Co.', location: 'Shelf A1', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 23, name: 'Hair Color - Black', name_lo: 'ສີຍ້ອມຜົມ - ດຳ', category: 'Hair Products', category_id: 1, sku: 'PT-HAIR-003', quantity: 5, min_quantity: 5, unit: 'box', cost_price: 150000, sell_price: 250000, supplier: 'Color Pro Ltd.', location: 'Shelf A2', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 24, name: 'Nail Polish Set (12 colors)', name_lo: 'ຊຸດທາເລັບ (12ສີ)', category: 'Nail Products', category_id: 3, sku: 'PT-NAIL-001', quantity: 4, min_quantity: 5, unit: 'set', cost_price: 200000, sell_price: 350000, supplier: 'Nail Art Co.', location: 'Shelf C1', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 25, name: 'Gel Base Coat', name_lo: 'ເຈວຮອງພື້ນ', category: 'Nail Products', category_id: 3, sku: 'PT-NAIL-002', quantity: 12, min_quantity: 10, unit: 'bottle', cost_price: 45000, sell_price: 80000, supplier: 'Nail Art Co.', location: 'Shelf C1', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 26, name: 'Disposable Towels (100pcs)', name_lo: 'ຜ້າເຊັດໃຊ້ຄັ້ງດຽວ (100ຜືນ)', category: 'Consumables', category_id: 7, sku: 'PT-CONS-001', quantity: 30, min_quantity: 20, unit: 'pack', cost_price: 80000, sell_price: 120000, supplier: 'Supply Mart', location: 'Storage', image_url: null as string | null, is_active: true, branch_id: 3 },
  { id: 27, name: 'Cotton Pads (500pcs)', name_lo: 'ສຳລີ (500ແຜ່ນ)', category: 'Consumables', category_id: 7, sku: 'PT-CONS-002', quantity: 18, min_quantity: 15, unit: 'pack', cost_price: 50000, sell_price: 80000, supplier: 'Supply Mart', location: 'Storage', image_url: null as string | null, is_active: true, branch_id: 3 },
];

export const mockExpenseCategories = [
  { id: 1, name: 'Rent', name_lo: 'ຄ່າເຊົ່າ' },
  { id: 2, name: 'Utilities', name_lo: 'ຄ່ານ້ຳຄ່າໄຟ' },
  { id: 3, name: 'Salary', name_lo: 'ເງິນເດືອນ' },
  { id: 4, name: 'Supplies', name_lo: 'ວັດສະດຸສິ້ນເປືອງ' },
  { id: 5, name: 'Marketing', name_lo: 'ການຕະຫຼາດ' },
  { id: 6, name: 'Maintenance', name_lo: 'ຄ່າບຳລຸງຮັກສາ' },
  { id: 7, name: 'Stock Purchase', name_lo: 'ຊື້ສິນຄ້າ' },
  { id: 8, name: 'Other', name_lo: 'ອື່ນໆ' },
];

// Generate appointments with branch_id
const generateAppointments = () => {
  const appointments: any[] = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  const branches = [1, 2, 3];

  let id = 1;
  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    // Generate appointments for each branch
    for (const branch_id of branches) {
      const branchCustomers = mockCustomers.filter(c => c.branch_id === branch_id);
      if (branchCustomers.length === 0) continue;
      
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const customer = branchCustomers[Math.floor(Math.random() * branchCustomers.length)];
        const service = mockServices[Math.floor(Math.random() * mockServices.length)];
        const staff = mockUsers.filter(u => u.role === 'staff')[Math.floor(Math.random() * 3)];
        const time = times[Math.floor(Math.random() * times.length)];
        const discount = Math.random() > 0.8 ? Math.floor(service.price * 0.1) : 0;

        let status;
        if (dayOffset < 0) status = Math.random() > 0.1 ? 'done' : 'cancelled';
        else if (dayOffset === 0) status = ['pending', 'confirmed', 'in_progress', 'done'][Math.floor(Math.random() * 4)];
        else status = Math.random() > 0.3 ? 'confirmed' : 'pending';

        appointments.push({
          id: id++,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          service_id: service.id,
          service_name: service.name,
          service_name_lo: service.name_lo,
          staff_id: staff?.id || 3,
          staff_name: staff?.full_name || 'Staff Demo',
          appointment_date: dateStr,
          appointment_time: time,
          duration: service.duration,
          price: service.price,
          discount,
          total_price: service.price - discount,
          status,
          notes: '',
          created_at: dateStr,
          branch_id,
        });
      }
    }
  }
  return appointments;
};

export const mockAppointments = generateAppointments();

// Generate bills from completed appointments with branch_id
const generateBills = () => {
  const bills: any[] = [];
  const completedAppts = mockAppointments.filter(a => a.status === 'done');

  completedAppts.slice(0, 30).forEach((apt, i) => {
    const taxRate = 10;
    const subtotal = apt.price;
    const discount = apt.discount;
    const taxAmount = Math.round((subtotal - discount) * taxRate / 100);
    const grandTotal = subtotal - discount + taxAmount;

    bills.push({
      id: i + 1,
      bill_number: `BILL-2025-${String(i + 1).padStart(4, '0')}`,
      appointment_id: apt.id,
      customer_id: apt.customer_id,
      customer_name: apt.customer_name,
      customer_phone: apt.customer_phone,
      service_name: apt.service_name,
      service_name_lo: apt.service_name_lo,
      staff_name: apt.staff_name,
      subtotal,
      discount_amount: discount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      payment_method: ['cash', 'transfer', 'card'][Math.floor(Math.random() * 3)],
      payment_status: 'paid',
      notes: '',
      created_at: apt.appointment_date,
      branch_id: apt.branch_id,
    });
  });

  return bills;
};

export const mockBills = generateBills();

// Generate transactions with branch_id
const generateTransactions = () => {
  const transactions: any[] = [];
  let id = 1;
  const branches = [1, 2, 3];

  // Expenses for each branch
  const expenseTemplates = [
    { category_id: 1, category: 'Rent', desc_lo: 'ຄ່າເຊົ່າຮ້ານ', desc_en: 'Shop rent', amount: 5000000 },
    { category_id: 2, category: 'Utilities', desc_lo: 'ຄ່າໄຟຟ້າ', desc_en: 'Electricity', amount: 800000 },
    { category_id: 2, category: 'Utilities', desc_lo: 'ຄ່ານ້ຳປະປາ', desc_en: 'Water', amount: 150000 },
    { category_id: 3, category: 'Salary', desc_lo: 'ເງິນເດືອນພະນັກງານ', desc_en: 'Staff salary', amount: 8000000 },
    { category_id: 4, category: 'Supplies', desc_lo: 'ຊື້ຜ້າເຊັດ, ກະດາດ', desc_en: 'Supplies', amount: 350000 },
  ];

  branches.forEach(branch_id => {
    expenseTemplates.forEach(exp => {
      const dayOffset = -Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      transactions.push({
        id: id++,
        type: 'expense',
        category_id: exp.category_id,
        category_name: exp.category,
        description: exp.desc_lo,
        amount: Math.round(exp.amount * (0.8 + Math.random() * 0.4)),
        payment_method: ['cash', 'transfer'][Math.floor(Math.random() * 2)],
        reference: `EXP-2025-${String(id).padStart(4, '0')}`,
        date: date.toISOString().split('T')[0],
        created_by: 1,
        created_by_name: 'Admin Demo',
        branch_id,
      });
    });
  });

  // Income from bills (inherit branch_id from bill)
  mockBills.forEach(bill => {
    transactions.push({
      id: id++,
      type: 'income',
      category_id: 0,
      category_name: 'Service',
      description: `${bill.service_name} - ${bill.customer_name}`,
      amount: bill.grand_total,
      payment_method: bill.payment_method,
      reference: bill.bill_number,
      date: bill.created_at,
      bill_id: bill.id,
      created_by: 1,
      created_by_name: 'Admin Demo',
      branch_id: bill.branch_id,
    });
  });

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

export const mockTransactions = generateTransactions();

// Stock movements
const generateStockMovements = () => {
  const movements: any[] = [];
  let id = 1;

  mockInventory.forEach(item => {
    movements.push({
      id: id++,
      inventory_id: item.id,
      inventory_name: item.name,
      inventory_name_lo: item.name_lo,
      type: 'in',
      quantity: item.quantity + 10,
      previous_qty: 0,
      new_qty: item.quantity + 10,
      reason: 'Initial Stock',
      reason_lo: 'ສະຕັອກເລີ່ມຕົ້ນ',
      date: '2025-01-01',
      created_by: 1,
      created_by_name: 'Admin Demo',
    });
  });

  const usedItems = [
    { inv_id: 1, qty: 5, reason: 'Used for service', reason_lo: 'ໃຊ້ໃນການບໍລິການ' },
    { inv_id: 3, qty: 8, reason: 'Used for coloring', reason_lo: 'ໃຊ້ຍ້ອມຜົມ' },
    { inv_id: 4, qty: 4, reason: 'Used for coloring', reason_lo: 'ໃຊ້ຍ້ອມຜົມ' },
    { inv_id: 7, qty: 3, reason: 'Used for facial', reason_lo: 'ໃຊ້ລ້າງໜ້າ' },
    { inv_id: 13, qty: 5, reason: 'Used for massage', reason_lo: 'ໃຊ້ນວດ' },
    { inv_id: 14, qty: 8, reason: 'Used for massage', reason_lo: 'ໃຊ້ນວດ' },
  ];

  usedItems.forEach(u => {
    const item = mockInventory.find(i => i.id === u.inv_id);
    if (item) {
      movements.push({
        id: id++,
        inventory_id: u.inv_id,
        inventory_name: item.name,
        inventory_name_lo: item.name_lo,
        type: 'out',
        quantity: u.qty,
        previous_qty: item.quantity + u.qty,
        new_qty: item.quantity,
        reason: u.reason,
        reason_lo: u.reason_lo,
        date: '2025-01-10',
        created_by: 3,
        created_by_name: 'Staff Demo',
      });
    }
  });

  return movements.sort((a, b) => b.date.localeCompare(a.date));
};

export const mockStockMovements = generateStockMovements();

export const mockNotifications = [
  { id: 1, title: 'New Appointment', title_lo: 'ນັດໝາຍໃໝ່', message: 'New appointment booked for today at 10:00', message_lo: 'ມີນັດໝາຍໃໝ່ສຳລັບມື້ນີ້ເວລາ 10:00', type: 'appointment', is_read: false, created_at: new Date().toISOString() },
  { id: 2, title: 'Low Stock Alert', title_lo: 'ສິນຄ້າໃກ້ໝົດ', message: 'Hair Color Brown is running low (3 remaining)', message_lo: 'ສີຍ້ອມຜົມນ້ຳຕານ ໃກ້ຈະໝົດ (ເຫຼືອ 3)', type: 'inventory', is_read: false, created_at: new Date().toISOString() },
  { id: 3, title: 'Low Stock Alert', title_lo: 'ສິນຄ້າໃກ້ໝົດ', message: 'Coconut Oil is running low (2 remaining)', message_lo: 'ນ້ຳມັນໝາກພ້າວ ໃກ້ຈະໝົດ (ເຫຼືອ 2)', type: 'inventory', is_read: false, created_at: new Date().toISOString() },
  { id: 4, title: 'Payment Received', title_lo: 'ຮັບການຊຳລະແລ້ວ', message: 'Payment of 330,000 LAK received from customer', message_lo: 'ໄດ້ຮັບການຊຳລະ 330,000 ກີບ ຈາກລູກຄ້າ', type: 'payment', is_read: true, created_at: '2025-01-10T10:30:00' },
  { id: 5, title: 'New Customer', title_lo: 'ລູກຄ້າໃໝ່', message: 'New customer registered: ນາງ ມະນີຈັນ', message_lo: 'ລູກຄ້າໃໝ່ລົງທະບຽນ: ນາງ ມະນີຈັນ', type: 'customer', is_read: true, created_at: '2025-01-08T14:00:00' },
];

export const mockSettings = {
  shop_name: 'Bella Beauty Center',
  shop_name_lo: 'ຮ້ານເສີມສວຍເບລລ້າ',
  address: '123 Samsenthai Road, Sisattanak District',
  address_lo: '123 ຖະໜົນສາມແສນໄທ, ເມືອງສີສັດຕະນາກ',
  city: 'Vientiane',
  city_lo: 'ວຽງຈັນ',
  phone: '+856 21 234 567',
  mobile: '+856 20 5555 1234',
  email: 'contact@bellabeauty.la',
  website: 'www.bellabeauty.la',
  tax_id: '1234567890',
  currency: 'LAK',
  tax_rate: 10,
  opening_time: '09:00',
  closing_time: '18:00',
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  // Multi-currency support
  currencies: {
    LAK: { symbol: '₭', name: 'Lao Kip', name_lo: 'ກີບ', rate: 1, decimals: 0 },
    THB: { symbol: '฿', name: 'Thai Baht', name_lo: 'ບາດ', rate: 0.0023, decimals: 2 },
    USD: { symbol: '$', name: 'US Dollar', name_lo: 'ໂດລາ', rate: 0.000047, decimals: 2 },
    CNY: { symbol: '¥', name: 'Chinese Yuan', name_lo: 'ຢວນ', rate: 0.00034, decimals: 2 },
  },
  exchange_rates: {
    LAK: 1,
    THB: 435,      // 1 THB = 435 LAK
    USD: 21250,    // 1 USD = 21,250 LAK  
    CNY: 2940,     // 1 CNY = 2,940 LAK
  },
  deposit_percentage: 30, // Default deposit percentage
};

export const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = mockAppointments.filter(a => a.appointment_date === today);
  const completedToday = todayAppointments.filter(a => a.status === 'done');
  const lowStockItems = mockInventory.filter(i => i.quantity <= i.min_quantity);

  const todayRevenue = completedToday.reduce((sum, a) => sum + a.total_price, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekRevenue = mockBills.filter(b => new Date(b.created_at) >= weekStart).reduce((sum, b) => sum + b.grand_total, 0);

  return {
    revenue: { today: todayRevenue, week: weekRevenue, month: weekRevenue * 4 },
    appointments: {
      today: todayAppointments.length,
      pending: todayAppointments.filter(a => a.status === 'pending').length,
      confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
      in_progress: todayAppointments.filter(a => a.status === 'in_progress').length,
      completed: completedToday.length,
    },
    customers: { total: mockCustomers.length, new_this_month: 3 },
    inventory: { low_stock: lowStockItems.length, low_stock_items: lowStockItems },
    top_services: mockServices.slice(0, 5).map(s => ({ ...s, booking_count: Math.floor(Math.random() * 20) + 5 })),
  };
};
