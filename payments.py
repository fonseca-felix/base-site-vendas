from fastapi import APIRouter, HTTPException, Request
from firebase_db import get_firestore_db
import schemas
from pix_generator import generate_static_pix

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Chave Pix do Administrador (fornecida pelo usuário)
ADMIN_PIX_KEY = "15998173650"

@router.post("/create_pix", response_model=schemas.PixPaymentResponse)
def create_pix_payment(order_req: schemas.OrderCreate):
    db = get_firestore_db()
    
    # 1. Verify Product
    product_ref = db.collection("products").document(order_req.product_id)
    product_doc = product_ref.get()
    
    if not product_doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_data = product_doc.to_dict()
    price = float(product_data.get("price", 0))

    # 2. Create Order in DB (Created)
    order_data = {
        "product_id": order_req.product_id,
        "user_email": order_req.user_email or "guest@store.com",
        "user_name": order_req.user_name or "Visitante",
        "status": "created",
        "payment_id": "manual_pix"
    }
    
    _, order_ref = db.collection("orders").add(order_data)
    order_id = order_ref.id

    # 3. Generate Static Pix
    try:
        pix_data = generate_static_pix(
            pix_key=ADMIN_PIX_KEY,
            amount=price,
            merchant_name="ECommerce Premium",
            merchant_city="Sao Paulo"
        )
        
        return schemas.PixPaymentResponse(
            order_id=order_id,
            qr_code=pix_data["payload"],
            qr_code_base64=pix_data["qr_code_base64"],
            payment_id="manual_pix"
        )
    except Exception as e:
        order_ref.delete()
        raise HTTPException(status_code=500, detail=f"Error generating Pix: {str(e)}")

@router.get("/status/{order_id}")
def check_payment_status(order_id: str):
    db = get_firestore_db()
    order_ref = db.collection("orders").document(order_id)
    order_doc = order_ref.get()
    
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order_data = order_doc.to_dict()
    
    # Neste modo, o status é alterado manualmente pelo administrador no Firebase.
    return {"status": order_data.get("status")}

from fastapi import APIRouter, HTTPException, Request, UploadFile, File
import os
import shutil

# ... (inside the file)

@router.put("/{order_id}/notify")
def notify_payment(order_id: str, file: UploadFile = File(...)):
    db = get_firestore_db()
    order_ref = db.collection("orders").document(order_id)
    order_doc = order_ref.get()
    
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order_data = order_doc.to_dict()
    
    if order_data.get("status") == "created":
        try:
            # Upload to Firebase Storage
            from firebase_admin import storage
            import uuid
            
            bucket = storage.bucket()
            file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            filename = f"receipts/{order_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
            
            blob = bucket.blob(filename)
            blob.upload_from_file(file.file, content_type=file.content_type)
            blob.make_public()
            
            receipt_url = blob.public_url
            
            order_ref.update({
                "status": "pending",
                "receipt_url": receipt_url
            })
        except Exception as e:
            print("Error uploading to Firebase Storage:", e)
            raise HTTPException(status_code=500, detail="Failed to upload receipt")
            
    return {"message": "Admin notificado e comprovante salvo", "receipt_url": receipt_url if 'receipt_url' in locals() else None}

# O webhook do MercadoPago foi removido pois estamos usando Pix Estático.
