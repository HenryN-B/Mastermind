from flask import Flask, render_template, url_for, request, redirect
from flask_socketio import SocketIO, join_room, leave_room, emit
import random
from string import ascii_uppercase
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)  

MAX_PLAYERS = 2

rooms = {}
sid_to_client = {}
sid_to_room = {}

def generate_unique_code(length=4):
    while True:
        code = "".join(random.choice(ascii_uppercase) for _ in range(length))
        if code not in rooms:
            return code

@app.route("/")
def index():
    return render_template("game.html")

@app.route("/room/<room_code>")
def room(room_code):
    room_code = room_code.strip().upper()
    if room_code not in rooms:
        return redirect("/")
    return render_template("room.html", data={"code": room_code})

def _join_room(room, client_id, sid):
    # If this sid was in another room, remove it
    old_room = sid_to_room.get(sid)
    if old_room and old_room != room:
        _leave_room(old_room, sid)

    players = rooms[room]["players"]
    is_rejoin = client_id in players


    if (not is_rejoin) and (len(players) >= MAX_PLAYERS):
        return False, "Room full"


    old_sid = players.get(client_id)
    if old_sid and old_sid != sid:
        sid_to_room.pop(old_sid, None)
        sid_to_client.pop(old_sid, None)

    players[client_id] = sid
    sid_to_room[sid] = room
    sid_to_client[sid] = client_id
    join_room(room)

    emit("room_update", {"room": room, "count": len(rooms[room]["players"])}, to=room)
    return True, None

def _leave_room(room, sid):
    """Remove sid from mappings and remove its client_id from the room."""
    leave_room(room)

    client_id = sid_to_client.pop(sid, None)
    sid_to_room.pop(sid, None)

    if not client_id or room not in rooms:
        return

    players = rooms[room]["players"]

    # Only remove if this sid is still the active sid for that client_id
    if players.get(client_id) == sid:
        del players[client_id]

    emit("room_update", {"room": room, "count": len(players)}, to=room)

    if len(players) == 0:
        del rooms[room]

@socketio.on("create_room")
def handle_create_room(data):
    client_id = (data.get("client_id") or "").strip()
    room = generate_unique_code(4)
    rooms[room] = {"players": {}}

    ok, err = _join_room(room, client_id, request.sid)
    if not ok:
        emit("join_failed", {"error": err}, to=request.sid)
        return

    emit("room_created",
         {"room": room, "url": url_for("room", room_code=room, _external=True)},
         to=request.sid)

@socketio.on("join_room")
def handle_join_room(data):
    room = (data.get("room") or "").strip().upper()
    client_id = (data.get("client_id") or "").strip()

    if room not in rooms:
        emit("join_failed", {"error": "Room not found."}, to=request.sid)
        return

    ok, err = _join_room(room, client_id, request.sid)
    if not ok:
        emit("join_failed", {"error": err}, to=request.sid)
        return

    emit("join_success",
        {"room": room, "url": url_for("room", room_code=room, _external=True)},
        to=request.sid)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000,debug=True)