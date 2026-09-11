@echo off
title E-Commerce Premium - Inicializador

echo ==========================================
echo    Iniciando E-Commerce Premium (Pix)
echo ==========================================
echo.

if not exist "node_modules\" (
    echo [!] Instalando dependencias do Frontend (Node.js)...
    call npm install
)

if not exist "api\venv\" (
    echo [!] Criando ambiente virtual do Python...
    cd api
    python -m venv venv
    call .\venv\Scripts\activate.bat
    echo [!] Instalando pacotes do Backend...
    pip install -r requirements.txt
    cd ..
)

echo [1/2] Iniciando o servidor Backend (FastAPI + Firebase) na porta 8000...
start "Backend API" cmd /c "cd api && call .\venv\Scripts\activate.bat && uvicorn index:app --port 8000 --reload"

echo [2/2] Iniciando o servidor Frontend (React + Vite)...
start "Frontend Site" cmd /c "npm run dev"

echo.
echo Tudo pronto! 
echo Dois terminais foram abertos para manter os servidores rodando.
echo O site deve estar acessivel em http://localhost:5173
echo.
pause
