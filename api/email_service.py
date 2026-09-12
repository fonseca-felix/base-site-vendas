import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')

def _send_email(to_email: str, subject: str, html_body: str):
    if not SMTP_USER or not SMTP_PASS:
        logger.error("Credenciais de SMTP nao configuradas. Verifique o arquivo .env")
        # Fallback to simulation if credentials aren't set yet to avoid breaking the UI completely
        logger.info(f"[SIMULADO] Para: {to_email} | Assunto: {subject}\n{html_body}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Premium Store <{SMTP_USER}>"
    msg["To"] = to_email

    part = MIMEText(html_body, "html")
    msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to_email, msg.as_string())
        server.quit()
        logger.info(f"E-mail real enviado com sucesso para {to_email}!")
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail para {to_email}: {e}")

def send_welcome_email(to_email: str, name: str):
    subject = "Bem-vindo à Premium Store!"
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1; text-align: center;">Premium Store</h2>
            <p>Olá <strong>{name}</strong>,</p>
            <p>Sua conta foi criada com sucesso! Estamos muito felizes em ter você aqui.</p>
            <p>Aproveite nossos produtos exclusivos com pagamento instantâneo via Pix.</p>
            <br>
            <p style="text-align: center;">
                <a href="{FRONTEND_URL}/loja" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Ir para a Loja
                </a>
            </p>
            <br>
            <p style="font-size: 0.9em; color: #888;">
                Atenciosamente,<br>
                Equipe Premium Store
            </p>
        </div>
      </body>
    </html>
    """
    _send_email(to_email, subject, html_body)

def send_password_reset_email(to_email: str, token: str):
    subject = "Recuperação de Senha - Premium Store"
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1; text-align: center;">Premium Store</h2>
            <p>Você solicitou a recuperação da sua senha.</p>
            <p>Acesse o botão abaixo para criar uma nova senha:</p>
            <br>
            <p style="text-align: center;">
                <a href="{reset_link}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Redefinir Minha Senha
                </a>
            </p>
            <br>
            <p style="font-size: 0.9em; color: #888;">
                Se você não solicitou a alteração, ignore este e-mail. Sua senha permanecerá a mesma.
            </p>
        </div>
      </body>
    </html>
    """
    _send_email(to_email, subject, html_body)
