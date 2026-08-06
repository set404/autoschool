Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Fifth-Armine\Desktop\autoschool\public\favicon.png"
$resRoot = "C:\Users\Fifth-Armine\Desktop\autoschool\android\app\src\main\res"

# (density folder, legacy icon size, adaptive foreground canvas size)
# Adaptive foreground canvas is larger than the legacy icon; the logo is
# drawn centered within it so the OS's mask doesn't crop the circular logo.
$targets = @(
    @{ Dir = "mipmap-mdpi";    Legacy = 48;  Foreground = 108 },
    @{ Dir = "mipmap-hdpi";    Legacy = 72;  Foreground = 162 },
    @{ Dir = "mipmap-xhdpi";   Legacy = 96;  Foreground = 216 },
    @{ Dir = "mipmap-xxhdpi";  Legacy = 144; Foreground = 324 },
    @{ Dir = "mipmap-xxxhdpi"; Legacy = 192; Foreground = 432 }
)

function New-ResizedSquare {
    param([System.Drawing.Image]$Source, [int]$Size)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($Source, 0, 0, $Size, $Size)
    $g.Dispose()
    return $bmp
}

function New-CenteredOnCanvas {
    param([System.Drawing.Image]$Source, [int]$CanvasSize, [int]$ContentSize)
    $bmp = New-Object System.Drawing.Bitmap($CanvasSize, $CanvasSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $offset = [int](($CanvasSize - $ContentSize) / 2)
    $g.DrawImage($Source, $offset, $offset, $ContentSize, $ContentSize)
    $g.Dispose()
    return $bmp
}

$src = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($t in $targets) {
    $dir = Join-Path $resRoot $t.Dir

    $legacy = New-ResizedSquare -Source $src -Size $t.Legacy
    $legacy.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $legacy.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $legacy.Dispose()

    # Foreground layer stays at the full adaptive-icon canvas size (not the
    # legacy size) -- the OS masks/crops this canvas itself. Logo drawn at
    # ~66% of it (Android's "safe zone" guidance), centered, so nothing
    # gets clipped by that mask.
    $contentSize = [int]($t.Foreground * 0.66)
    $fg = New-CenteredOnCanvas -Source $src -CanvasSize $t.Foreground -ContentSize $contentSize
    $fg.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose()

    Write-Output "Wrote $($t.Dir): legacy $($t.Legacy)px, foreground $($t.Foreground)px"
}

$src.Dispose()
Write-Output "Done"
