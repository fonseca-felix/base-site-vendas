import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, RefreshCw, CheckCircle, XCircle, Check, Eye, EyeOff } from 'lucide-react';

const API_URL = '/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation states
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasSpecialChar;

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação inválido ou ausente.');
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos de segurança.');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/users/reset-password`, {
        token,
        new_password: password
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao redefinir a senha. O token pode estar expirado.');
    } finally {
      setLoading(false);
    }
  };

  const RuleIndicator = ({ met, text }: { met: boolean, text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: met ? 'var(--success-color)' : 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
      {met ? <CheckCircle size={14} /> : <XCircle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div className="text-center" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>Criar Nova Senha</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Digite sua nova senha abaixo</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        {success ? (
          <div className="text-center" style={{ padding: '24px 0' }}>
            <CheckCircle size={48} color="var(--success-color)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ color: 'var(--success-color)', marginBottom: '16px' }}>Senha Alterada!</h3>
            <p style={{ marginBottom: '24px' }}>Sua senha foi redefinida com sucesso.</p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px', paddingRight: '70px', borderRadius: '8px', border: `1px solid ${isPasswordValid ? 'var(--success-color)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', transition: 'border-color 0.3s' }} 
                  required 
                  disabled={!token || loading}
                />
                
                <div style={{ position: 'absolute', right: '12px', top: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isPasswordValid && password.length > 0 && (
                    <Check style={{ color: 'var(--success-color)' }} size={20} />
                  )}
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <RuleIndicator met={hasMinLength} text="Mínimo 8 caracteres" />
                <RuleIndicator met={hasUpperCase} text="1 letra maiúscula" />
                <RuleIndicator met={hasSpecialChar} text="1 caractere especial (!@#$)" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirmar Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: `1px solid ${confirmPassword.length > 0 && confirmPassword !== password ? '#ff3b30' : (confirmPassword.length > 0 && confirmPassword === password ? 'var(--success-color)' : 'rgba(255,255,255,0.1)')}`, background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                  required 
                  disabled={!token || loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading || !token || !isPasswordValid || password !== confirmPassword}>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <span><Lock size={20} /> Redefinir Senha</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
