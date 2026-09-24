// Copyright (C) 2026  Henry Norton-Bower
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { getClientId } from "./helper.js";

if (game_data.started) {
    window.location.replace(`/mastermind/game?room=${game_data.code}`);
}

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

const socket = io({ path: "/mastermind/socket.io/" });
const clientId = getClientId();
const roomCode = game_data.code;
const isHost = clientId == game_data.host;



document.cookie = `client_id=${clientId}; path=/`;

const startButton = document.getElementById("start");
const statusText = document.getElementById("status-text");
const playerCountEl = document.getElementById("player-count");
const copyButton = document.getElementById("copy-button");
const codeGiverCheckbox = document.getElementById("code-giver-checkbox");
const roleToggle = document.getElementById("role-toggle");
const backButton = document.getElementById("back-button");

if (isHost) {
    startButton.style.display = "inline-block";
    roleToggle.style.display = "inline-block";
    copyButton.style.display = "inline-block";
    startButton.addEventListener("click", () => {
        socket.emit("start_room", {
            client_id: clientId,
            room: roomCode,
            host_is_code_giver: codeGiverCheckbox.checked
        });
    });
}

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(roomCode);
        copyButton.textContent = "Copied!";
        setTimeout(() => { copyButton.textContent = "Copy"; }, 1500);
    } catch (err) {
        copyButton.textContent = "Copy failed";
        setTimeout(() => { copyButton.textContent = "Copy"; }, 1500);
    }
});

function updateStatus(count) {
    playerCountEl.textContent = count;

    if (count < 2) {
        statusText.textContent = "Waiting for another player…";
    } else {
        statusText.textContent = isHost ? "Ready." : "Waiting for host to start…";
    }

    if (isHost) {
        startButton.disabled = count < 2;
    }
}

// try to join automatically on page load
socket.emit("join_room", { room: roomCode, client_id: clientId });

socket.on("join_failed", (data) => {
    alert(data.error);
    window.location.href = "/mastermind/";
});

socket.on("room_update", (data) => {
    updateStatus(data.count);
});

socket.on("start_failed", (data) => {
    alert(data.error);
    if (data.error != "Need 2 players") {
        window.location.href = "/mastermind/";
    }
});

socket.on("game_started", (data) => {
    window.location.href = `/mastermind/game?room=${data.room}`;
});

socket.on("host_changed", (data) => {
    window.location.reload();
});


backButton.addEventListener("click", () => {
socket.emit("room_back_button", { room: roomCode, client_id: clientId }, (response) => {
    if (response && response.url) {
        window.location.href = response.url;
    }
});
});