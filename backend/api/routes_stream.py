"""Server-Sent Events (SSE) log and stage streaming endpoint.

Handles:
- Client subscription to active job streams.
- Broadcasting realtime log and stage change events.
- Keepalive heartbeat pings.
"""

import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.core.events import broadcaster

router = APIRouter(prefix="/jobs", tags=["Streams"])


@router.get("/{job_id}/stream")
async def stream_job_events(job_id: str):
    """Server-Sent Events endpoint streaming real-time logs and stage changes."""
    queue = broadcaster.subscribe(job_id)

    async def event_generator():
        try:
            # 1. Initial connection confirmation
            yield f"event: connected\ndata: {json.dumps({'job_id': job_id})}\n\n"
            while True:
                try:
                    # 2. Await events from worker queue
                    event = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"event: {event.event}\ndata: {json.dumps(event.data)}\n\n"
                except asyncio.TimeoutError:
                    # 3. Keep-alive heartbeat ping every 20 seconds
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            # Unsubscribe disconnected clients cleanly
            broadcaster.unsubscribe(job_id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
