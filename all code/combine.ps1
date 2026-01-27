# This script bundles your code into 25 text files
$allFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|bin|obj|dist|\.vs' -and 
    $_.Extension -match '\.js|\.cs|\.py|\.html|\.css|\.ts|\.cpp|\.txt|\.json'
}

$totalParts = 25
$filesPerPart = [Math]::Ceiling($allFiles.Count / $totalParts)

for ($i = 0; $i -lt $totalParts; $i++) {
    $partNum = $i + 1
    $batch = $allFiles | Select-Object -Skip ($i * $filesPerPart) -First $filesPerPart
    $outFile = "Project_Summary_Part_$partNum.txt"
    
    if ($batch) {
        foreach ($file in $batch) {
            " `n// ##########################################" | Out-File $outFile -Append
            "// FILE: $($file.FullName)" | Out-File $outFile -Append
            "// ##########################################`n" | Out-File $outFile -Append
            Get-Content $file.FullName -Raw | Out-File $outFile -Append
        }
        Write-Host "Created $outFile"
    }
}