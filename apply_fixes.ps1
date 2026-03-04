Write-Host "Applying fixes..." -ForegroundColor Cyan

$files = @{
"FIXES/backend/src/routes/index.js"="backend/src/routes/index.js"
"FIXES/backend/src/services/emailService.js"="backend/src/services/emailService.js"
"FIXES/backend/src/services/residentService.js"="backend/src/services/residentService.js"
"FIXES/backend/src/services/stripeService.js"="backend/src/services/stripeService.js"
"FIXES/backend/src/server.js"="backend/src/server.js"
"FIXES/backend/src/jobs/scheduler.js"="backend/src/jobs/scheduler.js"
"FIXES/web/features/owner/rooms.service.ts"="web/features/owner/rooms.service.ts"
"FIXES/web/app/provider/layout.tsx"="web/app/provider/layout.tsx"
"FIXES/web/next-env.d.ts"="web/next-env.d.ts"
"FIXES/web/lib/api.ts"="web/lib/api.ts"
}

foreach ($file in $files.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "Updated $($file.Value)" -ForegroundColor Green
    } else {
        Write-Host "Missing $($file.Key)" -ForegroundColor Yellow
    }
}

Write-Host "Fixes applied."