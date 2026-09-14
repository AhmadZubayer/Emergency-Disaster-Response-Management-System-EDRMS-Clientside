'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Plus,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface AccountRecord {
  id: string;
  email: string;
  role: string;
  user_id: string;
  created_at: string;
  deleted_at?: string | null;
  user?: {
    id: string;
    name?: string;
    phone?: string;
  };
}

export default function AdminAccountsPage() {
  const axiosSecure = useAxiosSecure();
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Modal states
  const [roleModalAccount, setRoleModalAccount] = useState<AccountRecord | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create Account Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        includeDeleted,
      };
      if (selectedRole !== 'all') {
        params.role = selectedRole;
      }
      const res = await axiosSecure.get('/admin/accounts', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setAccounts(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setAccounts(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, selectedRole, includeDeleted]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleRoleChange = async () => {
    if (!roleModalAccount || !newRole) return;
    setUpdating(true);
    try {
      await axiosSecure.patch(`/admin/accounts/${roleModalAccount.user_id}/role`, {
        role: newRole,
      });
      setActionSuccess(`Role updated to ${newRole.toUpperCase()} for ${roleModalAccount.email}`);
      setRoleModalAccount(null);
      fetchAccounts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!createData.name || !createData.email || !createData.password) {
      setCreateError('Name, email, and password are required.');
      return;
    }
    setCreating(true);
    try {
      await axiosSecure.post('/admin/accounts', createData);
      setActionSuccess(`Account ${createData.email} created successfully as ${createData.role.toUpperCase()}`);
      setCreateModalOpen(false);
      setCreateData({ name: '', email: '', password: '', role: 'user', phone: '' });
      fetchAccounts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (error: any) {
      setCreateError(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const handleSoftDelete = async (account: AccountRecord) => {
    if (!confirm(`Are you sure you want to soft delete account: ${account.email}?`)) return;
    try {
      await axiosSecure.delete(`/admin/accounts/${account.user_id}`);
      setActionSuccess(`Account ${account.email} soft deleted successfully.`);
      fetchAccounts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (error) {
      console.error('Failed to soft delete account:', error);
    }
  };

  const handleRestore = async (account: AccountRecord) => {
    try {
      await axiosSecure.patch(`/admin/accounts/${account.user_id}/restore`);
      setActionSuccess(`Account ${account.email} restored successfully.`);
      fetchAccounts();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (error) {
      console.error('Failed to restore account:', error);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const term = search.toLowerCase();
    const nameMatch = acc.user?.name?.toLowerCase().includes(term);
    const emailMatch = acc.email.toLowerCase().includes(term);
    return !search || nameMatch || emailMatch;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'relief_org':
        return 'default';
      case 'volunteer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, add new records, change roles, and handle soft deletions.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
            Total: {total} Records
          </Badge>
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 gap-1.5 font-bold shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add Account</span>
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs rounded-md border border-input bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="relief_org">Relief Org</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => {
                    setIncludeDeleted(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-input text-emerald-600 focus:ring-emerald-500 size-4"
                />
                <span>Include Deleted</span>
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      Loading account records...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => {
                    const isDeleted = !!account.deleted_at;
                    return (
                      <tr
                        key={account.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          isDeleted ? 'opacity-60 bg-red-500/5' : ''
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-foreground">
                          {account.user?.name || 'N/A'}
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono text-xs">
                          {account.email}
                        </td>
                        <td className="p-3.5">
                          <Badge variant={getRoleBadgeVariant(account.role)} className="uppercase text-[10px] font-bold">
                            {account.role}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-xs text-muted-foreground">
                          {new Date(account.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {!isDeleted ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-xs font-semibold"
                                onClick={() => {
                                  setRoleModalAccount(account);
                                  setNewRole(account.role);
                                }}
                              >
                                <Shield className="size-3.5 text-blue-600" />
                                <span>Role</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 gap-1 text-xs font-semibold"
                                onClick={() => handleSoftDelete(account)}
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => handleRestore(account)}
                            >
                              <RotateCcw className="size-3.5" />
                              <span>Restore</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border/40 mt-4">
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages} ({total} Total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Account Modal */}
      {createModalOpen && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-emerald-600" />
                <span>Create New Account</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAccount} className="space-y-3 py-2 text-sm">
              {createError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                  {createError}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Full Name</label>
                <Input
                  required
                  placeholder="John Doe"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="user@example.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Password</label>
                <Input
                  required
                  type="password"
                  placeholder="Password123!"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Phone Number</label>
                <Input
                  placeholder="+8801700000000"
                  value={createData.phone}
                  onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Assign Role</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">User (Standard)</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="relief_org">Relief Organization</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <DialogFooter className="gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-500">
                  {creating ? 'Creating...' : 'Create Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Role Change Modal */}
      {roleModalAccount && (
        <Dialog open={!!roleModalAccount} onOpenChange={() => setRoleModalAccount(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                <span>Change User Role</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3 text-sm">
              <p>
                Target User: <strong>{roleModalAccount.user?.name || roleModalAccount.email}</strong>
              </p>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">User (Standard)</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="relief_org">Relief Organization</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setRoleModalAccount(null)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange} disabled={updating}>
                {updating ? 'Updating...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
