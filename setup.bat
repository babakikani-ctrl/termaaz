@echo off
chcp 65001 >nul
cls

echo.
echo  ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
echo  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
echo     ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
echo     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
echo     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
echo     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
echo.
echo  P2P Terminal Collaboration Platform
echo.

echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   X Node.js not found!
    echo   Please install Node.js 18+ from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   √ Node.js %NODE_VERSION% found

echo [2/4] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   X npm not found!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo   √ npm %NPM_VERSION% found

echo [3/4] Installing dependencies...
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo   X Failed to install dependencies
    pause
    exit /b 1
)
echo   √ Dependencies installed

echo [4/4] Building project...
call npm run build --silent 2>nul
echo   √ Build complete

echo.
echo ════════════════════════════════════════════════════════════
echo   TERMAAZ installed successfully!
echo ════════════════════════════════════════════════════════════
echo.
echo   Quick Start:
echo.
echo   Create a new room:
echo     termaaz --create
echo     or: npm start -- --create
echo.
echo   Join a room:
echo     termaaz ^<room-id^>
echo     or: npm start -- ^<room-id^>
echo.
echo   See all commands:
echo     Type /h or /help inside Termaaz
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
