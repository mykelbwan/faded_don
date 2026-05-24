from fastapi import FastAPI
from pydantic import BaseModel

from don import get_response


app = FastAPI()


class DonRequest(BaseModel):
    username: str
    message: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/don")
def don(request: DonRequest) -> dict[str, str]:
    user_input = f"Discord username: {request.username}\nMessage: {request.message}"
    message = get_response(user_input)
    text = ""

    if isinstance(message.content, list) and message.content:
        first_block = message.content[0]
        if isinstance(first_block, dict):
            text = first_block.get("text", "")
    elif isinstance(message.content, str):
        text = message.content

    return {"response": text}
