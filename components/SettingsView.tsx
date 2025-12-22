import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bell, Lock, Globe, Moon, Shield, Eye, Smartphone, Mail, Sun, Monitor, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { UserManagement } from './Settings/UserManagement';

// Helper para guardar en localStorage
const savePreference = (key: string, value: boolean) => {
    localStorage.setItem(`pref_${key}`, JSON.stringify(value));
};

const loadPreference = (key: string, defaultValue: boolean): boolean => {
    const saved = localStorage.getItem(`pref_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
};

// Helper para solicitar permiso de notificaciones
const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        alert('Tu navegador no soporta notificaciones del sistema');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

// Función para mostrar notificación de prueba
const showTestNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
        });
    }
};

export const SettingsView: React.FC = () => {
    const { theme, setTheme, user, changePassword } = useStore();
    
    // Check if user can manage users (only Founder, CTO, and CFO)
    const canManageUsers = user?.role === 'Founder' || user?.role === 'CTO' || user?.role === 'CFO';
    
    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    
    // Cargar preferencias guardadas
    const [emailNotifs, setEmailNotifs] = useState(() => loadPreference('emailNotifs', true));
    const [desktopNotifs, setDesktopNotifs] = useState(() => loadPreference('desktopNotifs', false));
    const [marketingEmails, setMarketingEmails] = useState(() => loadPreference('marketingEmails', false));
    const [twoFactor, setTwoFactor] = useState(() => loadPreference('twoFactor', true));

    // Guardar preferencias cuando cambien
    useEffect(() => {
        savePreference('emailNotifs', emailNotifs);
    }, [emailNotifs]);

    useEffect(() => {
        savePreference('desktopNotifs', desktopNotifs);
        
        // Si se activa, solicitar permiso
        if (desktopNotifs) {
            requestNotificationPermission().then(hasPermission => {
                if (hasPermission) {
                    // Mostrar notificación de prueba
                    setTimeout(() => {
                        showTestNotification(
                            'Notificaciones Activadas',
                            'Ahora recibirás alertas en tiempo real sobre tus proyectos y tareas.'
                        );
                    }, 500);
                } else {
                    // Si se niega el permiso, desactivar el toggle
                    setDesktopNotifs(false);
                    alert('Se requieren permisos para mostrar notificaciones. Por favor, habilítalos en la configuración de tu navegador.');
                }
            });
        }
    }, [desktopNotifs]);

    useEffect(() => {
        savePreference('marketingEmails', marketingEmails);
    }, [marketingEmails]);

    useEffect(() => {
        savePreference('twoFactor', twoFactor);
    }, [twoFactor]);

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configuración</h1>
                <p className="text-slate-500 dark:text-slate-400">Administra las preferencias de tu espacio de trabajo y la configuración de seguridad.</p>
            </div>

            <div className="space-y-6">
                {/* Appearance */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm transition-colors duration-200">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg text-violet-600 dark:text-violet-400">
                                <Moon size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Apariencia</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">Preferencia de Tema</p>
                                <p className="text-slate-500 text-sm">Personaliza cómo se ve Nexus en tu dispositivo.</p>
                            </div>
                            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${
                                        theme === 'dark' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Moon size={12} /> Oscuro
                                </button>
                                <button 
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${
                                        theme === 'light' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Sun size={12} /> Claro
                                </button>
                                <button 
                                    onClick={() => setTheme('system')}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${
                                        theme === 'system' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Monitor size={12} /> Sistema
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm transition-colors duration-200">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                <Bell size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notificaciones</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <ToggleRow 
                            icon={Mail}
                            title="Notificaciones por Correo" 
                            desc="Recibe actualizaciones sobre tus proyectos y tareas por correo."
                            checked={emailNotifs}
                            onChange={(value: boolean) => {
                                setEmailNotifs(value);
                                if (value && user) {
                                    // Simulación: aquí se enviaría una solicitud al backend
                                    console.log('Email notifications enabled for', user.name);
                                }
                            }}
                        />
                        <ToggleRow 
                            icon={Smartphone}
                            title="Notificaciones de Escritorio" 
                            desc="Recibe alertas en tiempo real en tu escritorio cuando la app esté abierta."
                            checked={desktopNotifs}
                            onChange={setDesktopNotifs}
                        />
                        <ToggleRow 
                            icon={Globe}
                            title="Marketing y Noticias" 
                            desc="Recibe el boletín semanal y actualizaciones de funciones."
                            checked={marketingEmails}
                            onChange={(value: boolean) => {
                                setMarketingEmails(value);
                                if (value && user) {
                                    console.log('Marketing emails enabled for', user.name);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm transition-colors duration-200">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Seguridad</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="mt-1 text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">Contraseña</p>
                                    <p className="text-slate-500 text-sm">Última modificación hace 3 meses.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(true);
                                    setPasswordError(null);
                                    setPasswordSuccess(false);
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Cambiar
                            </button>
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="mt-1 text-slate-500">
                                    <Eye size={18} />
                                </div>
                                <div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">Autenticación de Dos Factores</p>
                                    <p className="text-slate-500 text-sm">Añade una capa extra de seguridad a tu cuenta.</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => setTwoFactor(!twoFactor)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${
                                    twoFactor ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                                    twoFactor ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Management - Only for Founder, CTO, and CFO */}
                {canManageUsers && <UserManagement />}
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cambiar Contraseña</h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError(null);
                                    setPasswordSuccess(false);
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                <span>{passwordError}</span>
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                                <CheckCircle size={16} />
                                <span>Contraseña actualizada exitosamente</span>
                            </div>
                        )}

                        <form 
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setPasswordError(null);
                                setPasswordSuccess(false);

                                // Validations
                                if (passwordForm.newPassword.length < 6) {
                                    setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
                                    return;
                                }

                                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                    setPasswordError('Las contraseñas no coinciden');
                                    return;
                                }

                                if (passwordForm.currentPassword === passwordForm.newPassword) {
                                    setPasswordError('La nueva contraseña debe ser diferente a la actual');
                                    return;
                                }

                                setPasswordLoading(true);
                                try {
                                    await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                                    setPasswordSuccess(true);
                                    setTimeout(() => {
                                        setShowPasswordModal(false);
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordSuccess(false);
                                    }, 2000);
                                } catch (error: any) {
                                    setPasswordError(error.message || 'Error al cambiar la contraseña');
                                } finally {
                                    setPasswordLoading(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="Ingresa tu contraseña actual"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        minLength={6}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="Repite la nueva contraseña"
                                        required
                                        minLength={6}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError(null);
                                        setPasswordSuccess(false);
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Cambiando...
                                        </>
                                    ) : (
                                        'Cambiar Contraseña'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between">
        <div className="flex gap-4">
            <div className="mt-1 text-slate-500">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">{title}</p>
                <p className="text-slate-500 text-sm">{desc}</p>
            </div>
        </div>
        <div 
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${
                checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`} />
        </div>
    </div>
);
