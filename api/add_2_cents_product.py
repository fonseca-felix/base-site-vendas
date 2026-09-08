from firebase_db import get_firestore_db

def add_product():
    db = get_firestore_db()
    
    print("Verificando categoria de testes...")
    test_cat_query = list(db.collection("categories").where("slug", "==", "testes").limit(1).stream())
    
    if not test_cat_query:
        cat_test_ref = db.collection("categories").document()
        cat_test_ref.set({"name": "Testes", "slug": "testes"})
        cat_id = cat_test_ref.id
    else:
        cat_id = test_cat_query[0].id

    # Checar se produto de 2 centavos existe
    prod_test_query = list(db.collection("products").where("title", "==", "Produto de Teste 2 (Pix)").limit(1).stream())
    if not prod_test_query:
        print("Criando produto de 2 centavos...")
        db.collection("products").add({
            "title": "Produto de Teste 2 (Pix)",
            "description": "Segundo produto para testar fluxo de aprovação",
            "price": 0.02,
            "image_url": "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6",
            "category_id": cat_id
        })
        print("Produto de teste de 2 centavos criado com sucesso.")
    else:
        print("Produto de teste de 2 centavos já existe.")

if __name__ == "__main__":
    add_product()
