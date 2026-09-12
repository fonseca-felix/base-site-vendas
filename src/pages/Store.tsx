import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckoutModal from '../components/CheckoutModal';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

export default function Store() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          axios.get(`${API_URL}/products/categories`),
          axios.get(`${API_URL}/products/`)
        ]);
        console.log('Categorias da API:', catsRes.data);
        console.log('Produtos da API:', prodsRes.data);
        setCategories(catsRes.data);
        setProducts(prodsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-4">Carregando...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Nossos Produtos</h2>
      
      {categories.length === 0 && <p style={{ color: 'red' }}>Nenhuma categoria encontrada na API.</p>}
      {products.length === 0 && <p style={{ color: 'red' }}>Nenhum produto encontrado na API.</p>}

      {categories.map((category: any) => {
        const categoryProducts = products.filter((p: any) => p.category_id === category.id);
        
        if (categoryProducts.length === 0) return null;
        
        return (
          <div key={category.id} className="category-section">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', color: 'var(--text-secondary)' }}>
              {category.name}
            </h3>
            
            <div className="products-grid">
              {categoryProducts.map((product: any) => (
                <div key={product.id} className="glass-panel product-card">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.title} className="product-image" />
                  )}
                  <h4 className="product-title">{product.title}</h4>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">R$ {product.price.toFixed(2)}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (!user) {
                          console.error('Por favor, faça login ou cadastre-se para comprar.');
                          navigate('/login');
                        } else {
                          setSelectedProduct(product);
                        }
                      }}
                    >
                      <ShoppingCart size={16} /> Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Renderização para produtos que não estão em uma categoria registrada */}
      {(() => {
        const knownCategoryIds = new Set(categories.map((c: any) => c.id));
        const uncategorizedProducts = products.filter((p: any) => !knownCategoryIds.has(p.category_id));
        
        if (uncategorizedProducts.length === 0) return null;
        
        const grouped = uncategorizedProducts.reduce((acc: any, p: any) => {
          const cat = p.category_id || 'Outros';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(p);
          return acc;
        }, {});

        return Object.entries(grouped).map(([catId, prods]: [string, any]) => (
          <div key={catId} className="category-section">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {catId}
            </h3>
            
            <div className="products-grid">
              {prods.map((product: any) => (
                <div key={product.id} className="glass-panel product-card">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.title} className="product-image" />
                  )}
                  <h4 className="product-title">{product.title}</h4>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">R$ {product.price.toFixed(2)}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (!user) {
                          console.error('Por favor, faça login ou cadastre-se para comprar.');
                          navigate('/login');
                        } else {
                          setSelectedProduct(product);
                        }
                      }}
                    >
                      <ShoppingCart size={16} /> Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ));
      })()}

      {selectedProduct && (
        <CheckoutModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
