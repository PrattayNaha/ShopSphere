@echo off
REM Tries wkhtmltopdf first; if missing, runs Node Puppeteer script.
SET HTML=docs\Project_Documentation.html
SET PDF=docs\Project_Documentation.pdf

where wkhtmltopdf >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  echo Using wkhtmltopdf...
  wkhtmltopdf "%HTML%" "%PDF%"
  IF %ERRORLEVEL% EQU 0 (
    echo Created %PDF%
    GOTO END
  ) ELSE (
    echo wkhtmltopdf failed; falling back to Puppeteer.
  )
)

REM Fallback to Node + Puppeteer
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo Node.js not found on PATH. Install Node.js to use the Puppeteer fallback.
  GOTO END
)

echo Running Puppeteer script (may download Chromium)...
node docs\convert_with_puppeteer.js "%HTML%" "%PDF%"

:END
PAUSE
