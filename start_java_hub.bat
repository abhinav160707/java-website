@echo off
echo ===================================================
echo   Starting Java DSA Learning Hub
echo   URL: http://localhost:8080
echo ===================================================
start "" http://localhost:8080
python -m http.server 8080
