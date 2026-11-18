@echo off
echo ===================================================
echo           Starting SpendWise Application
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend Server on port 5000...
start "SpendWise Backend (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend on port 5173...
start "SpendWise Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening SpendWise in your browser...
start http://localhost:5173

echo.
echo ===================================================
echo  SpendWise is now running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo  Do not close the two command prompt windows.
echo ===================================================
