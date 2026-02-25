@echo off
echo Starting Home Inventory System...
echo.

echo Starting Backend (PHP) on http://localhost:9268
start "Backend" cmd /k "cd /d %~dp0backend\public && php -S localhost:9268 router.php"

echo Starting Frontend (Angular) on http://localhost:4268
start "Frontend" cmd /k "cd /d %~dp0frontend && yarn start"

echo.
echo Both servers are starting...
echo - Backend:  http://localhost:9268
echo - Frontend: http://localhost:4268
