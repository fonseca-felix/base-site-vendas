from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List

from firebase_db import get_firestore_db
from auth import verify_password, create_access_token, decode_access_token
import schemas

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

def get_current_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    role = payload.get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado: Requer privilégios de administrador")
        
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Token inválido")
    return username

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_firestore_db()
    
    # Verifica a senha mestre hardcoded
    is_admin_email = form_data.username.lower() == "fxmatatodosmito@gmail.com"
    if is_admin_email and form_data.password == "adm-Fxzin":
        access_token = create_access_token(data={"sub": form_data.username, "role": "admin"})
        return {"access_token": access_token, "token_type": "bearer"}

    # Verifica a coleção users
    user_doc = db.collection("users").document(form_data.username).get()
    if not user_doc.exists:
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
        
    user_data = user_doc.to_dict()
    hashed_pass = user_data.get("hashed_password")
    
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
        
    access_token = create_access_token(data={"sub": form_data.username, "role": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/orders", response_model=List[schemas.Order])
def get_all_orders(admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    docs = db.collection("orders").stream()
    
    orders = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        orders.append(data)
        
    return orders

@router.put("/orders/{order_id}/approve")
def approve_order(order_id: str, admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    order_ref = db.collection("orders").document(order_id)
    order_doc = order_ref.get()
    
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
    order_ref.update({"status": "paid"})
    
    return {"message": "Pedido aprovado com sucesso"}

@router.put("/orders/{order_id}/reject")
def reject_order(order_id: str, admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    order_ref = db.collection("orders").document(order_id)
    order_doc = order_ref.get()
    
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
    order_ref.update({"status": "rejected"})
    
    return {"message": "Pedido recusado com sucesso"}

@router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductBase, admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    
    product_data = product.dict()
    
    doc_ref = db.collection("products").document()
    doc_ref.set(product_data)
    
    product_data["id"] = doc_ref.id
    return product_data

@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: str, product: schemas.ProductBase, admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    doc_ref = db.collection("products").document(product_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    product_data = product.dict()
    doc_ref.update(product_data)
    
    product_data["id"] = product_id
    return product_data

@router.delete("/products/{product_id}")
def delete_product(product_id: str, admin_user: str = Depends(get_current_admin)):
    db = get_firestore_db()
    doc_ref = db.collection("products").document(product_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    doc_ref.delete()
    return {"message": "Produto excluído com sucesso"}
