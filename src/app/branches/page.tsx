'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useBranchStore, useDataStore } from '@/lib/store';
import { useI18n } from '@/contexts/I18nContext';
import SidebarLayout from '@/components/SidebarLayout';
import { Card, Button, Modal, Badge, Input, PageHeader, SearchInput, EmptyState } from '@/components/ui';
import { 
  Building2, Plus, Edit2, Trash2, MapPin, Phone, Users, 
  CheckCircle, XCircle, ArrowLeft, Shield, UserCheck 
} from 'lucide-react';

export default function BranchesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { branches, userBranches, addBranch, updateBranch, deleteBranch, setUserBranches } = useBranchStore();
  const { users } = useDataStore();
  const { locale } = useI18n();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    name_en: '',
    code: '',
    address: '',
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    if (user?.role !== 'admin') router.push('/select-branch');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const filtered = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.name_en.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBranch(null);
    setForm({ name: '', name_en: '', code: '', address: '', phone: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (branch: any) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      name_en: branch.name_en,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      is_active: branch.is_active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    
    if (editingBranch) {
      updateBranch(editingBranch.id, form);
    } else {
      addBranch(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm(locale === 'lo' ? 'ຕ້ອງການລຶບສາຂານີ້ແທ້ບໍ?' : 'Are you sure you want to delete this branch?')) {
      deleteBranch(id);
    }
  };

  const openUserModal = (branch: any) => {
    setSelectedBranch(branch);
    setShowUserModal(true);
  };

  const getUsersForBranch = (branchId: number) => {
    return users.filter(u => 
      userBranches.some(ub => ub.user_id === u.id && ub.branch_id === branchId)
    );
  };

  const toggleUserBranch = (userId: number, branchId: number) => {
    const currentBranches = userBranches.filter(ub => ub.user_id === userId).map(ub => ub.branch_id);
    if (currentBranches.includes(branchId)) {
      setUserBranches(userId, currentBranches.filter(id => id !== branchId));
    } else {
      setUserBranches(userId, [...currentBranches, branchId]);
    }
  };

  const isUserInBranch = (userId: number, branchId: number) => {
    return userBranches.some(ub => ub.user_id === userId && ub.branch_id === branchId);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title={locale === 'lo' ? 'ຈັດການສາຂາ' : 'Branch Management'}
          subtitle={locale === 'lo' ? 'ເພີ່ມ, ແກ້ໄຂ ແລະ ກຳນົດສິດເຂົ້າເຖິງສາຂາ' : 'Add, edit and manage branch access'}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/select-branch')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === 'lo' ? 'ກັບຄືນ' : 'Back'}
              </Button>
              <Button icon={<Plus className="w-5 h-5" />} onClick={openAddModal}>
                {locale === 'lo' ? 'ເພີ່ມສາຂາ' : 'Add Branch'}
              </Button>
            </div>
          }
        />

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={locale === 'lo' ? 'ຄົ້ນຫາສາຂາ...' : 'Search branches...'}
        />

        {/* Branch List */}
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Building2 className="w-8 h-8" />}
                title={locale === 'lo' ? 'ບໍ່ພົບສາຂາ' : 'No branches found'}
              />
            </Card>
          ) : (
            filtered.map((branch) => {
              const branchUsers = getUsersForBranch(branch.id);
              return (
                <Card key={branch.id} hover className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5">
                    {/* Branch Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${branch.is_active ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Building2 className="w-7 h-7" />
                    </div>

                    {/* Branch Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {locale === 'lo' ? branch.name : branch.name_en}
                        </h3>
                        <Badge variant={branch.is_active ? 'success' : 'default'}>
                          {branch.code}
                        </Badge>
                        {!branch.is_active && (
                          <Badge variant="danger">
                            {locale === 'lo' ? 'ປິດໃຊ້ງານ' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {branch.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {branch.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {branchUsers.length} {locale === 'lo' ? 'ຜູ້ໃຊ້' : 'users'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => openUserModal(branch)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        {locale === 'lo' ? 'ກຳນົດສິດ' : 'Access'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => openEditModal(branch)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Add/Edit Branch Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingBranch 
            ? (locale === 'lo' ? 'ແກ້ໄຂສາຂາ' : 'Edit Branch')
            : (locale === 'lo' ? 'ເພີ່ມສາຂາໃໝ່' : 'Add New Branch')
          }
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'lo' ? 'ຊື່ສາຂາ (ລາວ)' : 'Branch Name (Lao)'}
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ສາຂາຫຼັກ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'lo' ? 'ຊື່ສາຂາ (ອັງກິດ)' : 'Branch Name (English)'}
                </label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="Main Branch"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'lo' ? 'ລະຫັດສາຂາ' : 'Branch Code'}
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="MAIN"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'lo' ? 'ເບີໂທ' : 'Phone'}
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="021 312 456"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'lo' ? 'ທີ່ຢູ່' : 'Address'}
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={locale === 'lo' ? 'ບ້ານ..., ເມືອງ...' : 'Village..., District...'}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">
                  {locale === 'lo' ? 'ເປີດໃຊ້ງານ' : 'Active'}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                {locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name || !form.code}>
                {editingBranch 
                  ? (locale === 'lo' ? 'ບັນທຶກ' : 'Save')
                  : (locale === 'lo' ? 'ເພີ່ມສາຂາ' : 'Add Branch')
                }
              </Button>
            </div>
          </div>
        </Modal>

        {/* User Access Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title={`${locale === 'lo' ? 'ກຳນົດສິດເຂົ້າເຖິງ' : 'Manage Access'} - ${selectedBranch?.name || ''}`}
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {locale === 'lo' 
                ? 'ເລືອກຜູ້ໃຊ້ທີ່ສາມາດເຂົ້າເຖິງສາຂານີ້ໄດ້'
                : 'Select users who can access this branch'}
            </p>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {users.filter(u => u.role !== 'admin').map((u) => {
                const hasAccess = selectedBranch && isUserInBranch(u.id, selectedBranch.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      hasAccess ? 'bg-rose-50 border-2 border-rose-200' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={hasAccess}
                      onChange={() => selectedBranch && toggleUserBranch(u.id, selectedBranch.id)}
                      className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{u.full_name}</p>
                      <p className="text-sm text-gray-500">{u.email} • {u.role}</p>
                    </div>
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300" />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="bg-amber-50 p-3 rounded-xl flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                {locale === 'lo' 
                  ? 'ຜູ້ໃຊ້ທີ່ເປັນ Admin ສາມາດເຂົ້າເຖິງທຸກສາຂາໂດຍອັດຕະໂນມັດ'
                  : 'Admin users automatically have access to all branches'}
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1" onClick={() => setShowUserModal(false)}>
                {locale === 'lo' ? 'ສຳເລັດ' : 'Done'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </SidebarLayout>
  );
}
