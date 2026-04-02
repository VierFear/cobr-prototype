@echo off
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
  echo Installation failed.
  pause
  exit /b %errorlevel%
)

echo Starting development server...
call npm run dev

pause