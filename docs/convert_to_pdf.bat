@echo off
REM Attempt to convert Project_Documentation.md to PDF using pandoc
SET MD=docs\Project_Documentation.md
SET PDF=docs\Project_Documentation.pdf
pandoc "%MD%" -o "%PDF%"
IF %ERRORLEVEL% NEQ 0 (
  echo Pandoc conversion failed or pandoc not found.
  echo If you have pandoc installed, ensure it is on your PATH.
  echo You can install pandoc: https://pandoc.org/installing.html
  echo Or convert manually using: pandoc docs\Project_Documentation.md -o docs\Project_Documentation.pdf
) ELSE (
  echo Created %PDF%
)
PAUSE
