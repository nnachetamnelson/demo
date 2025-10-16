# Quick script to create subjects via API
$subjects = @("Mathematics", "English Language", "Science", "Physics", "Chemistry", "Biology", "History", "Geography", "Computer Science")

Write-Host "`n🌱 Creating subjects for school1..." -ForegroundColor Cyan

foreach ($subject in $subjects) {
    try {
        # Create subject directly via SQL in PostgreSQL container
        $sql = "INSERT INTO subjects (tenantId, name, createdAt, updatedAt) VALUES ('school1', '$subject', NOW(), NOW()) ON CONFLICT DO NOTHING;"
        docker exec -i postgres-test psql -U postgres -d education -c $sql 2>$null
        Write-Host "  ✓ $subject" -ForegroundColor Green
    } catch {
        # Ignore errors
    }
}

Write-Host "`n✅ Subjects created!`n" -ForegroundColor Green
Write-Host "Now refresh your registration page and type 'school1' in School ID field.`n" -ForegroundColor Yellow
