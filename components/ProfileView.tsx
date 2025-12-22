import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Mail, Briefcase, MapPin, Camera, Save, Loader2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useStore();

  if (!user) return null;
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('General');

  // Mock state for form
  const [formData, setFormData] = useState({
    name: user.name,
    email: `${user.name.toLowerCase().replace(' ', '.')}@nexus.ai`,
    role: user.role,
    bio: 'Senior operative with a focus on high-stakes delivery and architectural excellence. Leading the charge in next-gen AI implementation.',
    location: 'San Francisco, CA',
    phone: '+1 (555) 012-3456'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Header Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-16 border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/80 to-blue-900/80"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute bottom-4 right-4">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-xs text-white border border-white/10 transition-colors">
                <Camera size={14} /> Cambiar Portada
            </button>
        </div>
      </div>

      {/* Profile Header Info */}
      <div className="relative px-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex items-end gap-6 -mt-20">
            <div className="relative group">
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-2xl border-4 border-[#05050a] shadow-xl object-cover bg-[#0f172a]"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-violet-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Camera size={16} />
                </button>
            </div>
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                    <Briefcase size={14} />
                    <span>{user.role}</span>
                    <span className="mx-1">•</span>
                    <MapPin size={14} />
                    <span>{formData.location}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-3 mb-2">
             <button 
                onClick={handleSave}
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
                {['General', 'Seguridad', 'Equipos', 'Notificaciones'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab 
                                ? 'bg-white/10 text-white' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5">
                <h3 className="text-white font-semibold mb-4 text-sm">Finalización del Perfil</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
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
            <div className="glass-panel p-8 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                    <User className="text-violet-400" size={20} />
                    <h2 className="text-lg font-bold text-white">Información Personal</h2>
                </div>
                
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Rol</label>
                            <input 
                                type="text" 
                                value={formData.role}
                                disabled
                                className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Dirección de Correo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-500" size={16} />
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Teléfono</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Biografía</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            rows={4}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                        />
                    </div>
                </form>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 border-l-4 border-l-red-500/50">
                 <h3 className="text-white font-bold mb-2">Zona de Peligro</h3>
                 <p className="text-slate-400 text-sm mb-4">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.</p>
                 <button className="text-red-400 hover:text-red-300 text-sm font-medium border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    Eliminar Cuenta
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};