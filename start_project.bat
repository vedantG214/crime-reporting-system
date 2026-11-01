@echo off
cd /d "%~dp0"
title CrimeGuard - Full Stack Launcher

echo ===================================================
echo   Starting CrimeGuard Crime Reporting System...
echo ===================================================

echo [1/3] Starting Backend Server on Port 5000...
start "CrimeGuard Backend" cmd /k "cd /d "%~dp0" && node backend/index.js"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend Server on Port 5173...
start "CrimeGuard Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Opening CrimeGuard in Browser...
start http://localhost:5173

echo ===================================================
echo   All systems running!
echo ===================================================
pause