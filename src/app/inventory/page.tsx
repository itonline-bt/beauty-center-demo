'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, SearchInput, StatCard, Alert } from '@/components/ui';
import { formatCurrency, formatNumber, getProductImageUrl } from '@/lib/utils';
import { Plus, Package, Edit2, Trash2, AlertTriangle, DollarSign, BarChart2, Image as ImageIcon, Upload, X, Camera } from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { inventory, inventoryCategories, addInventoryItem, updateInventoryItem, deleteInventoryItem, updateInventoryImage } = useDataStore();
  const { locale, t } = useI18n();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: '', name_lo: '', category_id: '', sku: '',
    quantity: '', min_quantity: '', cost_price: '', sell_price: '',
    unit: 'piece', supplier: '', location: '', image_url: ''
  });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const filtered = useMemo(() => {
    return inventory.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku && i.sku.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !categoryFilter || i.category_id === Number(categoryFilter);
      const matchStock = !stockFilter || (stockFilter === 'low' && i.quantity <= i.min_quantity) || (stockFilter === 'ok' && i.quantity > i.min_quantity);
      return matchSearch && matchCategory && matchStock;
    });
  }, [inventory, search, categoryFilter, stockFilter]);

  const stats = useMemo(() => {
    const lowStock = inventory.filter(i => i.quantity <= i.min_quantity);
    const totalValue = inventory.reduce((s, i) => s + (i.quantity * i.cost_price), 0);
    const sellValue = inventory.reduce((s, i) => s + (i.quantity * i.sell_price), 0);
    return { total: inventory.length, lowStock: lowStock.length, totalValue, potentialProfit: sellValue - totalValue };
  }, [inventory]);

  const units = [
    { value: 'piece', label: locale === 'lo' ? 'ອັນ' : 'Piece' },
    { value: 'bottle', label: locale === 'lo' ? 'ຂວດ' : 'Bottle' },
    { value: 'box', label: locale === 'lo' ? 'ກ່ອງ' : 'Box' },
    { value: 'pack', label: locale === 'lo' ? 'ແພັກ' : 'Pack' },
    { value: 'set', label: locale === 'lo' ? 'ຊຸດ' : 'Set' },
    { value: 'jar', label: locale === 'lo' ? 'ກະປ໋ອງ' : 'Jar' },
  ];

  // Handle image upload (convert to base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(locale === 'lo' ? 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ' : 'Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(locale === 'lo' ? 'ຮູບພາບຕ້ອງມີຂະໜາດບໍ່ເກີນ 2MB' : 'Image must be less than 2MB');
      return;
    }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      setForm(prev => ({ ...prev, image_url: base64 }));
      setUploading(false);
    };
    reader.onerror = () => {
      alert(locale === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ' : 'Error reading file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setForm(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = inventoryCategories.find(c => c.id === Number(form.category_id));
    const data = {
      name: form.name,
      name_lo: form.name_lo,
      category_id: Number(form.category_id),
      category: category?.name || "",
      sku: form.sku,
      quantity: Number(form.quantity),
      min_quantity: Number(form.min_quantity),
      cost_price: Number(form.cost_price),
      sell_price: Number(form.sell_price),
      unit: form.unit,
      supplier: form.supplier,
      location: form.location,
      image_url: form.image_url || null,
    };
    if (editItem) updateInventoryItem(editItem.id, data);
    else addInventoryItem(data);
    closeModal();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setPreviewImage(item.image_url || null);
      setForm({ 
        name: item.name, name_lo: item.name_lo || '', 
        category_id: String(item.category_id || ''), sku: item.sku || '',
        quantity: String(item.quantity), min_quantity: String(item.min_quantity),
        cost_price: String(item.cost_price), sell_price: String(item.sell_price),
        unit: item.unit || 'piece',
        supplier: item.supplier || '',
        location: item.location || '',
        image_url: item.image_url || '',
      });
    } else {
      setEditItem(null);
      setPreviewImage(null);
      setForm({ name: '', name_lo: '', category_id: '', sku: '', quantity: '0', min_quantity: '5', cost_price: '', sell_price: '', unit: 'piece', supplier: '', location: '', image_url: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => { 
    setShowModal(false); 
    setEditItem(null); 
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) return { label: locale === 'lo' ? 'ໝົດສະຕັອກ' : 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (item.quantity <= item.min_quantity) return { label: locale === 'lo' ? 'ໃກ້ໝົດ' : 'Low Stock', color: 'bg-amber-100 text-amber-700' };
    return { label: locale === 'lo' ? 'ພຽງພໍ' : 'In Stock', color: 'bg-emerald-100 text-emerald-700' };
  };

  const getImageSrc = (item: any) => {
    if (item.image_url && item.image_url.startsWith('data:')) return item.image_url;
    if (item.image_url) return item.image_url;
    return getProductImageUrl(item.name, item.category);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={t('inventory.title')}
          subtitle={locale === 'lo' ? 'ຈັດການສິນຄ້າຄົງຄັງ' : 'Manage inventory items'}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/stock')}>
                {locale === 'lo' ? 'ຕັດສະຕັອກ' : 'Adjust Stock'}
              </Button>
              <Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
                {t('inventory.add')}
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={locale === 'lo' ? 'ສິນຄ້າທັງໝົດ' : 'Total Items'} value={formatNumber(stats.total)} icon={<Package className="w-6 h-6" />} color="blue" />
          <StatCard title={locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ' : 'Low Stock'} value={formatNumber(stats.lowStock)} icon={<AlertTriangle className="w-6 h-6" />} color={stats.lowStock > 0 ? 'amber' : 'emerald'} />
          <StatCard title={locale === 'lo' ? 'ມູນຄ່າສະຕັອກ' : 'Stock Value'} value={formatCurrency(stats.totalValue)} icon={<DollarSign className="w-6 h-6" />} color="purple" />
          <StatCard title={locale === 'lo' ? 'ກຳໄລທີ່ຄາດ' : 'Potential Profit'} value={formatCurrency(stats.potentialProfit)} icon={<BarChart2 className="w-6 h-6" />} color="emerald" />
        </div>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <Alert variant="warning" title={locale === 'lo' ? 'ສິນຄ້າໃກ້ໝົດ!' : 'Low Stock Alert!'}>
            {locale === 'lo' ? `ມີ ${stats.lowStock} ລາຍການທີ່ຕ້ອງສັ່ງເພີ່ມ` : `${stats.lowStock} items need restocking`}
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} /></div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-white">
            <option value="">{t('common.all')} {locale === 'lo' ? 'ໝວດໝູ່' : 'Categories'}</option>
            {inventoryCategories.map(c => <option key={c.id} value={c.id}>{locale === 'lo' ? c.name_lo : c.name}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-white">
            <option value="">{t('common.all')} {locale === 'lo' ? 'ສະຖານະ' : 'Status'}</option>
            <option value="low">{locale === 'lo' ? 'ໃກ້ໝົດ' : 'Low Stock'}</option>
            <option value="ok">{locale === 'lo' ? 'ພຽງພໍ' : 'In Stock'}</option>
          </select>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <Card className="py-12 text-center text-gray-500">{locale === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນ' : 'No items found'}</Card>
            </div>
          ) : filtered.map((item) => {
            const status = getStockStatus(item);
            return (
              <Card key={item.id} hover className="p-0 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = getProductImageUrl(item.name, item.category); }}
                  />
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{locale === 'lo' ? item.name_lo : item.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{item.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div>
                      <p className="text-lg font-bold text-rose-600">{formatCurrency(item.sell_price)}</p>
                      <p className={`text-sm ${item.quantity <= item.min_quantity ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {formatNumber(item.quantity)} {units.find(u => u.value === item.unit)?.label || item.unit}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(item)} className="p-2 rounded-lg hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => deleteInventoryItem(item.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editItem ? t('common.edit') : t('inventory.add')} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'lo' ? 'ຮູບພາບສິນຄ້າ' : 'Product Image'}
              </label>
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <div className="animate-pulse text-gray-400">
                      <Upload className="w-8 h-8 animate-bounce" />
                    </div>
                  ) : previewImage ? (
                    <>
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">
                        {locale === 'lo' ? 'ຄລິກເພື່ອອັບໂຫຼດ' : 'Click to upload'}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    {locale === 'lo' ? 'ອັບໂຫຼດຮູບສິນຄ້າ (PNG, JPG, GIF)' : 'Upload product image (PNG, JPG, GIF)'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {locale === 'lo' ? 'ຂະໜາດສູງສຸດ 2MB' : 'Max size 2MB'}
                  </p>
                  {!previewImage && (
                    <Button type="button" variant="secondary" size="sm" className="mt-2" 
                      icon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>
                      {locale === 'lo' ? 'ເລືອກຮູບ' : 'Choose Image'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label={`${t('inventory.name')} (EN)`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label={`${t('inventory.name')} (ລາວ)`} value={form.name_lo} onChange={(e) => setForm({ ...form, name_lo: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label={locale === 'lo' ? 'ໝວດໝູ່' : 'Category'} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                options={inventoryCategories.map(c => ({ value: c.id, label: locale === 'lo' ? c.name_lo : c.name }))} placeholder="--" required />
              <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="HAIR-001" required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label={locale === 'lo' ? 'ຈຳນວນ' : 'Quantity'} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <Select label={locale === 'lo' ? 'ຫົວໜ່ວຍ' : 'Unit'} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={units} />
              <Input label={locale === 'lo' ? 'ຈຳນວນຕ່ຳສຸດ' : 'Min Qty'} type="number" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={locale === 'lo' ? 'ລາຄາຕົ້ນທຶນ' : 'Cost Price'} type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} required />
              <Input label={locale === 'lo' ? 'ລາຄາຂາຍ' : 'Sell Price'} type="number" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={locale === 'lo' ? 'ຜູ້ສະໜອງ' : 'Supplier'} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder={locale === 'lo' ? 'ຊື່ຜູ້ສະໜອງ...' : 'Supplier name...'} />
              <Input label={locale === 'lo' ? 'ສະຖານທີ່ເກັບ' : 'Location'} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={locale === 'lo' ? 'ຕຳແໜ່ງເກັບ...' : 'Storage location...'} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1">{t('common.save')}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </SidebarLayout>
  );
}
