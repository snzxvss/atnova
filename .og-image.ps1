Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class InkTool {
  // Recolorea los pixeles poco saturados (el texto blanco) al color de tinta,
  // conservando intacta la marca a color.
  public static void ToInk(Bitmap bm, byte ir, byte ig, byte ib) {
    int w = bm.Width, h = bm.Height;
    var r = bm.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int n = w * h * 4;
    byte[] p = new byte[n];
    Marshal.Copy(r.Scan0, p, 0, n);
    for (int i = 0; i < n; i += 4) {
      if (p[i+3] < 4) continue;
      int b = p[i], g = p[i+1], rr = p[i+2];
      int mx = Math.Max(rr, Math.Max(g, b));
      int mn = Math.Min(rr, Math.Min(g, b));
      double sat = 0.0;
      if (mx > 0) { sat = ((double)(mx - mn)) / ((double) mx); }
      if (sat < 0.28) {
        p[i] = ib; p[i+1] = ig; p[i+2] = ir;
      }
    }
    Marshal.Copy(p, 0, r.Scan0, n);
    bm.UnlockBits(r);
  }
}
'@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$dir = 'C:\Users\desar\OneDrive\Documentos\atnova-landing\assets'

# Logotipo en tinta (para fondo papel)
$bm = [System.Drawing.Bitmap]::FromFile("$dir\atnova-logo.png")
$ink = New-Object System.Drawing.Bitmap($bm)
$bm.Dispose()
[InkTool]::ToInk($ink, 26, 28, 46)
$ink.Save("$dir\atnova-logo-ink.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "atnova-logo-ink.png -> $($ink.Width)x$($ink.Height)"
$ink.Dispose()

# ---- Imagen Open Graph 1200x630 estilo papel ----
$og = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$paper = [System.Drawing.Color]::FromArgb(250, 246, 238)
$inkc  = [System.Drawing.Color]::FromArgb(26, 28, 46)
$rojo  = [System.Drawing.Color]::FromArgb(226, 74, 45)
$most  = [System.Drawing.Color]::FromArgb(240, 190, 60)

$g.Clear($paper)

# Retícula de puntos (halftone)
$dot = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 26, 28, 46))
for ($y = 0; $y -lt 630; $y += 16) {
  for ($x = 0; $x -lt 1200; $x += 16) { $g.FillEllipse($dot, $x, $y, 2, 2) }
}

# Barra superior roja
$g.FillRectangle((New-Object System.Drawing.SolidBrush $rojo), 14, 14, 1172, 12)
# Borde de tinta
$g.DrawRectangle((New-Object System.Drawing.Pen($inkc, 14)), 7, 7, 1186, 616)

# Logotipo
$logo = [System.Drawing.Bitmap]::FromFile("$dir\atnova-logo-ink.png")
$lw = 420
$lh = [int]($logo.Height * $lw / $logo.Width)
$g.DrawImage($logo, 84, 92, $lw, $lh)
$logo.Dispose()

$fTit = New-Object System.Drawing.Font("Arial Black", 52, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Regular)
$bInk = New-Object System.Drawing.SolidBrush $inkc

$g.DrawString("Tu negocio", $fTit, $bInk, 78, 220)
$g.DrawString("contesta solo.", $fTit, $bInk, 78, 292)

# Sticker de precio
$st = $g.Save()
$g.TranslateTransform(880, 400)
$g.RotateTransform(-7)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $most), -150, -70, 300, 140)
$g.DrawRectangle((New-Object System.Drawing.Pen($inkc, 6)), -150, -70, 300, 140)
$fD = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$fP = New-Object System.Drawing.Font("Arial Black", 30, [System.Drawing.FontStyle]::Bold)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("IA DESDE", $fD, $bInk, 0, -52, $sf)
$g.DrawString("`$290.000", $fP, $bInk, 0, -18, $sf)
$g.DrawString("instalacion  -51%", $fD, $bInk, 0, 28, $sf)
$g.Restore($st)

$g.DrawString("Chatbots con IA   /   Automatizaciones   /   Paginas web", $fSub, $bInk, 80, 490)
$g.DrawString("www.atnova.fun   /   +57 304 652 1755", $fSub, (New-Object System.Drawing.SolidBrush $rojo), 80, 534)

$g.Dispose()
$og.Save("$dir\og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()
Write-Output "og-image.png -> 1200x630"
