import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Role } from '../../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('Developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // Registration is disabled - only Founder, CTO, and CFO can create users
      setError('El registro está deshabilitado. Solo los administradores (Founder, CTO, CFO) pueden crear cuentas desde el panel de configuración.');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#05050a] via-[#0a0a15] to-[#05050a]">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-emerald-400 w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
            <p className="text-slate-400 text-sm mb-4">
              Tu cuenta ha sido creada. Revisa tu email para confirmar tu cuenta.
            </p>
            <p className="text-slate-500 text-xs">
              Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#05050a] via-[#0a0a15] to-[#05050a]">
      {/* Background decorative elements */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Nexus AI
          </h1>
          <p className="text-slate-400 text-sm">Agency Operating System</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
            <p className="text-slate-400 text-sm">Completa el formulario para registrarte</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                Rol
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-all appearance-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Sales">Sales</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="Founder">Founder</option>
                  <option value="Client">Client</option>
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          {/* Info message */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-xs text-center">
                ℹ️ El registro está deshabilitado. Solo Founders, CTOs y CFOs pueden crear cuentas desde el panel de configuración.
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 Nexus AI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

