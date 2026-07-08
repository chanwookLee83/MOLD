@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist node_modules (
  echo 최초 실행 준비 중입니다. 잠시만 기다려주세요...
  call npm install
)

echo.
echo 금형 정비 실적 관리 앱을 시작합니다.
echo 브라우저가 자동으로 열립니다. 종료하려면 이 창을 닫으세요.
echo.
call npm run dev -- --open
pause
