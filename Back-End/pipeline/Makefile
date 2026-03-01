# Makefile for macOS / Linux (POSIX)
# Usage: make <target>

PY := $(shell command -v python3 2>/dev/null || command -v python 2>/dev/null || echo python)
VENV_DIR := $(shell if [ -d ".venv" ]; then echo ".venv"; elif [ -d "venv" ]; then echo "venv"; else echo ".venv"; fi)
VENV_PY := $(VENV_DIR)/bin/python
UV := $(shell command -v uv 2>/dev/null || true)

.PHONY: help install clean preprocess-pipeline lstm-pipeline yield-pipeline run-all

help:
	@echo "Available targets:"
	@echo "  make install              - create venv and install dependencies"
	@echo "  make clean                - remove generated artifacts"
	@echo "  make preprocess-pipeline  - run inference preprocessing pipeline"
	@echo "  make lstm-pipeline        - run BiLSTM inference pipeline"
	@echo "  make yield-pipeline       - run yield inference pipeline"
	@echo "  make run-all              - run preprocess -> lstm -> yield"

install:
	@echo "Setting up virtual environment: $(VENV_DIR)"
	@test -d $(VENV_DIR) || $(PY) -m venv $(VENV_DIR)
	@echo "Using python: $(VENV_PY)"
	@$(VENV_PY) -m pip install --upgrade pip setuptools wheel
	@if [ -n "$(UV)" ]; then \
		echo "Detected 'uv' on PATH — installing via 'uv pip'"; \
		uv pip install -r requirements.txt; \
	else \
		$(VENV_PY) -m pip install -r requirements.txt; \
	fi
	@echo "✅ Installation completed. To activate: source $(VENV_DIR)/bin/activate"

clean:
	@echo "Cleaning generated artifacts..."
	@rm -rf artifacts/*.csv artifacts/*.png artifacts/*.joblib artifacts/*.keras artifacts/*.pkl artifacts/predictions || true
	@echo "✅ Clean completed"

preprocess-pipeline:
	@echo "🚀 Running preprocessing pipeline..."
	@$(VENV_PY) -m pipelines.inference_preprocessing
	@echo "✅ Preprocessing pipeline completed"

lstm-pipeline:
	@echo "🚀 Running BiLSTM inference pipeline..."
	@$(VENV_PY) -m pipelines.BiLSTM_inference
	@echo "✅ BiLSTM inference pipeline completed"

yield-pipeline:
	@echo "🚀 Running yield inference pipeline..."
	@$(VENV_PY) -m pipelines.yield_inference
	@echo "✅ Yield inference pipeline completed"

run-all: preprocess-pipeline lstm-pipeline yield-pipeline
