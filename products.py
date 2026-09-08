from fastapi import APIRouter, HTTPException
from typing import List

import schemas
from firebase_db import get_firestore_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/categories", response_model=List[schemas.Category])
def get_categories():
    db = get_firestore_db()
    docs = db.collection("categories").stream()
    categories = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        categories.append(data)
    return categories

@router.get("/", response_model=List[schemas.Product])
def get_products(category_id: str = None):
    db = get_firestore_db()
    
    collection_ref = db.collection("products")
    if category_id:
        docs = collection_ref.where("category_id", "==", category_id).stream()
    else:
        docs = collection_ref.stream()
        
    products = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        products.append(data)
        
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: str):
    db = get_firestore_db()
    doc = db.collection("products").document(product_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
        
    data = doc.to_dict()
    data["id"] = doc.id
    return data
