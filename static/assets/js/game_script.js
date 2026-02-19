import { Player } from "./player.js";
import { Game } from "./game.js";

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

// find elements that need event listeners.
const all_pegs = document.getElementsByClassName("peg");
const unselect_color = document.getElementById("unselect-color");
const unselect_feedback = document.getElementById("unselect-feedback");
const all_keyholes = document.getElementsByClassName("key");
const all_colors = document.getElementsByClassName("color");
const all_feedback_pegs = document.getElementsByClassName("feedback-pegs");

// Adding event listeners to all peg holes and places colors.
Array.from(all_pegs).forEach(function(hole) {
  hole.addEventListener("click", function(event) {
    const peg = event.currentTarget;
    if (player.isColorSelected()) {
      const color = player.getCurrentColor();
      const new_peg = colors[color[6]].cloneNode(true);
      peg.innerHTML = ""; 
      peg.classList.add("filled");
      peg.appendChild(new_peg);
    }
  });
});

Array.from(all_keyholes).forEach(function(key) {
    key.addEventListener("click", function(event) {
        const key = event.currentTarget;
        if (player.isFeedbackSelected()) {
          const feedback = player.getCurrentColor();
          const new_peg = feedback_pegs[feedback[9]].cloneNode(true);
          key.innerHTML = ""; 
          key.classList.add("filled");
          key.appendChild(new_peg);
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
    const color_id = event.currentTarget.id;
    player.selectColor(colors[color_id[6]].cloneNode(true), event, false);    
  });
});

// Adding event listeners to the feedback select.
Array.from(all_feedback_pegs).forEach(feedback => {
    feedback.addEventListener("click", function(event) {
    const feedback_id = event.currentTarget.id;
    player.selectColor(feedback_pegs[feedback_id[9]].cloneNode(true), event, true);  
  });
});

// Adding event listener to mouse move for floating peg. 
document.addEventListener("mousemove", function(event) {
  player.floatingPegMove(event);
});

// Kinda main ig.

// Create player object.
const player = new Player();
const game = new Game();
