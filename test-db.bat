@echo off
echo ========================================
echo Database Initialization Test
echo ========================================
echo.

cd /d %~dp0backend
C:\xampp\php\php.exe test-db-init.php

echo.
echo ========================================
pause
