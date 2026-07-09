import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';
import { setAccessToken } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    authApi
      .refresh()
      .then((res) => {
        setAccessToken(res.accessToken);
        return authApi.me();
      })
      .then(({ user }) => setUserState(user))
      .catch(() => {
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, accessToken: token } = await authApi.login({ email, password });
    setAccessToken(token);
    setUserState(u);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: u, accessToken: token } = await authApi.register({
        name,
        email,
        password,
      });
      setAccessToken(token);
      setUserState(u);
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    setAccessToken(null);
    setUserState(null);
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
