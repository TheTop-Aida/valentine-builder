import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { useAuth } from './contexts/AuthContext.jsx'

function Root() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

function AppGate() {
  const { loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#1a0a2e,#2c1040)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#ff9a9e', fontFamily: 'Mitr,sans-serif', fontSize: '1rem',
    }}>
      ⏳ กำลังโหลด...
    </div>
  );
  // ทุกคนเข้าใช้ได้เลย ไม่ต้อง login ก่อน
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
