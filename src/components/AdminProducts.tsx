import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Edit2, Trash2, Plus, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  download_url?: string;
}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    category_id: 'software', // default
    download_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products/`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category_id: product.category_id,
        download_url: product.download_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        image_url: '',
        category_id: 'software',
        download_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/admin/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/admin/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0 }}>Catálogo de Produtos</h3>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ background: 'var(--accent-color)' }}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="grid">
        {products.map(product => (
          <div key={product.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <ImageIcon size={24} style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h4>
                <p style={{ margin: 0, color: 'var(--accent-color)', fontWeight: 'bold' }}>
                  R$ {product.price.toFixed(2)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <LinkIcon size={12} />
                  {product.download_url ? 'Link Configurado' : 'Sem Link'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                onClick={() => openModal(product)} 
                className="btn" 
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(product.id)} 
                className="btn" 
                style={{ background: 'rgba(255,59,48,0.2)', color: '#ff3b30' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && !loading && (
          <div className="glass-panel text-center" style={{ padding: '48px', gridColumn: '1 / -1' }}>
            <Package size={48} style={{ opacity: 0.5, margin: '0 auto 16px auto' }} />
            <h3>Nenhum produto cadastrado</h3>
            <p>Clique em "Novo Produto" para adicionar itens à sua loja.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome do Produto</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Preço (R$)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Categoria (Ex: software)</label>
                  <input type="text" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>URL da Imagem de Capa</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>

              <div style={{ padding: '16px', background: 'rgba(110, 86, 207, 0.1)', borderRadius: '8px', border: '1px solid rgba(110, 86, 207, 0.3)' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-color)', fontWeight: 'bold' }}>🔗 Link de Download (O que o cliente recebe)</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Cole aqui o link do Google Drive, Mediafire ou Mega com o arquivo que o cliente vai baixar após a aprovação.</p>
                <input type="url" value={formData.download_url} onChange={e => setFormData({...formData, download_url: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(110, 86, 207, 0.5)', background: 'rgba(0,0,0,0.2)', color: 'white' }} placeholder="https://drive.google.com/..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', background: 'var(--accent-color)' }}>
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
