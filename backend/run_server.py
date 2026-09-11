import sys
from pathlib import Path

# Ensure backend dir is on path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    print("Starting KalaSetu backend on http://127.0.0.1:8000...", flush=True)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")
