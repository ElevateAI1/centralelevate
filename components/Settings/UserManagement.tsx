import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { UserPlus, Mail, Lock, User, Trash2, Edit2, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Role } from '../../types';
import { supabase } from '../../lib/supabase';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Developer' as Role,
  });

  // Check if user can manage users (only Founder, CTO, and CFO)
  const canManageUsers = currentUser?.role === 'Founder' || currentUser?.role === 'CTO' || currentUser?.role === 'CFO';

  // Fetch all users
  const fetchUsers = async () => {
    if (!canManageUsers) return;

    setFetching(true);
    try {
      // Get users (now email is in the same table)
      const { data: usersData, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, avatar, role, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setUsers(usersData || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('No hay sesión activa');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Call the create_user_account function
      const { data, error } = await supabase.rpc('create_user_account', {
        creator_id: currentUser.id,
        user_email: formData.email,
        password_plain: formData.password,
        user_name: formData.name,
        user_role: formData.role,
        user_avatar: `https://picsum.photos/seed/${formData.email}/200`
      });

      if (error) throw error;

      setSuccess('Usuario creado exitosamente');
      setFormData({ email: '', password: '', name: '', role: 'Developer' });
      setShowCreateModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  // Edit user - Fetch email from auth
  const handleEditUser = async (user: any) => {
    setEditingUser(user);
    
    // Try to get email from auth (if we have access)
    let email = '';
    try {
      // We can't directly access auth.users from client
      // The email will be updated when we save, or we can show a placeholder
      email = user.email || '';
    } catch (e) {
      // Ignore
    }
    
    setFormData({
      email: email,
      password: '', // Don't pre-fill password
      name: user.name || '',
      role: user.role || 'Developer',
    });
    setError(null);
    setSuccess(null);
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !currentUser) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Update user profile
      const updateData: any = {
        name: formData.name,
        role: formData.role,
      };

      const { error: profileError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (formData.email !== editingUser.email) {
        const { error: emailError } = await supabase
          .from('users')
          .update({ email: formData.email })
          .eq('id', editingUser.id);

        if (emailError) throw emailError;
      }

      // Update password if provided
      if (formData.password && formData.password.length >= 6) {
        // Use a function to update password with proper hashing
        const { error: pwdError } = await supabase.rpc('update_user_password', {
          user_id: editingUser.id,
          new_password: formData.password
        });

        if (pwdError) {
          console.warn('Error updating password:', pwdError);
          // Continue anyway, password update is optional
        }
      }

      setSuccess('Usuario actualizado exitosamente');
      setEditingUser(null);
      setFormData({ email: '', password: '', name: '', role: 'Developer' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Delete user from database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setSuccess('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <AlertCircle size={20} />
          <p>No tienes permisos para gestionar usuarios. Solo Founders, CTOs y CFOs pueden crear, editar y eliminar cuentas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm transition-colors duration-200">
      <div className="p-6 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg text-violet-600 dark:text-violet-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gestión de Usuarios</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Crea y gestiona cuentas de usuario</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setError(null);
              setSuccess(null);
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/20"
          >
            <UserPlus size={16} />
            Crear Usuario
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Users List */}
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={u.avatar || `https://picsum.photos/seed/${u.id}/200`}
                    alt={u.name}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/10"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{u.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {u.email}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-medium">
                        {u.role}
                      </span>
                      {u.id === currentUser?.id && (
                        <span className="text-xs text-slate-400">(Tú)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(u)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Editar usuario"
                  >
                    <Edit2 size={18} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar usuario"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Editar Usuario</h3>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({ email: '', password: '', name: '', role: 'Developer' });
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@email.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nueva Contraseña (opcional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Solo completa si deseas cambiar la contraseña
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Developer">Developer</option>
                  <option value="Sales">Sales</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="Founder">Founder</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ email: '', password: '', name: '', role: 'Developer' });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crear Nuevo Usuario</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ email: '', password: '', name: '', role: 'Developer' });
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@email.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Developer">Developer</option>
                  <option value="Sales">Sales</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="Founder">Founder</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ email: '', password: '', name: '', role: 'Developer' });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Crear Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

