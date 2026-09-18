# Copyright (C) 2026  Henry Norton-Bower

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from flask import Flask, render_template, url_for, request, redirect, session
from flask_socketio import SocketIO, join_room, leave_room, emit
from collections import Counter
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



def compute_feedback(code, guess):
    red = sum(1 for c, g in zip(code, guess) if c == g)
    code_left = Counter()
    guess_left = Counter()
    for c, g in zip(code, guess):
        if c != g:
            code_left[c] += 1
            guess_left[g] += 1
    white = sum(min(code_left[color], guess_left[color]) for color in guess_left)
    return red, white


def count_submitted_feedback(key_row):
    red = key_row.count(0)
    white = key_row.count(1)
    return red, white

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/room/<room_code>")
def room(room_code):
    room_code = room_code.strip().upper()
    if room_code not in rooms:
        return redirect("/")
    return render_template("room.html", data={"code": room_code, 
                                              "host": rooms[room_code]["host"]})

@app.route("/game")
def game():
    room = request.args.get("room", "").strip().upper()

    client_id = request.cookies.get("client_id")


    if not room or not client_id:
        return redirect("/")

    if room not in rooms:
        return redirect("/")

    if not rooms[room]["started"]:
        return redirect("/")

    if client_id not in rooms[room]["players"]:
        return redirect("/")

    data = {"room": room,
                "players": rooms[room]["players"],
                "host": rooms[room]["host"]}
    return render_template("game.html", data = data)

# Join function
def _join_room(room, client_id, sid):

    old_room = sid_to_room.get(sid)
    if old_room and old_room != room:
        _leave_room(old_room, sid)

    players = rooms[room]["players"]
    is_rejoin = client_id in players
    print(f"{client_id} Joined the room")

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

    game_state = rooms[room].get("game_state", {})
    emit("update_game", game_state, to=sid)
    return True, None


# Leave function
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

# Create room event 
@socketio.on("create_room")
def handle_create_room(data):
    client_id = (data.get("client_id") or "").strip()
    room = generate_unique_code(4)
    rooms[room] = {"players": {},
                   "started": False,
                    "host": client_id}

    ok, err = _join_room(room, client_id, request.sid)
    if not ok:
        emit("join_failed", {"error": err}, to=request.sid)
        return

    emit("room_created",
         {"room": room, "url": url_for("room", room_code=room, _external=True)},
         to=request.sid)


# Join room event happens
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


def create_default_game_state():
    return {
        "board": [[-1] * 4 for _ in range(10)],
        "keyBoard": [[-1]*4 for _ in range(10)],
        "code": None,
        "current_row": -1,
        "codeTurn": True
    }


# Start room button clicked 
@socketio.on("start_room")
def start_game(data):
    room = (data.get("room") or "").strip().upper()
    client_id = (data.get("client_id") or "").strip()
    print("start game clicked")
    if room not in rooms:
        emit("start_failed", {"error": "Room not found."}, to=request.sid)
        return

    if client_id not in rooms[room]["players"]:
        emit("start_failed", {"error": "Not in room"}, to=request.sid)
        return

    if len(rooms[room]["players"]) != MAX_PLAYERS:
        emit("start_failed", {"error": "Need 2 players"}, to=request.sid)
        return

    rooms[room]["started"] = True
    rooms[room]["game_state"] = create_default_game_state()

    emit("game_started", {"room": room}, to=room)

    
@socketio.on("submit_guess")
def handle_submit_guess(data):
    room = data.get("room")
    if room is None or room not in rooms:
        return

    game_state = rooms[room].setdefault("game_state", create_default_game_state())
    current_row = game_state["current_row"]
    guess = data.get("guess")  

    if guess is None:
        emit("action_rejected", {"reason": "Guess is incomplete."}, to=request.sid)
        return

    if game_state.get("codeTurn"):
        emit("action_rejected", {"reason": "Not your turn to guess."}, to=request.sid)
        return

    game_state["board"][current_row] = guess
    game_state["codeTurn"] = True

    emit("update_game", game_state, to=room)


@socketio.on("submit_code")
def handle_submit_code(data):
    room = data.get("room")
    if room is None or room not in rooms:
        return

    client_id = data.get("client_id")
    code = data.get("code")
    if client_id != rooms[room].get("host"):
        emit("action_rejected", {"reason": "Only the code giver can set the code."}, to=request.sid)
        return

    if code is None or len(code) != 4:
        emit("action_rejected", {"reason": "Code must have all 4 pegs filled."}, to=request.sid)
        return

    game_state = rooms[room].setdefault("game_state", create_default_game_state())

    if game_state.get("code") is not None:
        emit("action_rejected", {"reason": "Code has already been set."}, to=request.sid)
        return

    game_state["code"] = code
    game_state["current_row"] = 9
    game_state["codeTurn"] = False

    emit("update_game", game_state, to=room)

@socketio.on("submit_feedback")
def handle_submit_feedback(data):
    room = data.get("room")
    if room is None or room not in rooms:
        return

    game_state = rooms[room].setdefault("game_state", create_default_game_state())
    current_row = game_state["current_row"]
    secret_code = game_state.get("code")
    guess = game_state["board"][current_row]

    correct_red, correct_white = compute_feedback(secret_code, guess)
    submitted_key_row = data.get("keyRow")
    submitted_red, submitted_white = count_submitted_feedback(submitted_key_row)

    if (submitted_red, submitted_white) != (correct_red, correct_white):
        emit("action_rejected", {"reason": "Feedback counts are wrong. Try again."}, to=request.sid)
        return


    game_state["keyBoard"][current_row] = submitted_key_row
    game_state["current_row"] -= 1 
    game_state["codeTurn"] = False

    if (correct_red == 4):
        emit("update_game", game_state, to=room)
        send_server_message(room, "Code Guesser won the game.")
        emit("game_over", to=room)
        return
    
    emit("update_game", game_state, to=room)


@socketio.on("chat_message")
def handle_chat_message(data):
    room = data.get("room")
    client_id = data.get("client_id")
    text = (data.get("text") or "").strip()

    if not room or room not in rooms or not text:
        return

    text = text[:200]  
    emit("chat_message", {"client_id": client_id, "text": text}, to=room)


def send_server_message(room, text):
    """Call this from other handlers (e.g. game_started, opponent_disconnected)."""
    emit("chat_message", {"client_id": None, "text": text}, to=room)




# main 
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000,debug=True)
    







    