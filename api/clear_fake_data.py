from firebase_db import get_firestore_db

def clear_fake_data():
    db = get_firestore_db()
    
    products = list(db.collection("products").stream())
    deleted_count = 0
    
    for prod in products:
        data = prod.to_dict()
        # Se NÃO for o produto de teste, deleta
        if data.get("title") != "Produto de Teste (Pix)":
            db.collection("products").document(prod.id).delete()
            deleted_count += 1
            print(f"Deletado: {data.get('title')}")
            
    print(f"Total de produtos deletados: {deleted_count}")

if __name__ == "__main__":
    clear_fake_data()
