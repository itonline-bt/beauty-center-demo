'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, PageHeader, SearchInput, Alert, StatCard } from '@/components/ui';
import { formatNumber, getProductImageUrl } from '@/lib/utils';
import { Package, Plus, Minus, AlertTriangle, ArrowUp, ArrowDown, History, Bell, Building2 } from 'lucide-react';

export default function StockPage() {
  const router = useRouter();
  const { user, isAuthenticated, currentBranch } = useAuthStore();
  const { inventory, stockMovements, adjustStock } = useDataStore();
  const { locale, formatCurrency } = useI18n();
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('out');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState({ quantity: '', reason: '' });

  // Filter inventory by current branch (with null safety and backward compatibility)
  const branchInventory = useMemo(() => {
    if (!currentBranch) return [];
    // Include items with matching branch_id OR items without branch_id (legacy data)
    return inventory.filter(i => i.branch_id === currentBranch.id || !i.branch_id);
  }, [inventory, currentBranch]);
  
  const lowStockItems = useMemo(() => 
    branchInventory.filter(i => i.quantity <= i.min_quantity)
  , [branchInventory]);
  
  const filteredInventory = useMemo(() => 
    branchInventory.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase().includes(search.toLowerCase()))
    )
  , [branchInventory, search]);

  // Filter stock movements by current branch items
  const branchStockMovements = useMemo(() => {
    const branchItemIds = branchInventory.map(i => i.id);
    return stockMovements.filter(m => branchItemIds.includes(m.item_id));
  }, [branchInventory, stockMovements]);

  const stats = useMemo(() => ({
    totalItems: branchInventory.length,
    lowStock: lowStockItems.length,
    movementsToday: branchStockMovements.filter(m => m.date === new Date().toISOString().split('T')[0]).length,
    totalValue: branchInventory.reduce((s, i) => s + (i.quantity * i.cost_price), 0),
  }), [branchInventory, branchStockMovements, lowStockItems]);

  // Auth redirect effect
  useEffect(() => { 
    if (!isAuthenticated) router.push('/login'); 
    else if (!currentBranch) router.push('/select-branch');
  }, [isAuthenticated, currentBranch, router]);
  
  // Early return AFTER all hooks
  if (!isAuthenticated || !currentBranch) return null;

  const openAdjustModal = (item: any, type: 'in' | 'out') => {
    setSelectedItem(item);
    setAdjustType(type);
    setForm({ quantity: '', reason: type === 'out' ? (locale === 'lo' ? 'ໃຊ້ໃນການບໍລິການ' : 'Used for service') : (locale === 'lo' ? 'ຮັບສິນຄ້າເຂົ້າ' : 'Stock received') });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem && form.quantity) {
      // Pass user name for notification
      adjustStock(selectedItem.id, Number(form.quantity), adjustType, form.reason, user?.full_name || 'Admin');
      setShowModal(false);
      setSelectedItem(null);
      setForm({ quantity: '', reason: '' });
    }
  };

  const quickReasons = adjustType === 'out' 
    ? [
        locale === 'lo' ? 'ໃຊ້ໃນການບໍລິການ' : 'Used for service', 
        locale === 'lo' ? 'ເສຍຫາຍ' : 'Damaged', 
        locale === 'lo' ? 'ໝົດອາຍຸ' : 'Expired', 
        locale === 'lo' ? 'ຂາຍ' : 'Sold',
        locale === 'lo' ? 'ໃຊ້ພາຍໃນ' : 'Internal use'
      ]
    : [
        locale === 'lo' ? 'ຮັບສິນຄ້າເຂົ້າ' : 'Stock received', 
        locale === 'lo' ? 'ໂອນຈາກສາຂາອື່ນ' : 'Transfer from branch', 
        locale === 'lo' ? 'ແກ້ໄຂສະຕັອກ' : 'Stock correction',
        locale === 'lo' ? 'ຄືນສິນຄ້າ' : 'Return'
      ];

  const getImageSrc = (item: any) => {
    if (item.image_url && item.image_url.startsWith('data:')) return item.image_url;
    if (item.image_url) return item.image_url;
    return getProductImageUrl(item.name, item.category);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Branch indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          <span>{locale === 'lo' ? 'ສາຂາ:' : 'Branch:'}</span>
          <span className="font-medium text-rose-600">{locale === 'lo' ? currentBranch.name : currentBranch.name_en}</span>
        </div>

        <PageHeader
          title={locale === 'lo' ? 'ຈັດການສະຕັອກ' : 'Stock Management'}
          subtitle={locale === 'lo' ? 'ເພີ່ມ ແລະ ຕັດສະຕັອກສິນຄ້າ' : 'Add and deduct inventory stock'}
        />

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">{locale === 'lo' ? 'ການແຈ້ງເຕືອນອັດຕະໂນມັດ' : 'Automatic Notifications'}</h4>
              <p className="text-sm text-amber-700">
                {locale === 'lo' 
                  ? 'ທຸກຄັ້ງທີ່ມີການເບີກສິນຄ້າ ລະບົບຈະແຈ້ງເຕືອນໄປຫາ Admin ອັດຕະໂນມັດ' 
                  : 'Every stock deduction will automatically notify Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={locale === 'lo' ? 'ສິນຄ້າທັງໝົດ' : 'Total Items'} value={formatNumber(stats.totalItems)} icon={<Package className="w-6 h-6" />} color="blue" />
          <StatCard title={locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ' : 'Low Stock'} value={formatNumber(stats.lowStock)} icon={<AlertTriangle className="w-6 h-6" />} color={stats.lowStock > 0 ? 'amber' : 'emerald'} />
          <StatCard title={locale === 'lo' ? 'ເຄື່ອນໄຫວມື້ນີ້' : 'Today Movements'} value={formatNumber(stats.movementsToday)} icon={<History className="w-6 h-6" />} color="purple" />
          <StatCard title={locale === 'lo' ? 'ມູນຄ່າລວມ' : 'Total Value'} value={formatCurrency(stats.totalValue)} icon={<Package className="w-6 h-6" />} color="emerald" />
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Alert variant="warning" title={locale === 'lo' ? `ສິນຄ້າໃກ້ໝົດ: ${lowStockItems.length} ລາຍການ` : `Low stock: ${lowStockItems.length} items`}>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.map(item => (
                <span key={item.id} className="px-3 py-1 bg-amber-200/50 text-amber-800 rounded-full text-sm font-medium">
                  {locale === 'lo' ? item.name_lo : item.name} ({formatNumber(item.quantity)})
                </span>
              ))}
            </div>
          </Alert>
        )}

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder={locale === 'lo' ? 'ຄົ້ນຫາສິນຄ້າ...' : 'Search items...'} />

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} hover className={`p-0 overflow-hidden ${item.quantity <= item.min_quantity ? 'ring-2 ring-amber-300' : ''}`}>
              {/* Product Image */}
              <div className="relative h-32 bg-gray-100">
                <img
                  src={getImageSrc(item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = getProductImageUrl(item.name, item.category); }}
                />
                {item.quantity <= item.min_quantity && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="w-6 h-6 text-amber-500 drop-shadow-lg" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{locale === 'lo' ? item.name_lo : item.name}</h3>
                <p className="text-xs text-gray-500 font-mono mb-3">{item.sku}</p>
                
                <div className="flex items-center justify-center py-3 bg-gray-50 rounded-xl mb-4">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${item.quantity <= item.min_quantity ? 'text-amber-600' : item.quantity === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatNumber(item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{locale === 'lo' ? 'ຄົງເຫຼືອ' : 'In Stock'} (Min: {formatNumber(item.min_quantity)})</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="success" size="sm" className="flex-1" onClick={() => openAdjustModal(item, 'in')} icon={<Plus className="w-4 h-4" />}>
                    {locale === 'lo' ? 'ເພີ່ມ' : 'Add'}
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => openAdjustModal(item, 'out')} icon={<Minus className="w-4 h-4" />} disabled={item.quantity <= 0}>
                    {locale === 'lo' ? 'ເບີກ' : 'Use'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Movement History */}
        <Card padding="none">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">{locale === 'lo' ? 'ປະຫວັດການເຄື່ອນໄຫວລ່າສຸດ' : 'Recent Stock Movements'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ວັນທີ/ເວລາ' : 'Date/Time'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ສິນຄ້າ' : 'Item'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ປະເພດ' : 'Type'}</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ຈຳນວນ' : 'Qty'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ຄົງເຫຼືອ' : 'Stock'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ເຫດຜົນ' : 'Reason'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{locale === 'lo' ? 'ຜູ້ເບີກ' : 'By'}</th>
              </tr></thead>
              <tbody className="divide-y">
                {stockMovements.slice(0, 15).map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.type === 'out' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{m.date}</div>
                      {m.time && <div className="text-xs text-gray-400">{m.time}</div>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{locale === 'lo' ? m.inventory_name_lo : m.inventory_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={m.type === 'in' ? 'success' : 'danger'}>
                        {m.type === 'in' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {m.type === 'in' ? (locale === 'lo' ? 'ເຂົ້າ' : 'In') : (locale === 'lo' ? 'ອອກ' : 'Out')}
                      </Badge>
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${m.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'in' ? '+' : '-'}{formatNumber(m.quantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatNumber(m.previous_qty)} → <span className="font-medium text-gray-900">{formatNumber(m.new_qty)}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{locale === 'lo' && m.reason_lo ? m.reason_lo : m.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{m.created_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Adjust Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} 
          title={adjustType === 'in' ? (locale === 'lo' ? 'ເພີ່ມສະຕັອກ' : 'Add Stock') : (locale === 'lo' ? 'ເບີກສະຕັອກ' : 'Deduct Stock')}>
          {selectedItem && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <div className={`flex items-center gap-4 p-4 rounded-xl ${adjustType === 'in' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <img 
                  src={getImageSrc(selectedItem)}
                  alt={selectedItem.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = getProductImageUrl(selectedItem.name, selectedItem.category); }}
                />
                <div>
                  <p className="font-semibold text-gray-900">{locale === 'lo' ? selectedItem.name_lo : selectedItem.name}</p>
                  <p className="text-sm text-gray-500">{locale === 'lo' ? 'ຄົງເຫຼືອປັດຈຸບັນ:' : 'Current stock:'} <span className="font-bold text-lg">{formatNumber(selectedItem.quantity)}</span></p>
                </div>
              </div>

              {/* Notification Notice */}
              {adjustType === 'out' && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    {locale === 'lo' 
                      ? `การเบิกนี้จะแจ้งเตือนไปหา Admin โดย ${user?.full_name || 'User'}`
                      : `This deduction will notify Admin by ${user?.full_name || 'User'}`}
                  </p>
                </div>
              )}
              
              <Input
                label={locale === 'lo' ? 'ຈຳນວນ' : 'Quantity'}
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                min={1}
                max={adjustType === 'out' ? selectedItem.quantity : 9999}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'lo' ? 'ເຫດຜົນ' : 'Reason'}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickReasons.map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, reason: r })}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${form.reason === r ? (adjustType === 'in' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg" placeholder={locale === 'lo' ? 'ຫຼື ພິມເຫດຜົນອື່ນ...' : 'Or type other reason...'} required />
              </div>

              <div className={`p-4 rounded-xl ${adjustType === 'in' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{locale === 'lo' ? 'ສະຕັອກໃໝ່:' : 'New stock:'}</span>
                  <span className={`text-2xl font-bold ${adjustType === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatNumber(adjustType === 'in' 
                      ? selectedItem.quantity + (Number(form.quantity) || 0)
                      : Math.max(0, selectedItem.quantity - (Number(form.quantity) || 0)))}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                </Button>
                <Button type="submit" variant={adjustType === 'in' ? 'success' : 'danger'} className="flex-1">
                  {locale === 'lo' ? 'ຢືນຢັນ' : 'Confirm'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
}
