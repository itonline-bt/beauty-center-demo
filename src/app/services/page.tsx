'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, SearchInput, EmptyState, StatCard } from '@/components/ui';
import { Plus, Scissors, Clock, Edit2, Trash2, Tag, TrendingUp, DollarSign, Grid } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { services, serviceCategories, appointments, addService, updateService, deleteService } = useDataStore();
  const { locale, t, formatCurrency } = useI18n();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', name_lo: '', category_id: '', price: '', duration: '', description: '' });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.name_lo.includes(search);
      const matchCategory = !categoryFilter || s.category_id === Number(categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [services, search, categoryFilter]);

  const stats = useMemo(() => {
    const completedAppts = appointments.filter(a => a.status === 'completed');
    const serviceRevenue = services.map(s => ({
      ...s,
      bookings: completedAppts.filter(a => a.service_id === s.id).length,
      revenue: completedAppts.filter(a => a.service_id === s.id).reduce((sum, a) => sum + a.total_price, 0),
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      total: services.length,
      categories: serviceCategories.length,
      avgPrice: services.length > 0 ? Math.round(services.reduce((s, sv) => s + sv.price, 0) / services.length) : 0,
      topService: serviceRevenue[0],
    };
  }, [services, serviceCategories, appointments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = serviceCategories.find(c => c.id === Number(form.category_id));
    const data = {
      name: form.name,
      name_lo: form.name_lo,
      category_id: Number(form.category_id),
      category_name: category?.name || '',
      price: Number(form.price),
      duration: Number(form.duration),
    };
    if (editItem) {
      updateService(editItem.id, data);
    } else {
      addService(data);
    }
    closeModal();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({
        name: item.name, name_lo: item.name_lo, category_id: String(item.category_id),
        price: String(item.price), duration: String(item.duration), description: ''
      });
    } else {
      setEditItem(null);
      setForm({ name: '', name_lo: '', category_id: '', price: '', duration: '60', description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const categoryColors: Record<number, string> = {
    1: 'from-rose-400 to-pink-500',
    2: 'from-blue-400 to-indigo-500',
    3: 'from-purple-400 to-violet-500',
    4: 'from-emerald-400 to-teal-500',
    5: 'from-amber-400 to-orange-500',
    6: 'from-cyan-400 to-sky-500',
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={t('services.title')}
          subtitle={locale === 'lo' ? 'ຈັດການບໍລິການຂອງຮ້ານ' : 'Manage your salon services'}
          action={
            <Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
              {t('services.add')}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={locale === 'lo' ? 'ບໍລິການທັງໝົດ' : 'Total Services'}
            value={stats.total}
            icon={<Scissors className="w-6 h-6" />}
            color="rose"
          />
          <StatCard
            title={locale === 'lo' ? 'ໝວດໝູ່' : 'Categories'}
            value={stats.categories}
            icon={<Grid className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title={locale === 'lo' ? 'ລາຄາສະເລ່ຍ' : 'Average Price'}
            value={formatCurrency(stats.avgPrice)}
            icon={<DollarSign className="w-6 h-6" />}
            color="emerald"
          />
          <StatCard
            title={locale === 'lo' ? 'ບໍລິການຍອດນິຍົມ' : 'Top Service'}
            value={stats.topService ? (locale === 'lo' ? stats.topService.name_lo : stats.topService.name).substring(0, 15) : '-'}
            icon={<TrendingUp className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-lg bg-white"
          >
            <option value="">{t('common.all')} {locale === 'lo' ? 'ໝວດໝູ່' : 'Categories'}</option>
            {serviceCategories.map(c => (
              <option key={c.id} value={c.id}>{locale === 'lo' ? c.name_lo : c.name}</option>
            ))}
          </select>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <EmptyState
                  icon={<Scissors className="w-8 h-8" />}
                  title={locale === 'lo' ? 'ບໍ່ພົບບໍລິການ' : 'No services found'}
                  action={<Button onClick={() => openModal()}>{t('services.add')}</Button>}
                />
              </Card>
            </div>
          ) : (
            filtered.map((service) => (
              <Card key={service.id} hover className="overflow-hidden p-0">
                <div className={`h-2 bg-gradient-to-r ${categoryColors[service.category_id] || 'from-gray-400 to-gray-500'}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {locale === 'lo' ? service.name_lo : service.name}
                      </h3>
                      <Badge variant="default" size="sm">
                        <Tag className="w-3 h-3 mr-1" />
                        {service.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(service)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => deleteService(service.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{service.duration} {locale === 'lo' ? 'ນາທີ' : 'min'}</span>
                    </div>
                    <span className="text-xl font-bold text-rose-600">{formatCurrency(service.price)}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editItem ? t('common.edit') : t('services.add')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={`${t('services.name')} (English)`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Service name in English"
              required
            />
            <Input
              label={`${t('services.name')} (ລາວ)`}
              value={form.name_lo}
              onChange={(e) => setForm({ ...form, name_lo: e.target.value })}
              placeholder="ຊື່ບໍລິການເປັນພາສາລາວ"
              required
            />
            <Select
              label={t('services.category')}
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={serviceCategories.map(c => ({ value: c.id, label: locale === 'lo' ? c.name_lo : c.name }))}
              placeholder={`-- ${locale === 'lo' ? 'ເລືອກໝວດໝູ່' : 'Select Category'} --`}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('services.price')}
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                required
              />
              <Input
                label={`${t('services.duration')} (${locale === 'lo' ? 'ນາທີ' : 'minutes'})`}
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="60"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </SidebarLayout>
  );
}
