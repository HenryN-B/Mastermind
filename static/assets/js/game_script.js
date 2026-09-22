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

import { Player } from "./player.js";
import { Game } from "./game.js";
import { getClientId } from "./helper.js";

const socket = io();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});



// Preload all colors
const colors = new Array(8);
for (let i = 0; i<8; i++) {
  colors[i] =  new Image();
  colors[i].src = `../static/assets/img/color-${i}.png`;
  colors[i].alt = "peg img";
}

// Preload all feedback pegs
const feedback_pegs = new Array(2);
for (let i = 0; i < 2; i++) {
  feedback_pegs[i] = new Image();
  feedback_pegs[i].src = `../static/assets/img/feedback-${i}.png`;
  feedback_pegs[i].alt = "peg img";
}

// Preload peg hole
const pegHole = new Image();
pegHole.src = `../static/assets/img/peg_hole.png`;
pegHole.alt = "peg img";

// find elements that need event listeners.
const all_pegs = document.getElementsByClassName("peg");
const unselect_color = document.getElementById("unselect-color");
const unselect_feedback = document.getElementById("unselect-feedback");
const all_keyholes = document.getElementsByClassName("key");
const all_colors = document.getElementsByClassName("color");
const all_feedback_pegs = document.getElementsByClassName("feedback-pegs");
const submitButton = document.getElementById("submit-button");
const peg_holder = document.getElementById("peg-holder");
const color_holder = document.getElementById("color-holder");
const feedback_holder = document.getElementById("feedback-holder");
const codePegs = document.getElementsByClassName("code-peg");
const codeHideButton = document.getElementById("code-hide-button");
const codeHolder = document.getElementById("code-holder");
const codeGiverDiv = document.getElementById("code-giver-div");
const codeConfirmButton = document.getElementById("code-confirm-button");
let codeIsHidden = false;


// Adding event listeners to all peg holes and places colors.
Array.from(all_pegs).forEach(function(hole) {
  hole.addEventListener("click", function(event) {
    const peg = event.currentTarget;
    const isCodePeg = peg.classList.contains("code-peg");
    const row = peg.closest(".row");


    if (!isCodePeg) {
        if (!player.isColorSelected() &&
            peg.classList.contains("filled") &&
            !player.getRole() &&
            row.classList.contains("current-row") & !game.getCodeTurn())     
        {

            const colorValue = Number(peg.querySelector('img').src.match(/color-(\d+)/)[1]);

            player.selectColor(colors[colorValue].cloneNode(true), colorValue, false, event.clientX, event.clientY);

            const new_peg = pegHole.cloneNode(true);
            peg.innerHTML = "";
            peg.classList.remove("filled");
            peg.appendChild(new_peg);

            let pegId = peg.id;
            game.setPeg(Number(pegId[5]), Number(pegId[8]), -1); // clear it in state too — see note below
            return;
        }

        if (row.classList.contains("current-row") &&
            !player.getRole() &&
            !game.getCodeTurn()) 
        {

            const color = player.getCurrentColor(); 
            const new_peg = colors[color].cloneNode(true);
            let pegId = peg.id;
            game.setPeg(Number(pegId[5]), Number(pegId[8]), color);
            peg.innerHTML = "";

            player.unSelectColor();

            peg.classList.add("filled");
            peg.appendChild(new_peg);

        }
    } else {
        const isLocked = peg.parentElement.classList.contains("locked");

        if (!isLocked &&
            !player.isColorSelected() &&
            peg.classList.contains("filled")) 
        {

            const color = Number(peg.querySelector('img').src.match(/color-(\d+)/)[1]);
            player.selectColor(colors[color].cloneNode(true), color, false, event.clientX, event.clientY);

            const new_peg = pegHole.cloneNode(true);
            peg.innerHTML = "";
            peg.classList.remove("filled");
            peg.appendChild(new_peg);

            const col = peg.id.split('-')[2].replace('col', ''); // grab col before resetting id
            peg.id = "code-peg-col" + col; // reset id to unfilled form
            return;
        }

        if (!isLocked && !codeIsHidden) {
            const color = player.getCurrentColor(); // already a number now
            const col = peg.id.split('-')[2].replace('col', '');
            const new_peg = colors[color].cloneNode(true);
            peg.innerHTML = "";

            player.unSelectColor();

            peg.classList.add("filled");
            peg.appendChild(new_peg);
            peg.id = "code-peg-col" + col + "-" + color;
        }
    }
  });
});

