import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
import json
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    if not firebase_admin._apps:
        firebase_cred_json = os.getenv("FIREBASE_CREDENTIALS")
        if firebase_cred_json:
            cred_dict = json.loads(firebase_cred_json)
            if "private_key" in cred_dict:
                cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
            cred = credentials.Certificate(cred_dict)
        else:
            # fallback to local file if available
            BASE_DIR = os.path.dirname(os.path.abspath(__file__))
            cred_path = os.path.join(BASE_DIR, "serviceAccountKey.json")
            cred = credentials.Certificate(cred_path)
            
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET", "api-pgmnt.appspot.com")
        })

init_firebase()

def get_firestore_db():
    return firestore.client()
