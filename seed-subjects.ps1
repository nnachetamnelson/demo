# PowerShell script to seed subjects for a school
param(
    [Parameter(Mandatory=$true)]
    [string]$TenantId
)

Write-Host "`n🌱 Seeding subjects for tenant: $TenantId" -ForegroundColor Cyan

# Seed subjects using API
$subjects = @(
    "Mathematics",
    "English Language",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
    "Art",
    "Music",
    "Foreign Language",
    "Economics",
    "Literature"
)

$count = 0
foreach ($subject in $subjects) {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8080/api/subjects" `
            -Method POST `
            -Headers @{ "Authorization" = "Bearer $token" } `
            -ContentType "application/json" `
            -Body (ConvertTo-Json @{ tenantId = $TenantId; name = $subject })
        
        $count++
        Write-Host "  ✓ $subject" -ForegroundColor Green
    } catch {
        Write-Host "  × $subject (may already exist)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Seeded $count subjects for $TenantId`n" -ForegroundColor Green
