'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, Select, PageHeader, SearchInput, EmptyState, StatCard } from '@/components/ui';
import { Plus, Users, Edit2, Trash2, Shield, UserCheck, UserX, Mail, Phone } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { users, addUser, updateUser, deleteUser } = useDataStore();
  const { locale, t } = useI18n();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ email: '', full_name: '', full_name_lo: '', phone: '', role: 'staff', is_active: true });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (currentUser?.role === 'staff') router.push('/dashboard');
  }, [isAuthenticated, currentUser, router]);
  
  if (!isAuthenticated || currentUser?.role === 'staff') return null;

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
  }), [users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateUser(editItem.id, form);
    else addUser(form);
    closeModal();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setForm({ email: item.email, full_name: item.full_name, full_name_lo: item.full_name_lo || '', phone: item.phone, role: item.role, is_active: item.is_active });
    } else {
      setEditItem(null);
      setForm({ email: '', full_name: '', full_name_lo: '', phone: '', role: 'staff', is_active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'danger' | 'info' | 'default'> = { admin: 'danger', manager: 'info', staff: 'default' };
    const labels: Record<string, string> = { admin: locale === 'lo' ? 'ແອດມິນ' : 'Admin', manager: locale === 'lo' ? 'ຜູ້ຈັດການ' : 'Manager', staff: locale === 'lo' ? 'ພະນັກງານ' : 'Staff' };
    return <Badge variant={variants[role] || 'default'}>{labels[role]}</Badge>;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={t('users.title')}
          subtitle={locale === 'lo' ? 'ຈັດການບັນຊີຜູ້ໃຊ້ງານ' : 'Manage user accounts'}
          action={
            <Button icon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
              {t('users.add')}
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={locale === 'lo' ? 'ຜູ້ໃຊ້ທັງໝົດ' : 'Total Users'} value={stats.total} icon={<Users className="w-6 h-6" />} color="blue" />
          <StatCard title={locale === 'lo' ? 'ເປີດໃຊ້ງານ' : 'Active'} value={stats.active} icon={<UserCheck className="w-6 h-6" />} color="emerald" />
          <StatCard title={locale === 'lo' ? 'ແອດມິນ' : 'Admins'} value={stats.admin} icon={<Shield className="w-6 h-6" />} color="rose" />
          <StatCard title={locale === 'lo' ? 'ພະນັກງານ' : 'Staff'} value={stats.staff} icon={<Users className="w-6 h-6" />} color="purple" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} /></div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-white">
            <option value="">{locale === 'lo' ? 'ທຸກບົດບາດ' : 'All Roles'}</option>
            <option value="admin">{locale === 'lo' ? 'ແອດມິນ' : 'Admin'}</option>
            <option value="manager">{locale === 'lo' ? 'ຜູ້ຈັດການ' : 'Manager'}</option>
            <option value="staff">{locale === 'lo' ? 'ພະນັກງານ' : 'Staff'}</option>
          </select>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <Card><EmptyState icon={<Users className="w-8 h-8" />} title={locale === 'lo' ? 'ບໍ່ພົບຜູ້ໃຊ້' : 'No users found'} /></Card>
            </div>
          ) : filtered.map((user) => (
            <Card key={user.id} hover className={`${!user.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-red-600' : user.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      {!user.is_active && <Badge variant="danger"><UserX className="w-3 h-3 mr-1" />{locale === 'lo' ? 'ປິດ' : 'Inactive'}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(user)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                  {user.id !== currentUser?.id && (
                    <button onClick={() => deleteUser(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{user.email}</div>
                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{user.phone}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editItem ? t('common.edit') : t('users.add')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label={`${t('users.name')} (EN)`} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              <Input label={`${t('users.name')} (ລາວ)`} value={form.full_name_lo} onChange={(e) => setForm({ ...form, full_name_lo: e.target.value })} />
            </div>
            <Input label={t('users.phone')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label={t('users.role')} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[{ value: 'staff', label: locale === 'lo' ? 'ພະນັກງານ' : 'Staff' }, { value: 'manager', label: locale === 'lo' ? 'ຜູ້ຈັດການ' : 'Manager' }, { value: 'admin', label: locale === 'lo' ? 'ແອດມິນ' : 'Admin' }]} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-rose-500" />
              <label htmlFor="is_active" className="text-sm">{locale === 'lo' ? 'ເປີດໃຊ້ງານ' : 'Active'}</label>
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
