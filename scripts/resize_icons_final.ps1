Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    $img = [System.Drawing.Image]::FromFile($InputPath)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $graph.DrawImage($img, 0, 0, $Width, $Height)
    
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $img.Dispose()
    $bmp.Dispose()
    $graph.Dispose()
}

$master = "C:\Users\rusto\.gemini\antigravity\brain\96caafd8-5165-47dc-bc6d-6870bc3717a2\master_logo_astrotradesfx_1773149669497.png"
$destBase = "c:\Users\rusto\Documents\backup\web\2026\astrotradesfx\public"

Resize-Image -InputPath $master -OutputPath "$destBase\favicon.ico" -Width 32 -Height 32
Resize-Image -InputPath $master -OutputPath "$destBase\apple-icon.png" -Width 180 -Height 180
Resize-Image -InputPath $master -OutputPath "$destBase\icon-192.png" -Width 192 -Height 192
Resize-Image -InputPath $master -OutputPath "$destBase\icon-512.png" -Width 512 -Height 512
Resize-Image -InputPath $master -OutputPath "$destBase\logo.png" -Width 512 -Height 512

Write-Host "Success"
