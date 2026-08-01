$ErrorActionPreference = 'Stop'

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:GRADLE_USER_HOME = 'C:\gradle_cache'
Push-Location (Join-Path $PSScriptRoot '..\android')
try {
    .\gradlew.bat --no-daemon assembleDebug
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}
