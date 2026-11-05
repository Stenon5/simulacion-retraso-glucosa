# Exporta un docx a PDF con una instancia propia de Word, al lado del docx y con el mismo nombre.
# Si la instancia trae documentos abiertos es la Word del usuario: aborta sin cerrar nada.
# Uso: pwsh -File exportar_pdf.ps1 <ruta del docx>
param([Parameter(Mandatory = $true)][string]$Docx)
$Docx = (Resolve-Path $Docx).Path
$pdf = [IO.Path]::ChangeExtension($Docx, '.pdf')
$antes = @(Get-Process WINWORD -EA SilentlyContinue | ForEach-Object Id)
$w = $null; $propia = $false
try {
  $w = New-Object -ComObject Word.Application
  if ($w.Documents.Count -gt 0) { throw 'La instancia de Word trae documentos abiertos. Abortado sin cerrar nada.' }
  $propia = $true
  $w.Visible = $false; $w.DisplayAlerts = 0
  $d = $w.Documents.Open($Docx, $false, $true)
  $d.SaveAs2($pdf, 17)
  "paginas segun Word: " + $d.ComputeStatistics(2)
  $d.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($d)
} finally {
  if ($w -and $propia) { $w.Quit(0) }
  if ($w) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($w) }
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
  Start-Sleep -Milliseconds 800
  Get-CimInstance Win32_Process -Filter "Name='WINWORD.EXE'" |
    Where-Object { $antes -notcontains $_.ProcessId -and $_.CommandLine -match 'Automation|Embedding' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -EA SilentlyContinue }
}
"pdf: $pdf"
