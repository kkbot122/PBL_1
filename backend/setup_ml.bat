@echo off
echo Installing Python ML dependencies...
python -m pip install -r python\requirements.txt

echo Testing model loader...
python python\test_models.py

echo Setup complete! 