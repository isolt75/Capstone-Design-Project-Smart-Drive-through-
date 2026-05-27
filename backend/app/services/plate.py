"""번호판 문자열 정규화.

OCR 출력은 공백 유무가 들쭉날쭉하다("01가0785" vs "01가 0785"). 고객 매칭이
공백 때문에 빗나가지 않도록, 비교용 키는 모든 공백을 제거한 형태로 통일한다.
DB 측 비교는 func.replace(car_num, ' ', '') 와 함께 사용한다.
"""

from __future__ import annotations


def normalize(plate: str | None) -> str:
    """모든 공백 제거 (앞뒤/중간 모두). None → ''."""
    return "".join((plate or "").split())
