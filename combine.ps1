# ============================================
# PROJECT CODE BUNDLER FOR REVIEW
# Creates 25 organized text files with project tree
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROJECT CODE BUNDLER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$totalParts = 24  # 24 files for code (file 1 is for tree + summary)
$outputFolder = "project_review_package"

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
# PART 3: Create Summary File
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

# Write Part 1: Tree + Summary
$part1File = Join-Path $outputFolder "Part_01_TREE_AND_SUMMARY.txt"
$treeOutput + $summaryOutput | Out-File $part1File -Encoding UTF8
Write-Host "✓ Created Part_01_TREE_AND_SUMMARY.txt" -ForegroundColor Green

# ============================================
# PART 4: Bundle Code Files into Parts
# ============================================
Write-Host ""
Write-Host "Bundling code files into $totalParts parts..." -ForegroundColor Yellow

$filesPerPart = [Math]::Ceiling($allFiles.Count / $totalParts)

for ($i = 0; $i -lt $totalParts; $i++) {
    $partNum = $i + 2  # Start from 2 (Part 1 is tree)
    $batch = $allFiles | Select-Object -Skip ($i * $filesPerPart) -First $filesPerPart
    $outFile = Join-Path $outputFolder ("Part_{0:D2}_CODE_FILES.txt" -f $partNum)
    
    if ($batch) {
        $partContent = @"
# CODE REVIEW - PART $partNum
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Files in this part: $($batch.Count)

========================================

"@
        $partContent | Out-File $outFile -Encoding UTF8
        
        foreach ($file in $batch) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
            
            @"

// ##########################################
// FILE: $relativePath
// SIZE: $($file.Length) bytes
// MODIFIED: $($file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"))
// ##########################################

"@ | Out-File $outFile -Append -Encoding UTF8
            
            try {
                Get-Content $file.FullName -Raw -ErrorAction Stop | Out-File $outFile -Append -Encoding UTF8
            } catch {
                "[Error reading file: $_]" | Out-File $outFile -Append -Encoding UTF8
            }
            
            "`n`n" | Out-File $outFile -Append -Encoding UTF8
        }
        
        Write-Host "  ✓ Created Part_$($partNum.ToString('D2'))_CODE_FILES.txt ($($batch.Count) files)" -ForegroundColor Green
    }
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ BUNDLING COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output Location: $((Join-Path (Get-Location) $outputFolder))" -ForegroundColor White
Write-Host "Total Files Created: $((Get-ChildItem $outputFolder).Count)" -ForegroundColor White
Write-Host "Total Code Files Bundled: $($allFiles.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Ready to send for review! 🚀" -ForegroundColor Green
Write-Host ""