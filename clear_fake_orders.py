from firebase_db import get_firestore_db

def clear_fake_orders():
    db = get_firestore_db()
    
    orders = list(db.collection("orders").stream())
    deleted_count = 0
    
    for order in orders:
        db.collection("orders").document(order.id).delete()
        deleted_count += 1
            
    print(f"Total de pedidos falsos deletados: {deleted_count}")

if __name__ == "__main__":
    clear_fake_orders()
