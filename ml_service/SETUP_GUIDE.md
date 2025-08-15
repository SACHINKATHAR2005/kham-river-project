# ML Service Setup Guide

## 🚨 Current Issue
The ML service is having dependency issues. Here's how to fix it:

## 🔧 Step-by-Step Setup

### 1. Activate Virtual Environment
```bash
# Navigate to project root
cd "C:\Kham River"

# Activate virtual environment
& "c:/Kham River/.venv/Scripts/Activate.ps1"
```

### 2. Navigate to ML Service
```bash
cd ml_service
```

### 3. Install Dependencies
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install fastapi==0.109.0
pip install uvicorn==0.27.0
pip install scikit-learn==1.4.0
pip install pandas==2.2.0
pip install numpy==1.26.0
pip install python-multipart==0.0.6
pip install joblib==1.3.2
pip install requests==2.31.0
pip install pymongo==4.6.0
pip install httpx
```

### 4. Test Imports
```bash
python test_imports.py
```

### 5. Start ML Service
```bash
python start.py
```

## 🔍 Troubleshooting

### If sklearn still doesn't work:
1. **Check Python version:**
   ```bash
   python --version
   ```

2. **Check pip location:**
   ```bash
   pip --version
   ```

3. **Force reinstall sklearn:**
   ```bash
   pip uninstall scikit-learn
   pip install scikit-learn==1.4.0
   ```

4. **Alternative: Use conda (if available):**
   ```bash
   conda install scikit-learn
   ```

### If virtual environment issues:
1. **Recreate virtual environment:**
   ```bash
   # From project root
   python -m venv .venv --clear
   & "c:/Kham River/.venv/Scripts/Activate.ps1"
   ```

2. **Install in user space:**
   ```bash
   pip install --user scikit-learn
   ```

## 📋 Complete Dependencies List

The ML service requires these packages:
- fastapi==0.109.0
- uvicorn==0.27.0
- scikit-learn==1.4.0
- pandas==2.2.0
- numpy==1.26.0
- python-multipart==0.0.6
- joblib==1.3.2
- requests==2.31.0
- pymongo==4.6.0
- httpx

## 🚀 Quick Start Commands

```bash
# Complete setup in one go
cd "C:\Kham River"
& "c:/Kham River/.venv/Scripts/Activate.ps1"
cd ml_service
pip install fastapi==0.109.0 uvicorn==0.27.0 scikit-learn==1.4.0 pandas==2.2.0 numpy==1.26.0 python-multipart==0.0.6 joblib==1.3.2 requests==2.31.0 pymongo==4.6.0 httpx
python start.py
```

## ✅ Verification

After setup, the ML service should:
1. Start without import errors
2. Run on http://localhost:8000
3. Respond to training requests
4. Generate predictions

## 🆘 If Still Having Issues

1. **Check system Python vs virtual environment:**
   ```bash
   where python
   where pip
   ```

2. **Use absolute paths:**
   ```bash
   "C:\Kham River\.venv\Scripts\python.exe" start.py
   ```

3. **Check for conflicting packages:**
   ```bash
   pip list | findstr sklearn
   ``` 