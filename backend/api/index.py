import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path so 'app' module can be imported properly in Vercel Serverless
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

try:
    from app.main import app
    handler = app
except Exception:
    err_tb = traceback.format_exc()
    print("FATAL: Failed to import app.main:\n", err_tb)

    async def fallback_handler(scope, receive, send):
        if scope.get("type") == "http":
            body = (
                f"AyurCTMS Backend Diagnostic — Startup Error:\n\n{err_tb}\n\n"
                f"Python version: {sys.version}\n"
            ).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    [b"content-type", b"text/plain; charset=utf-8"],
                    [b"content-length", str(len(body)).encode("ascii")],
                    [b"access-control-allow-origin", b"*"],
                ],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })

    handler = fallback_handler
    app = fallback_handler
