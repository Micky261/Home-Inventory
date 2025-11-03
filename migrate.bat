@echo off
echo ========================================
echo Database Migration Tool
echo ========================================
echo.

cd /d %~dp0backend
C:\xampp\php\php.exe migrate.php

echo.
echo ========================================
pause
