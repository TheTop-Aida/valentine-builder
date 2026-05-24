import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 ชั่วโมง
const SESSION_KEY = 'vb_session_start';

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    supabase.auth.signOut();
  }, []);

  // ตรวจ session timeout
  useEffect(() => {
    const start = localStorage.getItem(SESSION_KEY);
    if (start && Date.now() - Number(start) > SESSION_TIMEOUT_MS) {
      logout();
      return;
    }
    const iv = setInterval(() => {
      const s = localStorage.getItem(SESSION_KEY);
      if (s && Date.now() - Number(s) > SESSION_TIMEOUT_MS) logout();
    }, 60 * 1000); // เช็คทุก 1 นาที
    return () => clearInterval(iv);
  }, [logout]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, Date.now());
        loadProfile(session.user.id);
      } else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        if (!localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, Date.now());
        loadProfile(session.user.id);
      } else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      setProfile(data);
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }

  const user    = session?.user ?? null;
  // ✅ อ่านจาก database แทน email เพื่อป้องกัน client-side bypass
  const isAdmin = profile?.is_admin === true;

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
