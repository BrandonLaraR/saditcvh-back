import uvicorn
from app.core.config import settings
import os

# Configurar TESSDATA_PREFIX ANTES de importar cualquier cosa de Tesseract
os.environ['TESSDATA_PREFIX'] = '/usr/share/tesseract-ocr/5/tessdata'

# Luego continúa con tus imports
from fastapi import FastAPI
# ... resto de tu código
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
