import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../lib/auth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error: loginError } = await auth.login(email, password);

      if (loginError) {
        setError(loginError);
        return;
      }

      if (user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
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
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 Nexus AI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

