<#
PowerShell task runner for inference workflows.
Usage examples:
  ./make.ps1 install
  ./make.ps1 clean
  ./make.ps1 preprocess-pipeline
  ./make.ps1 lstm-pipeline
  ./make.ps1 yield-pipeline
  ./make.ps1 run-all
#>

param(
    [string]$target = "help"
)

$PYTHON = "python"
if (Test-Path ".\.venv") { $VENV_DIR = ".venv" }
elseif (Test-Path ".\venv") { $VENV_DIR = "venv" }
else { $VENV_DIR = ".venv" }

$VENV_ACTIVATE = ".\$VENV_DIR\Scripts\Activate.ps1"
$VENV_PYTHON = ".\$VENV_DIR\Scripts\python.exe"
$USE_UV = [bool](Get-Command uv -ErrorAction SilentlyContinue)

function Use-Venv {
    if (Test-Path $VENV_ACTIVATE) { . $VENV_ACTIVATE }
    if (Test-Path $VENV_PYTHON) {
        return $VENV_PYTHON
    }
    return $PYTHON
}

function Help {
    Write-Host "Available targets:"
    Write-Host "  ./make.ps1 install             - create venv and install dependencies"
    Write-Host "  ./make.ps1 clean               - remove generated artifacts"
    Write-Host "  ./make.ps1 preprocess-pipeline - run inference preprocessing pipeline"
    Write-Host "  ./make.ps1 lstm-pipeline       - run BiLSTM inference pipeline"
    Write-Host "  ./make.ps1 yield-pipeline      - run yield inference pipeline"
    Write-Host "  ./make.ps1 run-all             - run preprocess -> lstm -> yield"
}

function Install {
    Write-Host "Setting up virtual environment: $VENV_DIR" -ForegroundColor Cyan
    if (-not (Test-Path $VENV_DIR)) {
        & $PYTHON -m venv $VENV_DIR
    }

    $py = Use-Venv
    & $py -m pip install --upgrade pip setuptools wheel

    if ($USE_UV) {
        Write-Host "Detected 'uv' on PATH — installing via uv pip" -ForegroundColor Cyan
        & uv pip install -r requirements.txt
    }
    else {
        & $py -m pip install -r requirements.txt
    }

    Write-Host "✅ Installation completed. Activate with: .\$VENV_DIR\Scripts\Activate.ps1"
}

function Clean {
    Write-Host "Cleaning generated artifacts..." -ForegroundColor Yellow
    Remove-Item -Path "artifacts\*.csv" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "artifacts\*.png" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "artifacts\*.joblib" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "artifacts\*.keras" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "artifacts\*.pkl" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "artifacts\predictions" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Clean completed"
}

function PreprocessPipeline {
    Write-Host "🚀 Running preprocessing pipeline..."
    $py = Use-Venv
    & $py -m pipelines.inference_preprocessing
    Write-Host "✅ Preprocessing pipeline completed"
}

function LstmPipeline {
    Write-Host "🚀 Running BiLSTM inference pipeline..."
    $py = Use-Venv
    & $py -m pipelines.BiLSTM_inference
    Write-Host "✅ BiLSTM inference pipeline completed"
}

function YieldPipeline {
    Write-Host "🚀 Running yield inference pipeline..."
    $py = Use-Venv
    & $py -m pipelines.yield_inference
    Write-Host "✅ Yield inference pipeline completed"
}

function RunAll {
    Write-Host "Running all pipelines: preprocess -> lstm -> yield" -ForegroundColor Cyan
    PreprocessPipeline
    LstmPipeline
    YieldPipeline
    Write-Host "✅ All pipelines completed"
}

switch ($target) {
    "help" { Help }
    "install" { Install }
    "clean" { Clean }
    "preprocess-pipeline" { PreprocessPipeline }
    "lstm-pipeline" { LstmPipeline }
    "yield-pipeline" { YieldPipeline }
    "run-all" { RunAll }
    default { Help }
}
