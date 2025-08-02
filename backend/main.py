from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import router

app = FastAPI()

# Allow frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)