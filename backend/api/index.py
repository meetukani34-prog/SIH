import json
import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path so 'app' module can be imported properly in Vercel Serverless
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

try:
    from app.main import app as fastapi_app
except Exception:
    fastapi_app = None
    startup_error = traceback.format_exc()
else:
    startup_error = None


async def handler(scope, receive, send):
    if scope.get("type") == "http":
        req_path = scope.get("path", "")

        # Diagnostic endpoint: inspect paths and environment live on Vercel
        if req_path == "/__debug" or req_path.endswith("/__debug"):
            data = {
                "startup_error": startup_error,
                "scope_path": scope.get("path"),
                "scope_raw_path": scope.get("raw_path", b"").decode("latin1", "ignore"),
                "root_path": scope.get("root_path"),
                "headers": {k.decode("latin1"): v.decode("latin1") for k, v in scope.get("headers", [])},
                "python_version": sys.version,
                "registered_routes": [
                    getattr(route, "path", str(route))
                    for route in (fastapi_app.routes if fastapi_app else [])
                ],
            }
            body = json.dumps(data, indent=2).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [
                    [b"content-type", b"application/json; charset=utf-8"],
                    [b"content-length", str(len(body)).encode("ascii")],
                    [b"access-control-allow-origin", b"*"],
                ],
            })
            await send({"type": "http.response.body", "body": body})
            return

        if startup_error:
            body = f"AyurCTMS Backend Startup Error:\n\n{startup_error}".encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    [b"content-type", b"text/plain; charset=utf-8"],
                    [b"content-length", str(len(body)).encode("ascii")],
                    [b"access-control-allow-origin", b"*"],
                ],
            })
            await send({"type": "http.response.body", "body": body})
            return

        # Normalize path when Vercel serverless rewrite prepends the entrypoint path
        for prefix in ["/api/index.py", "/api/index"]:
            if req_path == prefix or req_path == f"{prefix}/":
                scope["path"] = "/"
                break
            elif req_path.startswith(prefix + "/"):
                scope["path"] = req_path[len(prefix):]
                break

    return await fastapi_app(scope, receive, send)

app = handler
