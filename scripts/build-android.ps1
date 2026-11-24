$ErrorActionPreference = 'Stop'

Push-Location (Join-Path $PSScriptRoot '..')
node scripts/prepare-assets.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node node_modules/next/dist/bin/next build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node scripts/build-offline.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node node_modules/@capacitor/cli/bin/capacitor sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:GRADLE_USER_HOME = 'C:\gradle_cache'
$env:JAVA_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
$env:GRADLE_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
Push-Location (Join-Path $PSScriptRoot '..\android')
try {
    .\gradlew.bat --no-daemon :app:assembleDebug
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
    Pop-Location
}
