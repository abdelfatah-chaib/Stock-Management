@echo off
REM Start All Services for Stock Management with External AI Integration
REM This script starts: Spring Boot Backend and Angular Frontend

echo.
echo ========================================
echo Stock Management AI System Starter
echo ========================================
echo.

REM Check if running from correct directory
if not exist "backend" (
    echo Error: backend folder not found!
    echo Please run this script from the Gestion-de-Stock root directory
    exit /b 1
)

REM Get the root directory
set ROOT_DIR=%cd%
echo [INFO] Backend Java resolution is handled by backend/run-backend.bat

echo.
echo Step 1: Starting Spring Boot Backend (Port 8083)...
echo ========================================
start "Spring Boot Backend" cmd /k "cd /d ""%ROOT_DIR%\backend"" && call run-backend.bat"
echo Spring Boot Backend starting in new window...
timeout /t 3 /nobreak

echo.
echo Step 2: Starting Angular Frontend (Port 4200)...
echo ========================================
start "Angular Frontend" cmd /k "cd /d ""%ROOT_DIR%\frontend"" && npm start"
echo Angular Frontend starting in new window...
timeout /t 3 /nobreak

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Waiting for services to initialize (20 seconds)...
timeout /t 20 /nobreak

echo.
echo ========================================
echo Services Status Check
echo ========================================
echo.

REM Check Spring Boot Backend
echo Checking Spring Boot Backend (http://localhost:8083/api/ai/health)...
curl http://localhost:8083/api/ai/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Spring Boot Backend is running
) else (
    echo [WAIT] Spring Boot Backend is starting, check http://localhost:8083 manually
)

echo.
echo ========================================
echo Service URLs:
echo ========================================
echo.
echo 1. Spring Boot Backend:
echo    Main URL: http://localhost:8083
echo    API Health: http://localhost:8083/api/ai/health
echo    Articles: http://localhost:8083/articles
echo.
echo 2. Angular Frontend:
echo    Main URL: http://localhost:4200
echo    AI Predictions: http://localhost:4200/ai/predictions
echo.
echo ========================================
echo.
echo Next Steps:
echo 1. Open http://localhost:4200 in your browser
echo 2. Navigate to "AI Predictions" from the menu
echo 3. Click "Analyze" on a single article row
echo.
echo Note: Set GROQ_API_KEY before starting backend to enable AI analysis
echo.
pause
