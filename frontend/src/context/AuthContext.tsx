import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  userToken: string | null;
  adminToken: string | null;
  setUserToken: (t: string | null) => void;
  setAdminToken: (t: string | null) => void;
  signOutUser: () => void;
  signOutAdmin: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem('userToken'));
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('adminToken'));

  useEffect(() => {
    if (userToken) localStorage.setItem('userToken', userToken);
    else localStorage.removeItem('userToken');
  }, [userToken]);

  useEffect(() => {
    if (adminToken) localStorage.setItem('adminToken', adminToken);
    else localStorage.removeItem('adminToken');
  }, [adminToken]);

  const signOutUser = () => setUserToken(null);
  const signOutAdmin = () => setAdminToken(null);

  return (
    <AuthContext.Provider value={{ userToken, adminToken, setUserToken, setAdminToken, signOutUser, signOutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
