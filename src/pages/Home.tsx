import { MessageCircle, MessageSquare, Camera, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const whatsappNumber = "5515998173650";
  const whatsappMsg = encodeURIComponent("Olá! Vim pelo site e gostaria de tirar algumas dúvidas.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;
  
  const discordLink = "https://discord.gg/yourinvite"; // Example
  const instagramLink = "https://instagram.com/seuperfil"; // Example
  const tiktokLink = "https://tiktok.com/@seuperfil"; // Example

  return (
    <div className="glass-panel text-center" style={{ padding: '64px 24px', marginTop: '64px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Bem-vindo à Experiência Premium</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 48px auto' }}>
        Sua plataforma exclusiva para os melhores produtos digitais e físicos.
        Navegue com total segurança e aproveite a entrega instantânea via Pix.
      </p>
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/loja" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          Acessar Loja
        </Link>
        
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <MessageCircle size={20} />
          WhatsApp
        </a>
        
        <a href={discordLink} target="_blank" rel="noopener noreferrer" className="btn btn-discord">
          <MessageSquare size={20} />
          Discord
        </a>

        <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="btn btn-instagram">
          <Camera size={20} />
          Instagram
        </a>

        <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className="btn btn-tiktok">
          <Play size={20} />
          TikTok
        </a>
      </div>
    </div>
  );
};

export default Home;
