import { useState, useEffect } from 'react';
import { X, CheckCircle, Copy, Loader2 } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

export default function CheckoutModal({ product, onClose }: { product: any, onClose: any }) {
  const [step, setStep] = useState(1); // 1: confirm, 2: paying, 3: success
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [notifiedAdmin, setNotifiedAdmin] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { user } = useAuth();
  
  // Create Pix
  const handleGeneratePix = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/payments/create_pix`, {
        product_id: product.id,
        user_email: user?.email || 'cliente_desconhecido@teste.com',
        user_name: user?.name || 'Visitante'
      });
      setPixData(res.data);
      setStep(2);
    } catch (err) {
      alert("Erro ao gerar Pix.");
    } finally {
      setLoading(false);
    }
  };

  // Polling for payment status
  useEffect(() => {
    let interval: any;
    if (step === 2 && pixData) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/payments/status/${pixData.order_id}`);
          if (res.data.status === 'paid') {
            setStep(3);
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [step, pixData]);

  const copyToClipboard = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      alert("Pix Copia e Cola copiado!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Confirmar Compra</h2>
            <p>Você está adquirindo: <strong>{product.title}</strong></p>
            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ margin: 0 }}>Valor Total:</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0 }}>R$ {product.price.toFixed(2)}</h3>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px' }}
              onClick={handleGeneratePix}
              disabled={loading}
            >
              {loading ? "Gerando..." : "Pagar via Pix"}
            </button>
          </div>
        )}

        {step === 2 && pixData && (
          <div className="text-center">
            <h2 style={{ marginBottom: '8px' }}>Pague com Pix</h2>
            <p style={{ marginBottom: '24px' }}>Escaneie o QR Code abaixo ou use o código Copia e Cola.</p>
            
            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', marginBottom: '24px' }}>
              <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" style={{ width: '200px', height: '200px' }} />
            </div>
            
            <button className="btn" onClick={copyToClipboard} style={{ width: '100%', marginBottom: '24px', background: 'rgba(255,255,255,0.1)' }}>
              <Copy size={18} /> Pix Copia e Cola
            </button>

            {!notifiedAdmin ? (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Após realizar o pagamento no seu banco, anexe o comprovante abaixo para avisar o administrador.</p>
                
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                  style={{ marginBottom: '16px', width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
                />

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', background: receiptFile ? 'var(--success-color)' : 'rgba(255,255,255,0.1)', cursor: receiptFile ? 'pointer' : 'not-allowed' }}
                  disabled={!receiptFile}
                  onClick={async () => {
                    if (!receiptFile) return;
                    try {
                      const formData = new FormData();
                      formData.append('file', receiptFile);
                      
                      await axios.put(`${API_URL}/payments/${pixData.order_id}/notify`, formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data'
                        }
                      });
                      setNotifiedAdmin(true);
                    } catch (e) {
                      console.error(e);
                      alert("Erro ao enviar o comprovante.");
                    }
                  }}
                >
                  <CheckCircle size={18} /> Já paguei (Enviar Comprovante)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 className="animate-spin" size={20} /> 
                  <strong>Aguardando liberação do Administrador...</strong>
                </div>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  Aviso enviado! Assim que o administrador confirmar o recebimento, sua tela atualizará automaticamente.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center" style={{ padding: '32px 0' }}>
            <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ color: 'var(--success-color)' }}>Pagamento Confirmado!</h2>
            <p>Sua compra foi aprovada com sucesso.</p>
            <div style={{ background: 'rgba(52, 199, 89, 0.1)', padding: '24px', borderRadius: '8px', marginTop: '24px' }}>
              <h3>Acesse seu produto:</h3>
              <a href="#" className="btn btn-primary mt-4">Download / Acessar</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
