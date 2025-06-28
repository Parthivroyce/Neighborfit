from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simulated user database
users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "hashed_password": pwd_context.hash("admin123"),  # password is "admin123"
        "disabled": False,
    }
}
