"""Crea el usuario administrador inicial en MongoDB."""
import asyncio
import hashlib
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")
load_dotenv(ROOT / ".env")

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@inicia.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
ADMIN_NAME = os.environ.get("ADMIN_NAME", "Administrador")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


async def main() -> int:
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "menu_facturacion_inicia")
    if not mongo_url:
        print("ERROR: define MONGO_URL en .env o variables de entorno", file=sys.stderr)
        return 1

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {
                "$set": {
                    "role": "admin",
                    "status": "approved",
                    "name": ADMIN_NAME,
                    "password_hash": hash_password(ADMIN_PASSWORD),
                    "auth_type": "email",
                }
            },
        )
        print(f"Admin actualizado: {ADMIN_EMAIL}")
    else:
        await db.users.insert_one(
            {
                "user_id": "user_admin001",
                "email": ADMIN_EMAIL,
                "name": ADMIN_NAME,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "picture": "",
                "role": "admin",
                "status": "approved",
                "dias_vacaciones": 32,
                "dias_libres": 6,
                "color": "#EF4444",
                "abreviatura": "ADM",
                "auth_type": "email",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        print(f"Admin creado: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

    client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