// Add all of the keyhole listeners
Array.from(all_keyholes).forEach(function(hole) {
    hole.addEventListener("click", function(event) {
        const key = event.currentTarget;
        const row = key.closest(".row");

        if (row.classList.contains("current-row") && game.getCodeTurn()) {

            if (!player.isFeedbackSelected() && key.classList.contains("filled")) {
                const feedback = Number(key.querySelector('img').src.match(/feedback-(\d+)/)[1]);
                player.selectColor(feedback_pegs[feedback].cloneNode(true), feedback, true, event.clientX, event.clientY);

                const new_peg = pegHole.cloneNode(true);
                key.innerHTML = "";
                key.classList.remove("filled");
                key.appendChild(new_peg);

                let keyId = key.id;
                game.setKey(Number(keyId[5]), Number(keyId[8]), -1);
                return;
            }

            if (player.isFeedbackSelected()) {
                const feedback = player.getCurrentColor();
                const new_peg = feedback_pegs[feedback].cloneNode(true);
                let keyId = key.id;
                game.setKey(Number(keyId[5]), Number(keyId[8]), feedback);
                key.innerHTML = "";
                key.classList.add("filled");
                key.appendChild(new_peg);
                player.unSelectColor();
            }
        }
    });
});

// Adding event listener to the unselect button to remove floating peg. 
unselect_color.addEventListener("click", function(event) {
  player.unSelectColor();
});

// Adding event listener to the unselect button to remove floating peg. 
unselect_feedback.addEventListener("click", function(event) {
  player.unSelectColor();
});


// Adding event listeners to the color select.
Array.from(all_colors).forEach(color => {
    color.addEventListener("click", function(event) {
        const colorValue = Number(event.currentTarget.id.split('-')[1]); 
        player.selectColor(colors[colorValue].cloneNode(true), colorValue, false, event.clientX, event.clientY);
    });
});

// Adding event listeners to the feedback select.
Array.from(all_feedback_pegs).forEach(feedback => {
    feedback.addEventListener("click", function(event) {
        const feedbackValue = Number(event.currentTarget.id.split('-')[1]); 
        player.selectColor(feedback_pegs[feedbackValue].cloneNode(true), feedbackValue, true, event.clientX, event.clientY);
    });
});

// Adding event listener to mouse move for floating peg. 
document.addEventListener("mousemove", function(event) {
  player.floatingPegMove(event);
});

// Adding event listener to submit button.
submitButton.addEventListener("click", (event) => {
    if (game.getCodeTurn()) {
        const keyRow = game.getKeyBoard()[game.getCurrentRow()];
        socket.emit("submit_feedback", {
            room: game.getRoom(),
            keyRow: keyRow,
            client_id: player.getClientID()
        });
    } else {
        const guess = game.getBoard()[game.getCurrentRow()];
        socket.emit("submit_guess", {
            room: game.getRoom(),
            guess: guess,
            client_id: player.getClientID() 
        });
    }
    player.unSelectColor();
});


codeHideButton.addEventListener("click", () => {
    codeIsHidden = !codeIsHidden;
    codeHolder.classList.toggle("hidden", codeIsHidden);
    codeHideButton.textContent = codeIsHidden ? "Show" : "Hide";
});



const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send-button");

function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit("chat_message", {
        room: game_data.room,
        client_id: player.getClientID(),
        text: text
    });

    chatInput.value = "";
}

chatSendButton.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendChatMessage()};
});

