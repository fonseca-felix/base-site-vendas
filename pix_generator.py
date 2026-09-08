import binascii
import qrcode
import base64
import io

def calculate_crc16(payload: str) -> str:
    """Calcula o CRC16 (CCITT-FALSE) do payload do Pix."""
    polynomial = 0x1021
    crc = 0xFFFF
    
    for byte in payload.encode('utf-8'):
        crc ^= (byte << 8)
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ polynomial
            else:
                crc <<= 1
            crc &= 0xFFFF
            
    return f"{crc:04X}"

def generate_static_pix(pix_key: str, amount: float, merchant_name: str, merchant_city: str) -> dict:
    """
    Gera o payload "Copia e Cola" e o QR Code em Base64 para um Pix Estático.
    """
    # Se a chave for telefone apenas com ddd, adicione +55
    if len(pix_key) == 11 and pix_key.isdigit():
        pix_key = f"+55{pix_key}"

    # Formatação de TLV (Tag-Length-Value)
    def tlv(tag: str, value: str) -> str:
        return f"{tag}{len(value):02d}{value}"
    
    # Payload do Pix
    payload = "000201" # Payload Format Indicator
    
    # Merchant Account Information
    gui = tlv("00", "br.gov.bcb.pix")
    key = tlv("01", pix_key)
    account_info = tlv("26", gui + key)
    payload += account_info
    
    payload += tlv("52", "0000") # Merchant Category Code
    payload += tlv("53", "986") # Transaction Currency (BRL)
    
    # Valor da transação
    amount_str = f"{amount:.2f}"
    payload += tlv("54", amount_str)
    
    payload += tlv("58", "BR") # Country Code
    
    # Nomes limitados a caracteres curtos
    merchant_name = merchant_name[:25].upper()
    merchant_city = merchant_city[:15].upper()
    
    payload += tlv("59", merchant_name) # Merchant Name
    payload += tlv("60", merchant_city) # Merchant City
    
    # Additional Data Field (TxId vazio com ***)
    txid = tlv("05", "***")
    payload += tlv("62", txid)
    
    # Preparando para o CRC16
    payload += "6304"
    crc = calculate_crc16(payload)
    payload_completo = payload + crc

    # Gerar QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(payload_completo)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "payload": payload_completo,
        "qr_code_base64": qr_base64
    }
