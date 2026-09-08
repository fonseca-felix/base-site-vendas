from fastapi import APIRouter, HTTPException, Depends
from typing import Any
import schemas
from firebase_db import get_firestore_db
from auth import get_password_hash, verify_password, create_access_token, decode_access_token
from email_service import send_welcome_email, send_password_reset_email
import uuid

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/register", response_model=schemas.TokenResponse)
def register(user: schemas.CustomerRegister):
    db = get_firestore_db()
    
    # Check if user already exists
    docs = db.collection("customers").where("email", "==", user.email.lower()).stream()
    if list(docs):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email.lower(),
        "hashed_password": hashed_password
    }
    
    doc_ref = db.collection("customers").document()
    doc_ref.set(new_user)
    
    user_id = doc_ref.id
    
    # Enviar email de boas-vindas
    send_welcome_email(user.email, user.name)
    
    # Gerar token
    access_token = create_access_token(data={"sub": user_id, "role": "customer"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user.name,
            "email": user.email.lower()
        }
    }

@router.post("/login", response_model=schemas.TokenResponse)
def login(user: schemas.CustomerLogin):
    print(f"=== LOGIN ATTEMPT ===")
    print(f"Email recebido: '{user.email}'")
    print(f"Senha recebida: '{user.password}'")
    db = get_firestore_db()
    
    # 1. Primeiro verifica se é um Admin (na coleção 'users') ou o email master
    admin_doc = db.collection("users").document(user.email.strip()).get()
    
    # Se o email for o oficial da loja ou se existir na coleção de admins
    # O login master estava fixo, mas agora a senha já foi gerada e está no banco de dados.
        
    if admin_doc.exists:
        admin_data = admin_doc.to_dict()
        hashed_pass = admin_data.get("hashed_password")
            
        if verify_password(user.password, hashed_pass):
            access_token = create_access_token(data={"sub": user.email, "role": "admin"})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.email,
                    "name": "Administrador",
                    "email": user.email,
                    "role": "admin"
                }
            }
            
    # 2. Se não for admin, verifica se é cliente
    docs = list(db.collection("customers").where("email", "==", user.email.lower().strip()).stream())
    if not docs:
        raise HTTPException(status_code=401, detail="Usuário, E-mail ou senha incorretos.")
        
    user_doc = docs[0]
    user_data = user_doc.to_dict()
    
    if not verify_password(user.password, user_data["hashed_password"]):
        raise HTTPException(status_code=401, detail="Usuário, E-mail ou senha incorretos.")
        
    user_id = user_doc.id
    
    # Se o cliente for o email oficial da loja, conceder privilégio de admin automaticamente
    role = "admin" if user.email.lower().strip() == "fxmatatodosmito@gmail.com" else "customer"
    
    access_token = create_access_token(data={"sub": user_id, "role": role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_data["name"] if role != "admin" else "Administrador",
            "email": user_data["email"],
            "role": role
        }
    }

@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPassword):
    db = get_firestore_db()
    
    docs = list(db.collection("customers").where("email", "==", req.email.lower()).stream())
    if not docs:
        # Por segurança, retornamos sucesso mesmo se o e-mail não existir
        return {"message": "Se o e-mail existir, você receberá um link de recuperação."}
        
    user_doc = docs[0]
    user_id = user_doc.id
    
    # Gerar um token JWT de reset
    reset_token = create_access_token(data={"sub": user_id, "action": "reset_password"})
    
    # Enviar e-mail
    send_password_reset_email(req.email.lower(), reset_token)
    
    return {"message": "Se o e-mail existir, você receberá um link de recuperação."}

@router.post("/reset-password")
def reset_password(req: schemas.ResetPassword):
    payload = decode_access_token(req.token)
    if not payload or payload.get("action") != "reset_password":
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")
        
    user_id = payload.get("sub")
    db = get_firestore_db()
    
    user_ref = db.collection("customers").document(user_id)
    if not user_ref.get().exists:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    new_hashed_password = get_password_hash(req.new_password)
    user_ref.update({"hashed_password": new_hashed_password})
    
    return {"message": "Senha atualizada com sucesso."}
