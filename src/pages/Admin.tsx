import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Package, RefreshCw, ShieldAlert, ShoppingBag, Tags, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminProducts from '../components/AdminProducts';

const API_URL = '/api';

export default function Admin() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'products'>('orders');

  useEffect(() => {
    if (token && user?.role === 'admin' && activeMainTab === 'orders') {
      fetchOrders();
    }
  }, [token, user, activeMainTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        console.error("Erro ao buscar pedidos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (orderId: string) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Atualizar a lista local
      setOrders(orders.map(o => (o as any).id === orderId ? { ...o, status: 'paid' } : o));
    } catch (err) {
      console.error("Erro ao aprovar pedido.");
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/reject`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Atualizar a lista local
      setOrders(orders.map(o => (o as any).id === orderId ? { ...o, status: 'rejected' } : o));
    } catch (err) {
      console.error("Erro ao recusar pedido.");
    }
  };

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/users/login`, {
        email: adminUsername.trim(),
        password: adminPassword
      });
      
      // O endpoint /users/login já retorna o res.data.user com role="admin" se for a senha mestre
      if (res.data.user.role === 'admin') {
        login(res.data.user, res.data.access_token);
      } else {
        setLoginError('Esta conta não tem privilégios de Administrador.');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%' }}>
        <div className="glass-panel text-center" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <ShieldAlert size={48} color="#ffcc00" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Área Restrita</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Faça login com a conta de Administrador.</p>
          
          {loginError && (
            <div style={{ padding: '12px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>E-mail ou Usuário Admin</label>
              <input 
                type="text" 
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Senha</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoggingIn}>
              {isLoggingIn ? <RefreshCw className="animate-spin" size={20} /> : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [filter, setFilter] = useState<'pending' | 'paid'>('pending');

  return (
    <div>
      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveMainTab('orders')}
          className="btn"
          style={{ 
            background: activeMainTab === 'orders' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeMainTab === 'orders' ? 'white' : 'var(--text-secondary)'
          }}
        >
          <ShoppingBag size={18} /> Gerenciar Compras
        </button>
        <button 
          onClick={() => setActiveMainTab('products')}
          className="btn"
          style={{ 
            background: activeMainTab === 'products' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeMainTab === 'products' ? 'white' : 'var(--text-secondary)'
          }}
        >
          <Tags size={18} /> Gerenciar Produtos
        </button>
      </div>

      {activeMainTab === 'orders' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setFilter('pending')}
                  className="btn" 
                  style={{ 
                    background: filter === 'pending' ? 'var(--accent-color)' : 'transparent',
                    color: filter === 'pending' ? 'white' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    border: 'none',
                    boxShadow: 'none'
                  }}>
                  Pendentes
                </button>
                <button 
                  onClick={() => setFilter('paid')}
                  className="btn" 
                  style={{ 
                    background: filter === 'paid' ? 'var(--success-color)' : 'transparent',
                    color: filter === 'paid' ? 'white' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    border: 'none',
                    boxShadow: 'none'
                  }}>
                  Aprovados
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={fetchOrders} className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Atualizar
              </button>
            </div>
          </div>

          <div className="grid">
            {orders.filter((order: any) => order.status === filter).length === 0 && !loading && (
              <div className="glass-panel text-center" style={{ padding: '48px', gridColumn: '1 / -1' }}>
                <Package size={48} style={{ opacity: 0.5, margin: '0 auto 16px auto' }} />
                <h3>Nenhum pedido encontrado</h3>
                <p>Não há pedidos com este status no momento.</p>
              </div>
            )}

            {orders
              .filter((order: any) => order.status === filter)
              .map(order => (
              <div key={order.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {order.id.slice(0, 8)}...</span>
                  {order.status === 'paid' ? (
                    <span style={{ color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>PAGO</span>
                  ) : (
                    <span style={{ color: '#ffcc00', fontSize: '0.8rem', fontWeight: 'bold' }}>PENDENTE</span>
                  )}
                </div>
                
                <div>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Produto ID:</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{order.product_id}</p>
                </div>
                <div>
                  <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Informações de Pagamento
                    </h5>
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Método:</span> Pix (Verificação Manual)
                    </p>
                    {order.receipt_url && (
                      <button 
                        onClick={() => window.open(order.receipt_url.startsWith('http') ? order.receipt_url : `${API_URL}${order.receipt_url}`, '_blank')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '8px', fontSize: '0.9rem', background: '#007aff' }}
                      >
                        Ver Comprovante
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Cliente:</p>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{(order as any).user_name || 'Visitante'}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{(order as any).user_email}</p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  {order.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => approveOrder(order.id)}
                        className="btn"
                        style={{ flex: 1, background: 'var(--success-color)', color: 'white' }}
                      >
                        <CheckCircle size={18} /> Aprovar Pagamento
                      </button>
                      <button 
                        onClick={() => rejectOrder(order.id)}
                        className="btn"
                        style={{ background: 'rgba(255,59,48,0.2)', color: '#ff3b30' }}
                        title="Marcar como Não Pago e remover da lista"
                      >
                        <XCircle size={18} /> Não Pago
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                      disabled
                    >
                      Aprovado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <AdminProducts />
      )}
    </div>
  );
}
