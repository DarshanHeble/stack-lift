"""In-memory event broadcaster for Server-Sent Events (SSE) log and status streaming."""

import asyncio
from typing import Dict, Set
from pydantic import BaseModel


class StreamEvent(BaseModel):
    event: str  # 'log', 'stage_change', 'job_completed', 'error'
    data: dict


class EventBroadcaster:
    """Manages SSE subscribers per job ID."""

    def __init__(self):
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {}

    def subscribe(self, job_id: str) -> asyncio.Queue:
        """Subscribes an SSE client queue to a job's stream."""
        if job_id not in self._subscribers:
            self._subscribers[job_id] = set()
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[job_id].add(queue)
        return queue

    def unsubscribe(self, job_id: str, queue: asyncio.Queue):
        """Unsubscribes a disconnected SSE client queue."""
        if job_id in self._subscribers:
            self._subscribers[job_id].discard(queue)
            if not self._subscribers[job_id]:
                del self._subscribers[job_id]

    async def broadcast(self, job_id: str, event_type: str, payload: dict):
        """Dispatches an event to all connected SSE clients for a job."""
        if job_id not in self._subscribers:
            return
        event = StreamEvent(event=event_type, data=payload)
        for queue in list(self._subscribers[job_id]):
            try:
                await queue.put(event)
            except Exception:
                pass

    async def broadcast_log(self, job_id: str, stage: str, message: str, level: str = "INFO"):
        """Convenience helper to broadcast log messages to connected listeners."""
        await self.broadcast(
            job_id=job_id,
            event_type="log",
            payload={"stage": stage, "message": message, "level": level},
        )


broadcaster = EventBroadcaster()


