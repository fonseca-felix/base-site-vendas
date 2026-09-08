from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize Firebase before anything else
import firebase_db

from routes import products, payments, admin, auth_users

app = FastAPI(
    title="Premium E-Commerce API (Firebase Edition)",
    description="API for the premium e-commerce platform com Pix estático",
    version="1.0.0"
)

# Secure CORS config: allow all for dev
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
# We are now using Firebase Storage, no local uploads directory needed.

# Vercel serverless routing fix
app.include_router(products.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(auth_users.router, prefix="/api")

@app.get("/api/ping")
def ping():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Premium E-Commerce API (Firestore) is running"}
