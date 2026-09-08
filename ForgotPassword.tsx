import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Send, RefreshCw } from 'lucide-react';

const API_URL = '/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/users/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao solicitar reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div className="text-center" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>Recuperar Senha</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enviaremos um link para o seu e-mail</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ padding: '12px', background: 'rgba(52,199,89,0.1)', color: '#34c759', borderRadius: '8px', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <span><Send size={20} /> Enviar Link</span>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
          Lembrou a senha? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Voltar ao Login</Link>
        </p>
      </div>
    </div>
  );
}
