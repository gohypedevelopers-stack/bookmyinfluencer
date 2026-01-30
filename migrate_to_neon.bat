@echo off
REM PostgreSQL to Neon Migration Script

echo Starting database migration from local PostgreSQL to Neon...
echo.

REM Set your source database details
set SOURCE_HOST=localhost
set SOURCE_PORT=5432
set SOURCE_DB=bookmyinfluencers
set SOURCE_USER=postgres

echo Step 1: Exporting data from local PostgreSQL...
echo Please enter your PostgreSQL password when prompted.
echo.

pg_dump -h %SOURCE_HOST% -p %SOURCE_PORT% -U %SOURCE_USER% -d %SOURCE_DB% --data-only --no-owner --no-privileges -f neon_migration_data.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Export failed. Please check:
    echo 1. PostgreSQL is installed and in PATH
    echo 2. Database name is correct: %SOURCE_DB%
    echo 3. Username is correct: %SOURCE_USER%
    echo 4. PostgreSQL service is running
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Importing data to Neon database...
echo.

psql "postgresql://neondb_owner:npg_k8vWeGauIXg2@ep-restless-bush-a1kk8dfq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -f neon_migration_data.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Import failed. Check the error messages above.
    pause
    exit /b 1
)

echo.
echo SUCCESS! Data migration completed.
echo The SQL dump file 'neon_migration_data.sql' has been saved for your records.
echo.
pause
