from pydantic import BaseModel
from typing import List, Optional

class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    image_url: str
    category_id: str
    download_url: Optional[str] = None

class Product(ProductBase):
    id: str

class CategoryBase(BaseModel):
    name: str
    slug: str

class Category(CategoryBase):
    id: str

class OrderCreate(BaseModel):
    product_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None

class Order(BaseModel):
    id: str
    product_id: str
    user_email: Optional[str]
    user_name: Optional[str] = None
    status: str
    payment_id: Optional[str]
    receipt_url: Optional[str] = None

class PixPaymentResponse(BaseModel):
    order_id: str
    qr_code: str
    qr_code_base64: str
    payment_id: str

class CustomerRegister(BaseModel):
    name: str
    email: str
    password: str

class CustomerLogin(BaseModel):
    email: str
    password: str

class CustomerResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = "customer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: CustomerResponse

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str
