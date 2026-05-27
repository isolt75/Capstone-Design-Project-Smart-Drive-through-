"""STT 라우터. 키오스크 마이크 오디오를 받아 Clova Speech로 텍스트 변환.

dtWeb src/api/stt.ts: POST /api/stt (multipart 'audio') → {text}
"""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services import clova

router = APIRouter(prefix="/api", tags=["stt"])


@router.post("/stt")
async def stt(audio: UploadFile = File(...)):
    wav_bytes = await audio.read()
    try:
        text = clova.transcribe(wav_bytes)
    except clova.STTUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except clova.STTError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"text": text}
