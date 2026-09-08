from firebase_db import get_firestore_db
from auth import get_password_hash

def init_db():
    print("Inicializando Firestore...")
    db = get_firestore_db()
    
    # 1. Configurar Usuário Admin
    user_ref = db.collection("users").document("fx")
    if not user_ref.get().exists:
        print("Criando usuário admin 'fx'...")
        hashed_pw = get_password_hash("fxx")
        user_ref.set({
            "username": "fx",
            "hashed_password": hashed_pw
        })
        print("Usuário criado com sucesso.")
    else:
        print("Usuário 'fx' já existe.")

    # 2. Configurar Produtos (Se necessário)
    cats = list(db.collection("categories").limit(1).stream())
    
    # Para garantir o produto de 1 centavo, vamos criá-lo de qualquer forma
    print("Verificando categoria de testes...")
    test_cat_query = list(db.collection("categories").where("slug", "==", "testes").limit(1).stream())
    
    if not test_cat_query:
        cat_test_ref = db.collection("categories").document()
        cat_test_ref.set({"name": "Testes", "slug": "testes"})
        cat_id = cat_test_ref.id
    else:
        cat_id = test_cat_query[0].id

    # Checar se produto de 1 centavo existe
    prod_test_query = list(db.collection("products").where("title", "==", "Produto de Teste (Pix)").limit(1).stream())
    if not prod_test_query:
        print("Criando produto de 1 centavo...")
        db.collection("products").add({
            "title": "Produto de Teste (Pix)",
            "description": "Produto para testar fluxo de aprovação",
            "price": 0.01,
            "image_url": "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6",
            "category_id": cat_id
        })
        print("Produto de teste criado.")
    else:
        print("Produto de teste já existe.")

    print("Inicialização concluída!")

if __name__ == "__main__":
    init_db()
