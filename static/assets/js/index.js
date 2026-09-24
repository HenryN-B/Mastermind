// Copyright (C) 2026 Henry Norton-Bower
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

const socket = io({ path: "/mastermind/socket.io/" });

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

const clientId = getClientId();

document.cookie = `client_id=${clientId}; path=/`;

const createBtn = document.getElementById("create-button");
const joinBtn = document.getElementById("join-button");
const roomCodeInput = document.getElementById("room-code");
const backBtn = document.getElementById("Back");
const actions = document.getElementById("actions");
const joinPanel = document.getElementById("join-panel");
const joinConfirmBtn = document.getElementById("join-confirm-button");
const errorMessage = document.getElementById("error-message");

function join_button_event() {
    actions.style.display = "none";
    joinPanel.style.display = "block";
    roomCodeInput.focus();
}

function create_button_event() {
    socket.emit("create_room", { client_id: clientId });
}

function back_button_event() {
    joinPanel.style.display = "none";
    actions.style.display = "flex";
    clearError();
}

function submit_join_code() {
    const code = roomCodeInput.value.trim();
    if (!code) return;
    socket.emit("join_room", { room: code, client_id: clientId });
}

function showError(text) {
    errorMessage.textContent = text;
    errorMessage.style.display = "block";
}

function clearError() {
    errorMessage.style.display = "none";
}

joinBtn.addEventListener("click", join_button_event);
createBtn.addEventListener("click", create_button_event);
backBtn.addEventListener("click", back_button_event);
joinConfirmBtn.addEventListener("click", submit_join_code);

roomCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit_join_code();
});

socket.on("room_created", (data) => {
    window.location.href = data.url;
});

socket.on("join_success", (data) => {
    window.location.href = data.url;
});

socket.on("join_failed", (data) => {
    showError(data.error);
});