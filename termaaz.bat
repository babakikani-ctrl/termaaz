@echo off
REM TERMAAZ Launcher (Windows)

set DIR=%~dp0

REM Check if node_modules exists
if not exist "%DIR%node_modules" (
    echo First run detected. Running setup...
    call "%DIR%setup.bat"
)

REM Check if built
if exist "%DIR%dist\index.js" (
    node "%DIR%dist\index.js" %*
) else (
    REM Run in dev mode
    cd /d "%DIR%" && npx tsx src/index.tsx %*
)
