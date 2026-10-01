@echo off
title InternPath - XAMPP Launcher
echo ========================================
echo   InternPath Internship System
echo ========================================
echo.

set "XAMPP="
if exist "C:\Users\ACER\OneDrive\Documents\xampp_new\xampp-control.exe" (
    set "XAMPP=C:\Users\ACER\OneDrive\Documents\xampp_new"
    set "APPURL=http://localhost:8080/internship/"
) else if exist "C:\xampp\xampp-control.exe" (
    set "XAMPP=C:\xampp"
    set "APPURL=http://localhost/internship/"
)

if "%XAMPP%"=="" (
    echo ERROR: XAMPP was not found.
    echo Install XAMPP or update this script with your XAMPP path.
    pause
    exit /b 1
)

echo Using XAMPP: %XAMPP%
echo.

echo [1/4] Copying project to XAMPP htdocs...
if not exist "%XAMPP%\htdocs\internship" mkdir "%XAMPP%\htdocs\internship"
xcopy /E /Y /I "%~dp0*" "%XAMPP%\htdocs\internship\" >nul

echo [2/4] Starting Apache...
start "" /MIN "%XAMPP%\apache_start.bat"

echo [3/4] Starting MySQL...
start "" /MIN "%XAMPP%\mysql_start.bat"

echo Waiting for servers to start...
timeout /t 5 /nobreak >nul

echo [4/4] Installing database and opening the app...
start "" "%APPURL%api/install.php"
timeout /t 2 /nobreak >nul
start "" "%APPURL%"

echo.
echo Done! Open: %APPURL%
echo Login: admin / admin123
echo.
pause
