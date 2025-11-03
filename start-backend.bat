@echo off
echo Starting PHP Development Server for Home Inventory Backend...
echo.
echo Backend will be available at: http://localhost:9000
echo API Base URL: http://localhost:9000/api
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d C:\xampp\htdocs\HomeInventoryClaude\backend\public
C:\xampp\php\php.exe -S localhost:9000 router.php
