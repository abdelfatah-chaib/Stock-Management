@echo off
setlocal EnableExtensions

REM Normalize JAVA_HOME from environment (remove quotes and trailing spaces)
if defined JAVA_HOME (
    set "JAVA_HOME=%JAVA_HOME:"=%"
)

:trim_java_home
if defined JAVA_HOME if "%JAVA_HOME:~-1%"==" " (
    set "JAVA_HOME=%JAVA_HOME:~0,-1%"
    goto :trim_java_home
)

REM If JAVA_HOME is missing or invalid, derive it from java.exe in PATH
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :run_backend
if defined JAVA_HOME echo [WARN] Provided JAVA_HOME is invalid: "%JAVA_HOME%"

set "JAVA_HOME="
for /f "delims=" %%I in ('where java 2^>nul') do (
    if not defined JAVA_HOME (
        for %%J in ("%%~dpI..") do set "JAVA_HOME=%%~fJ"
    )
)

REM Fallback via PowerShell command resolution if cmd where fails
if not defined JAVA_HOME (
    for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(Get-Command java -ErrorAction SilentlyContinue).Source"`) do (
        if not defined JAVA_HOME (
            for %%J in ("%%~dpI..") do set "JAVA_HOME=%%~fJ"
        )
    )
)

if not defined JAVA_HOME goto :java_error
if not exist "%JAVA_HOME%\bin\java.exe" goto :java_error
goto :run_backend

:java_error
echo.
echo [ERROR] Unable to resolve a valid JAVA_HOME.
echo [ERROR] Please install Java 17 and ensure java.exe is available in PATH.
echo.
exit /b 1

:run_backend
echo [INFO] Using JAVA_HOME=%JAVA_HOME%
cd /d "%~dp0"

powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($null -eq $c) { exit 0 }; $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; if ($p -and $p.ProcessName -ieq 'java') { try { $r = Invoke-WebRequest -Uri 'http://localhost:8083/api/ai/health' -UseBasicParsing -TimeoutSec 4; if ($r.StatusCode -eq 200) { Write-Host ('[INFO] Backend already running on port 8083 (PID ' + $c.OwningProcess + ').'); exit 11 } } catch {} }; $pname = if ($p) { $p.ProcessName } else { 'unknown' }; Write-Host ('[ERROR] Port 8083 is already in use by PID ' + $c.OwningProcess + ' (' + $pname + ').'); Write-Host '[ERROR] Stop that process or change server.port before starting backend.'; exit 12"

if %ERRORLEVEL%==0 goto :start_maven
if %ERRORLEVEL%==11 exit /b 0
exit /b 1

:start_maven
call mvnw.cmd spring-boot:run
exit /b %ERRORLEVEL%
