$ErrorActionPreference = 'Stop'
docker compose up -d postgres mailpit
Start-Process -WindowStyle Hidden -FilePath 'cmd.exe' -ArgumentList '/c','cd frontend && npm.cmd run dev'
Push-Location backend
try { .\mvnw.cmd spring-boot:run } finally { Pop-Location }
