@echo off
REM 1. Build the project
call npm run build
REM 2. Get current date and time components
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set current_date=%%i
REM 3. Create a zip file of the dist folder
call "C:\Program Files\7-Zip\7z.exe" a -tzip deploy\%current_date%.zip .\.next\*
REM 4. Upload the zip file to S3 and start deployment
call aws s3 cp deploy\%current_date%.zip s3://vietduran-867490540757-ap-southeast-1-an/dev/%current_date%.zip --profile vietdurian
REM Start deployment using AWS CLI
call aws amplify update-branch --profile vietdurian --app-id d2k0kt672erqlu --branch-name dev --framework "Next.js - SSR" --source-url s3://vietduran-867490540757-ap-southeast-1-an/dev/%current_date%.zip
echo Deployment done file %current_date%.zip
