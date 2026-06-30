import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "attendance_db")

db = None
client = None

def get_db():
    global db, client
    if db is not None:
        return db
    
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        print("✅ Successfully connected to MongoDB")
        
        # Initialize collections and indexes
        init_indexes(db)
        return db
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("⚠️ Please make sure MongoDB is running. Server will run with limitations.")
        # Fallback to local in-memory or dummy client structure
        class DummyCollection:
            def find_one(self, *args, **kwargs): return None
            def find(self, *args, **kwargs): return []
            def insert_one(self, *args, **kwargs): return type('obj', (object,), {'inserted_id': None})()
            def update_one(self, *args, **kwargs): return type('obj', (object,), {'modified_count': 0})()
            def delete_one(self, *args, **kwargs): return type('obj', (object,), {'deleted_count': 0})()
            def delete_many(self, *args, **kwargs): return type('obj', (object,), {'deleted_count': 0})()
            def count_documents(self, *args, **kwargs): return 0
            def create_index(self, *args, **kwargs): pass
        
        class DummyDB:
            def __getitem__(self, item):
                return DummyCollection()
        
        return DummyDB()

def init_indexes(database):
    try:
        # Users index
        database["users"].create_index("email", unique=True)
        database["users"].create_index("roll", unique=True, sparse=True)
        
        # Students index
        database["students"].create_index("roll", unique=True)
        database["students"].create_index("department")
        database["students"].create_index("year")
        
        # Attendance index
        # To quickly filter by student, subject, or date
        database["attendance"].create_index([("roll", 1), ("date", 1), ("subject", 1)], unique=True)
        database["attendance"].create_index("date")
        database["attendance"].create_index("subject")
        
        print("✅ Collection indexes initialized successfully")
    except Exception as e:
        print(f"⚠️ Index initialization failed: {e}")
