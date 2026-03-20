@echo off
setlocal

set "S3_BUCKET=vietduran-867490540757-ap-southeast-1-an"
set "AWS_REGION=ap-southeast-1"

set "SCRIPT_DIR=%~dp0"
for %%i in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fi"
set "DEPLOY_DIR=%PROJECT_ROOT%\deploy"
set "ZIP_TOOL=C:\Program Files\7-Zip\7z.exe"

cd /d "%PROJECT_ROOT%"
if %errorlevel% neq 0 (
	echo [FAILED] Cannot change directory to project root: %PROJECT_ROOT%
	exit /b 1
)

if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

if not exist "%ZIP_TOOL%" (
	echo [FAILED] 7-Zip not found: %ZIP_TOOL%
	exit /b 1
)

REM 1. Build the project
call npm run build
if %errorlevel% neq 0 (
	echo [FAILED] Build
	exit /b 1
)

if not exist "%PROJECT_ROOT%\.next\" (
	echo [FAILED] .next folder not found after build
	exit /b 1
)

REM 2. Get current date and time components
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set current_date=%%i
set "ZIP_PATH=%DEPLOY_DIR%\%current_date%.zip"

if exist "%ZIP_PATH%" del /f /q "%ZIP_PATH%"

REM 3. Create zip of .next output
call "%ZIP_TOOL%" a -tzip "%ZIP_PATH%" "%PROJECT_ROOT%\.next\*"
if %errorlevel% neq 0 (
	echo [FAILED] Zip creation
	exit /b 1
)

if not exist "%ZIP_PATH%" (
	echo [FAILED] Zip file was not created: %ZIP_PATH%
	exit /b 1
)

REM 4. Upload zip to S3
call aws s3 cp "%ZIP_PATH%" s3://%S3_BUCKET%/dev/%current_date%.zip --profile vietdurian --region %AWS_REGION%
if %errorlevel% neq 0 (
	echo [FAILED] S3 upload
	exit /b 1
)

REM 5. Start Amplify deployment
call aws amplify start-deployment --profile vietdurian --app-id d2k0kt672erqlu --branch-name dev --source-url s3://%S3_BUCKET%/dev/%current_date%.zip --region %AWS_REGION%
if %errorlevel% neq 0 (
	echo [FAILED] Amplify deployment start
	exit /b 1
)

echo [OK] Deployment done file %current_date%.zip
