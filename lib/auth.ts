// Custom Authentication System (sin Supabase Auth)
import { supabase } from './supabase';
import { User } from '../types';

export interface AuthSession {
  user: User;
  expiresAt: number;
}

// Store session in localStorage
const SESSION_KEY = 'nexus_auth_session';

export const auth = {
  // Login with email and password
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Call the verify_password function
      const { data, error } = await supabase.rpc('verify_password', {
        user_email: email,
        password_plain: password
      });

      if (error) {
        return { user: null, error: error.message || 'Error al verificar credenciales' };
      }

      if (!data || data.length === 0) {
        return { user: null, error: 'Email o contraseña incorrectos' };
      }

      const userData = data[0];
      const user: User = {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar || `https://picsum.photos/seed/${userData.id}/200`,
        role: userData.role
      };

      // Create session
      const session: AuthSession = {
        user,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Error al iniciar sesión' };
    }
  },

  // Get current session
  getSession(): AuthSession | null {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session: AuthSession = JSON.parse(sessionStr);

      // Check if session expired
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
};

