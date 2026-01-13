'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Input, PageHeader, Badge, Alert } from '@/components/ui';
import { User, Mail, Phone, Shield, Calendar, Edit2, Camera, Save, X, Key, Bell, Check } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { updateUser, users } = useDataStore();
  const { locale } = useI18n();
  
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    full_name: '', email: '', phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current: '', new_password: '', confirm: ''
  });

  useEffect(() => { 
    if (!isAuthenticated) router.push('/login');
    if (user) {
      setForm({ full_name: user.full_name || '', email: user.email || '', phone: user.phone || '' });
      setAvatar(user.avatar || null);
    }
  }, [isAuthenticated, user, router]);
  
  if (!isAuthenticated || !user) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert(locale === 'lo' ? 'ຮູບຕ້ອງນ້ອຍກວ່າ 1MB' : 'Image must be less than 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setAvatar(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUser(user.id, { ...form, avatar });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm) {
      alert(locale === 'lo' ? 'ລະຫັດຜ່ານບໍ່ກົງກັນ' : 'Passwords do not match');
      return;
    }
    // In demo, just close modal
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new_password: '', confirm: '' });
    alert(locale === 'lo' ? 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ' : 'Password changed successfully');
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning'> = { admin: 'success', manager: 'info', staff: 'warning' };
    return <Badge variant={colors[role] || 'default'}>{role.toUpperCase()}</Badge>;
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <PageHeader
          title={locale === 'lo' ? 'ໂປຣໄຟລ໌' : 'My Profile'}
          subtitle={locale === 'lo' ? 'ຈັດການຂໍ້ມູນສ່ວນຕົວ' : 'Manage your personal information'}
          action={
            !editing ? (
              <Button icon={<Edit2 className="w-5 h-5" />} onClick={() => setEditing(true)}>
                {locale === 'lo' ? 'ແກ້ໄຂ' : 'Edit'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" icon={<X className="w-5 h-5" />} onClick={() => { setEditing(false); setForm({ full_name: user.full_name, email: user.email, phone: user.phone || '' }); }}>
                  {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                </Button>
                <Button variant="success" icon={<Save className="w-5 h-5" />} onClick={handleSave}>
                  {locale === 'lo' ? 'ບັນທຶກ' : 'Save'}
                </Button>
              </div>
            )
          }
        />

        {saved && (
          <Alert variant="success" title={locale === 'lo' ? 'ບັນທຶກສຳເລັດ!' : 'Saved successfully!'} children={undefined} />
        )}

        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
          
          {/* Avatar & Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-white">{user.full_name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </div>
                {editing && (
                  <button onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Name & Role */}
              <div className="flex-1 text-center sm:text-left pt-4 sm:pt-0">
                {editing ? (
                  <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-rose-500 bg-transparent outline-none w-full sm:w-auto" />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  {getRoleBadge(user.role)}
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{user.email}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Key className="w-4 h-4" />} onClick={() => setShowPasswordModal(true)}>
                  {locale === 'lo' ? 'ປ່ຽນລະຫັດ' : 'Password'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" />
              {locale === 'lo' ? 'ຂໍ້ມູນສ່ວນຕົວ' : 'Personal Information'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ຊື່ເຕັມ' : 'Full Name'}</label>
                {editing ? (
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                ) : (
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ອີເມລ' : 'Email'}</label>
                {editing ? (
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                ) : (
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ເບີໂທ' : 'Phone'}</label>
                {editing ? (
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+856 20 xxxxxxxx" />
                ) : (
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> {user.phone || '-'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-500" />
              {locale === 'lo' ? 'ຂໍ້ມູນບັນຊີ' : 'Account Information'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ບົດບາດ' : 'Role'}</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" /> {user.role?.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ສະຖານະ' : 'Status'}</label>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-emerald-600">{locale === 'lo' ? 'ເຄື່ອນໄຫວ' : 'Active'}</span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">{locale === 'lo' ? 'ສ້າງເມື່ອ' : 'Created'}</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> {user.created_at || '2025-01-01'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-scaleIn">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-rose-500" />
                {locale === 'lo' ? 'ປ່ຽນລະຫັດຜ່ານ' : 'Change Password'}
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input type="password" label={locale === 'lo' ? 'ລະຫັດປັດຈຸບັນ' : 'Current Password'} 
                  value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required />
                <Input type="password" label={locale === 'lo' ? 'ລະຫັດໃໝ່' : 'New Password'} 
                  value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
                <Input type="password" label={locale === 'lo' ? 'ຢືນຢັນລະຫັດໃໝ່' : 'Confirm New Password'} 
                  value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                    {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {locale === 'lo' ? 'ບັນທຶກ' : 'Save'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
