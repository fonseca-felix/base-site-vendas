import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Store from './pages/Store';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <h1>Premium Store</h1>
      <nav className="nav-links" style={{ alignItems: 'center' }}>
        <Link to="/">Início</Link>
        
        {(user?.role === 'admin' || user?.email === 'fxmatatodosmito@gmail.com') ? (
          <Link to="/admin" className="btn btn-primary" style={{ color: 'white', marginRight: '16px', background: 'var(--accent-color)' }}>
            <ShoppingBag size={18} />
            Gerenciar Compras
          </Link>
        ) : (
          <Link to="/loja" className="btn btn-primary" style={{ color: 'white', marginRight: '16px' }}>
            <ShoppingBag size={18} />
            Ver Produtos
          </Link>
        )}
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <User size={18} /> Olá, {user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="btn" style={{ padding: '8px 16px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Entrar</Link>
            <Link to="/cadastro" className="btn" style={{ background: 'var(--surface-color)', color: 'white' }}>Cadastrar</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/loja" element={<Store />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
