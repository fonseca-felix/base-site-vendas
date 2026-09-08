import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/loja');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      login(res.data.user, res.data.access_token);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/loja');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div className="text-center" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>Entrar</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Acesse sua conta para comprar</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail ou Usuário</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
              required 
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Senha</label>
              <Link to="/esqueci-senha" style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Esqueceu?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <span><LogIn size={20} /> Entrar</span>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
          Ainda não tem uma conta? <Link to="/cadastro" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Cadastre-se</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: 'none', color: '#ff3b30', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Entrar como Admin
          </button>
        </p>
      </div>
    </div>
  );
}
