import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { User, Mail, Briefcase, MapPin, Camera, Save, Loader2, Lock, Bell, Shield, Users as UsersIcon, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProfileView: React.FC = () => {
  const { user, setUser } = useStore();

  if (!user) return null;
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: `${user.name.toLowerCase().replace(' ', '.')}@nexus.ai`,
    role: user.role,
    bio: 'Senior operative with a focus on high-stakes delivery and architectural excellence. Leading the charge in next-gen AI implementation.',
    location: 'San Francisco, CA',
    phone: '+1 (555) 012-3456'
  });

  // Load profile data from localStorage or database
  React.useEffect(() => {
    const savedProfile = localStorage.getItem(`profile_${user.id}`);
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData((prev: any) => ({ ...prev, ...profile }));
        if (profile.coverImage) {
          setCoverPreview(profile.coverImage);
        }
        if (profile.avatar) {
          setAvatarPreview(profile.avatar);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
  }, [user.id]);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Here you would upload to Supabase Storage and update the user's avatar
    // For now, we'll just update the preview
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user name in Supabase
      const { error } = await supabase
        .from('users')
        .update({ name: formData.name })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...user, name: formData.name };
      if (avatarPreview) {
        updatedUser.avatar = avatarPreview;
      }
      setUser(updatedUser);

      // Save profile data to localStorage (including cover)
      localStorage.setItem(`profile_${user.id}`, JSON.stringify({
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        coverImage: coverPreview || null
      }));

      // Update session
      const session = localStorage.getItem('nexus_auth_session');
      if (session) {
        const sessionData = JSON.parse(session);
        sessionData.user = updatedUser;
        localStorage.setItem('nexus_auth_session', JSON.stringify(sessionData));
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="glass-panel p-8 rounded-2xl border border-slate-300 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-300 dark:border-white/5 pb-4">
              <User className="text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Información Personal</h2>
            </div>
            
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Rol</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-white/5 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Dirección de Correo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-500" size={16} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Ubicación</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-500" size={16} />
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ciudad, País"
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Biografía</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
            </form>
          </div>
        );

      case 'Seguridad':
        return (
          <div className="glass-panel p-8 rounded-2xl border border-slate-300 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-300 dark:border-white/5 pb-4">
              <Shield className="text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Seguridad</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Cambiar Contraseña</label>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Contraseña actual"
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <input 
                    type="password" 
                    placeholder="Nueva contraseña"
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirmar nueva contraseña"
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Actualizar Contraseña
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-300 dark:border-white/5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Autenticación de Dos Factores</label>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Agrega una capa adicional de seguridad a tu cuenta.</p>
                <button className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-300 dark:border-white/10">
                  Configurar 2FA
                </button>
              </div>
            </div>
          </div>
        );

      case 'Equipos':
        return (
          <div className="glass-panel p-8 rounded-2xl border border-slate-300 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-300 dark:border-white/5 pb-4">
              <UsersIcon className="text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Equipos</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Gestiona los equipos de los que eres miembro. Los equipos te permiten colaborar con otros miembros de la organización.
              </p>
              
              <div className="bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-medium">Equipo Principal</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Tu rol actual: {user.role}</p>
                  </div>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-medium">
                    Activo
                  </span>
                </div>
              </div>

              <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Ver Todos los Equipos
              </button>
            </div>
          </div>
        );

      case 'Notificaciones':
        return (
          <div className="glass-panel p-8 rounded-2xl border border-slate-300 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-300 dark:border-white/5 pb-4">
              <Bell className="text-violet-400" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notificaciones</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-white/5 rounded-xl">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-medium text-sm">Notificaciones por Email</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Recibe notificaciones importantes por correo electrónico</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-white/5 rounded-xl">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-medium text-sm">Notificaciones Push</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Recibe notificaciones en tiempo real en tu dispositivo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-white/5 rounded-xl">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-medium text-sm">Notificaciones de Proyectos</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Actualizaciones sobre proyectos en los que participas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Header Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-16 border border-slate-300 dark:border-white/5">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-violet-900/80 to-blue-900/80"
          style={{
            ...(coverPreview ? { 
              backgroundImage: `url(${coverPreview})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            } : {})
          }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute bottom-4 right-4">
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={handleCoverClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-xs text-white border border-white/10 transition-colors"
          >
                <Camera size={14} /> Cambiar Portada
            </button>
        </div>
      </div>

      {/* Profile Header Info */}
      <div className="relative px-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex items-end gap-6 -mt-20">
            <div className="relative group">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <img 
              src={avatarPreview || user.avatar} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-2xl border-4 border-[#05050a] shadow-xl object-cover bg-[#0f172a]"
                />
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 p-2 bg-violet-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-violet-700"
            >
                    <Camera size={16} />
                </button>
            </div>
            <div className="mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{formData.name}</h1>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mt-1">
                    <Briefcase size={14} />
              <span>{formData.role}</span>
                    <span className="mx-1">•</span>
                    <MapPin size={14} />
                    <span>{formData.location}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-3 mb-2">
             <button 
                onClick={(e) => handleSave(e)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
             >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar Cambios
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
            <div className="glass-panel p-2 rounded-xl">
            {[
              { id: 'General', icon: User },
              { id: 'Seguridad', icon: Lock },
              { id: 'Equipos', icon: UsersIcon },
              { id: 'Notificaciones', icon: Bell }
            ].map(({ id, icon: Icon }) => (
                    <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                  activeTab === id 
                    ? 'bg-violet-600 dark:bg-white/10 text-white' 
                    : 'text-black dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {id}
                    </button>
                ))}
            </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-300 dark:border-white/5">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 text-sm">Finalización del Perfil</h3>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <span>85% Completado</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                    <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                </div>
                <button className="text-xs text-violet-400 hover:text-violet-300">
                    Completa tu perfil →
                </button>
            </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {renderTabContent()}

          {activeTab === 'General' && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-300 dark:border-white/5 border-l-4 border-l-red-500/50">
              <h3 className="text-slate-900 dark:text-white font-bold mb-2">Zona de Peligro</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.</p>
                 <button className="text-red-400 hover:text-red-300 text-sm font-medium border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    Eliminar Cuenta
                 </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">¡Perfil actualizado!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tus cambios se han guardado correctamente</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
