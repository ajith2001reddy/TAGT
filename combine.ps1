# ============================================
# PROJECT CODE BUNDLER FOR REVIEW
# Creates 1 organized text file with project tree and all code
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROJECT CODE BUNDLER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$outputFolder = "project_review_package"
$outputFile = "Complete_Project_Review.txt"

# Create output folder
if (!(Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
    Write-Host "✓ Created output folder: $outputFolder" -ForegroundColor Green
}

# ============================================
# PART 1: Generate Project Tree Structure
# ============================================
Write-Host ""
Write-Host "Generating project tree structure..." -ForegroundColor Yellow

function Get-DirectoryTree {
    param(
        [string]$Path = ".",
        [string]$Prefix = "",
        [bool]$IsLast = $true
    )
    
    $items = Get-ChildItem -Path $Path | Where-Object { 
        $_.Name -notmatch '^(node_modules|\.git|bin|obj|dist|\.vs|\.vscode|__pycache__|venv|env|coverage|build)$' -and
        !$_.Name.StartsWith('.')
    } | Sort-Object { !$_.PSIsContainer }, Name
    
    $output = @()
    $count = $items.Count
    
    for ($i = 0; $i -lt $count; $i++) {
        $item = $items[$i]
        $isLastItem = ($i -eq ($count - 1))
        
        $connector = if ($isLastItem) { "└── " } else { "├── " }
        $output += "$Prefix$connector$($item.Name)"
        
        if ($item.PSIsContainer) {
            $newPrefix = if ($isLastItem) { "$Prefix    " } else { "$Prefix│   " }
            $output += Get-DirectoryTree -Path $item.FullName -Prefix $newPrefix -IsLast $isLastItem
        }
    }
    
    return $output
}

$treeOutput = @"
# PROJECT TREE STRUCTURE
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project Path: $((Get-Location).Path)
``````
$(Split-Path -Leaf (Get-Location))
$(Get-DirectoryTree -Path "." | Out-String)
``````

"@

# ============================================
# PART 2: Collect All Code Files
# ============================================
Write-Host "Collecting code files..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|bin|obj|dist|\.vs|\.vscode|__pycache__|venv|env|coverage|build|project_review_package' -and 
    $_.Extension -match '\.(js|jsx|ts|tsx|cs|py|java|cpp|c|h|hpp|html|css|scss|sass|php|rb|go|rs|swift|kt|json|xml|yaml|yml|md|txt|sh|sql|vue)$' -and
    !$_.Name.StartsWith('.')
} | Sort-Object FullName

Write-Host "✓ Found $($allFiles.Count) code files" -ForegroundColor Green

# ============================================
# PART 3: Create Summary
# ============================================
Write-Host "Creating project summary..." -ForegroundColor Yellow

# Count files by extension
$extensionStats = $allFiles | Group-Object Extension | Sort-Object Count -Descending

$summaryOutput = @"

# PROJECT SUMMARY

## File Statistics

Total Files: $($allFiles.Count)
Total Size: $([math]::Round(($allFiles | Measure-Object -Property Length -Sum).Sum / 1KB, 2)) KB

## File Type Distribution

| Extension | Count |
|-----------|-------|
$($extensionStats | ForEach-Object { "| $($_.Name) | $($_.Count) |" } | Out-String)

## All Files

$($allFiles | ForEach-Object { $i = 0 } { $i++; "$i. $($_.FullName.Replace((Get-Location).Path + '\', ''))" } | Out-String)

"@

# ============================================
# PART 4: Create Single Combined File
# ============================================
Write-Host ""
Write-Host "Creating combined review file..." -ForegroundColor Yellow

$fullOutputPath = Join-Path $outputFolder $outputFile

# Write header sections
$treeOutput + $summaryOutput | Out-File $fullOutputPath -Encoding UTF8

# Add separator before code files
@"

========================================
# ALL CODE FILES
========================================

"@ | Out-File $fullOutputPath -Append -Encoding UTF8

# Write all code files
$fileCount = 0
foreach ($file in $allFiles) {
    $fileCount++
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    
    Write-Host "  Processing: $relativePath ($fileCount/$($allFiles.Count))" -ForegroundColor Gray
    
    @"

// ##########################################
// FILE $fileCount of $($allFiles.Count): $relativePath
// SIZE: $($file.Length) bytes
// MODIFIED: $($file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"))
// ##########################################

"@ | Out-File $fullOutputPath -Append -Encoding UTF8
    
    try {
        Get-Content $file.FullName -Raw -ErrorAction Stop | Out-File $fullOutputPath -Append -Encoding UTF8
    } catch {
        "[Error reading file: $_]" | Out-File $fullOutputPath -Append -Encoding UTF8
    }
    
    "`n`n" | Out-File $fullOutputPath -Append -Encoding UTF8
}

# ============================================
# FINAL SUMMARY
# ============================================
$finalSize = [math]::Round((Get-Item $fullOutputPath).Length / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ BUNDLING COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output Location: $fullOutputPath" -ForegroundColor White
Write-Host "Total Code Files Bundled: $($allFiles.Count)" -ForegroundColor White
Write-Host "Combined File Size: $finalSize MB" -ForegroundColor White
Write-Host ""
Write-Host "Ready to send for review! 🚀" -ForegroundColor Green
Write-Host ""