socket.on("chat_message", (data) => {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-message");

    if (data.client_id === null) {
        sendServerMessage(data.text, bubble);
        return;
    } else {
        if (data.client_id === player.getClientID()) {
            bubble.classList.add("own");
        }
        bubble.textContent = data.text;
    }

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function sendServerMessage(text, bubble) {
    bubble.classList.add("server");
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}




function setupCode() {
    const codeConfirmButton = document.getElementById("code-confirm-button");
    codeConfirmButton.addEventListener("click", (event) => {
        const code = extractCode(codePegs);
        player.unSelectColor();
        socket.emit("submit_code", {
            room: game.getRoom(),
            code: code,
            client_id: player.getClientID()
        });
    });
}

function buildCode(code) {
    Array.from(codePegs).forEach((peg, index) => {
        if ((code[index]) == -1) {
            peg.innerHTML = `<img src="../static/assets/img/peg_hole.png" alt="peg_hole">`;
            peg.classList.remove("filled");
        } else {
            const new_peg = colors[code[index]].cloneNode(true);
            peg.innerHTML = "";
            peg.classList.add("filled");
            peg.appendChild(new_peg);
        }
      });

}

// sync the code givers UI when updating.
function syncCodeGiverUI() {
    if (!game.isCodeGiver(player.getClientID())) return;
    const code = game.getCode();
    if(code) {
      buildCode(code);
    }


    codeGiverDiv.style.visibility = "visible";

    if (game.getCode()) {
        codeHolder.classList.add("locked");
        codeConfirmButton.style.display = "none";
        color_holder.style.display = "none";
        feedback_holder.style.display = "flex";
    } else {
        codeHolder.classList.remove("locked");
        codeConfirmButton.style.display = "flex";
        codeConfirmButton.style.display = "";
        peg_holder.style.visibility = "visible";
        color_holder.style.display = "flex";
    }
}

// extract the code from the html 
function extractCode(codePegs) {
    const code = new Array(4).fill(-1);
    Array.from(codePegs).forEach(peg => {
        let colPart = peg.id[12];
        let colorPart = peg.id[14];
        const col = parseInt(colPart, 10);
        const color = parseInt(colorPart, 10);
      if(!peg.classList.contains("filled")) {
        code[col] = -1;
      } else {
        code[col] = color;
      }
    });
    return code;
}

// Update the current row 
function updateCurrentRowUI() {
    document.querySelectorAll(".row.current-row").forEach(row => {
        row.classList.remove("current-row");
    });

    const row = document.getElementById(`row-${game.getCurrentRow()}`);
    if (row) row.classList.add("current-row");
}

function isTurn() {
    return player.getRole() === game.getCodeTurn();
}

function syncSubmitButtonUI() {
    const submitButton = document.getElementById("submit-button");
    if (game.getCodeIsSet()) {  
      submitButton.style.display = "flex";
    }

    if (isTurn()) {
        submitButton.textContent = "Submit";
        submitButton.disabled = false;
    } else {
        submitButton.textContent = "Waiting for other player...";
        submitButton.disabled = true;
    }
}


// Render the board.
function renderBoard() {
    const board = game.getBoard();
    const keys = game.getKeyBoard();

    board.forEach((rowColors, rowIndex) => {
        rowColors.forEach((color, colIndex) => {
            const peg = document.getElementById(`peg-r${rowIndex}-c${colIndex}`);

            if (color === -1) {
                peg.innerHTML = `<img src="../static/assets/img/peg_hole.png" alt="peg_hole">`;
                peg.classList.remove("filled");
            } else {
                const new_peg = colors[color].cloneNode(true);
                peg.innerHTML = "";
                peg.classList.add("filled");
                peg.appendChild(new_peg);
            }
        });
    });

    keys.forEach((rowFeedback, rowIndex) => {
        rowFeedback.forEach((feedback, numIndex) => {
            const key = document.getElementById(`key-r${rowIndex}-n${numIndex}`);

            if (feedback === -1) {
                key.innerHTML = `<img src="../static/assets/img/peg_hole.png" alt="peg_hole">`;
                key.classList.remove("filled");
            } else {
                const new_peg = feedback_pegs[feedback].cloneNode(true);
                key.innerHTML = "";
                key.classList.add("filled");
                key.appendChild(new_peg);
            }
        });
    });
}

// Sockets

socket.on("update_game", (state) => {
    console.log("update_game received:", state);
    if (state.board !== undefined) game.setBoard(state.board);
    if (state.keyBoard !== undefined) game.setKeyBoard(state.keyBoard);
    if (state.code !== undefined) game.setCode(state.code);
    if (state.current_row !== undefined) game.setCurrentRow(state.current_row);
    if (state.codeTurn !== undefined) game.setCodeTurn(state.codeTurn);
    if (state.gameOver !== undefined) game.setGameOver(state.gameOver);
    if (state.winner !== undefined) game.setWinner(state.winner);
    if (state.codeIsSet !== undefined) game.setCodeIsSet(state.codeIsSet);

    renderBoard();
    updateCurrentRowUI();
    syncCodeGiverUI();
    syncSubmitButtonUI();
    syncGameOverUI(); 
});

function syncGameOverUI() {
    if (!game.getGameOver()) return;
    codeGiverDiv.style.visibility = "visible";
    codeHideButton.style.visibility = "hidden";
    buildCode(game.getCode());

    freezeBoard();

    if (!document.querySelector(".game-over-banner")) {
       if(game.isHost(player.client_id)) {
            showGameOverBanner();
       }
    }
}

socket.on("action_rejected", (data) => {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-message", "server");
    sendServerMessage(data.reason, bubble);
});

socket.on("game_over", (data) => {
    game.setCode(data.code); 
    const iAmGuesser = !game.isCodeGiver(player.getClientID());
    const iWon = (data.winner === "guesser" && iAmGuesser) ||
                 (data.winner === "code_giver" && !iAmGuesser);

    freezeBoard();
    renderBoard(); 
    syncGameOverUI();
    let message = "";
    if (iAmGuesser) {
        message = iWon ? "You Cracked the Code!" : "You failed to crack the code in time.";
    } else {
        message = iWon ? "The Code Guesser failed to crack your code!" : "The Code Guesser cracked the code.";
    }
        
    const bubble = document.createElement("div");
    bubble.classList.add("chat-message", "server");

    sendServerMessage(message, bubble);
});

function freezeBoard() {
    document.getElementById("submit-button").style.display = "none";

    Array.from(all_pegs).forEach(peg => peg.style.pointerEvents = "none");
    Array.from(all_keyholes).forEach(key => key.style.pointerEvents = "none");
}

function showGameOverBanner() {
    const banner = document.createElement("div");
    const turnControls = document.getElementById("turn-controls");
    banner.className = "game-over-banner";

    banner.innerHTML = `
        <button id="play-again-button">Play again</button>
    `;
    turnControls.appendChild(banner);

    document.getElementById("play-again-button").addEventListener("click", () => {
        socket.emit("play_again", {
                room: game.getRoom(),
                client_id: player.getClientID()
    });
    });
}

socket.on("return_to_room", (data) => {
    window.location.href = data.url;
});

socket.on("player_left", (data) => {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-message", "server");
    sendServerMessage("Player has left the game",bubble);
    const banner = document.createElement("div");
    const turnControls = document.getElementById("turn-controls");
    banner.className = "leave-game-banner";

    banner.innerHTML = `
        <button id="leave-game-button">Leave Game</button>
    `;
    turnControls.appendChild(banner);

    document.getElementById("leave-game-banner").addEventListener("click", () => {
        window.location.href = "/";
    });

});


// Kinda main ig.
// Create player object.
let isClue = getClientId() == game_data.code_giver;
const player = new Player(isClue);
player.setClientID(getClientId());

socket.emit("join_room", { room: game_data.room, client_id: player.getClientID() });

const game = new Game(game_data.host, game_data.room, game_data.code_giver); // pass code_giver through

if (!game.isCodeGiver(player.getClientID())) { 
    peg_holder.style.visibility = "visible";
    color_holder.style.display = "flex";
}

if (game.isCodeGiver(player.getClientID())) { 
    syncCodeGiverUI();
    setupCode();
}