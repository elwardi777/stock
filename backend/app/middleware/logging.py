from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)


class LoggingMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            start_time = time.time()
            await self.app(scope, receive, send)
            process_time = time.time() - start_time
            logger.info(f"{request.method} {request.url.path} - {process_time:.3f}s")
        else:
            await self.app(scope, receive, send)
