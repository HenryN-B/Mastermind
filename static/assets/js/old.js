//load imgs 
const colors = new Array(8);
for (let i = 0; i<8; i++) {
  colors[i] =  new Image();
  colors[i].src = `../static/assets/img/color-${i}.png`;
  colors[i].alt = "peg img";
}

const feedback_pegs = new Array(2);
for (let i = 0; i < 2; i++) {
  feedback_pegs[i] = new Image();
  feedback_pegs[i].src = `../static/assets/img/feedback-${i}.png`;
  feedback_pegs[i].alt = "peg img";
}


var current_color = null;

const all_pegs = document.getElementsByClassName("peg");
const all_keys = document.getElementsByClassName("key");
const all_colors = document.getElementsByClassName("color");
const all_feedback_pegs = document.getElementsByClassName("feedback-pegs");


Array.from(all_pegs).forEach(function(peg) {
    peg.addEventListener("click", function(event) {
        peg_id = event.target.id;
        peg = document.getElementById(peg_id);
        if(current_color) {
          const new_peg = colors[current_color].cloneNode(true);
          peg.innerHTML = ""; 
          peg.classList.add("filled");
          peg.appendChild(new_peg);
        }
    });
});


Array.from(all_keys).forEach(function(key) {
    key.addEventListener("click", function(event) {
        key_id = event.target.id;
        key = document.getElementById(key_id);
        const new_key = document.createElement("img");
        new_key.src = "../static/assets/img/smallwhiteball.png";
        new_key.alt = "white key";
        key.innerHTML = ""; 
        key.classList.add("filled");
        key.appendChild(new_key);
        
    });
});


let floatingPeg = null;

Array.from(all_colors).forEach(color => {
  color.addEventListener("click", function(event) {
    const color_id = event.currentTarget.id;
    if (color_id == "Unselct") {
      document.body.removeChild(floatingPeg);
      current_color = null;
      floatingPeg = null;
      return;
    }
    current_color = color_id[6];
    //document.body.classList.add("custom-cursor");

    if (!floatingPeg) {
      floatingPeg = colors[current_color].cloneNode(true);
      floatingPeg.className = "floating-peg";
      floatingPeg.style.position = "fixed";  
      floatingPeg.style.pointerEvents = "none";
      document.body.appendChild(floatingPeg);
    }

    floatingPeg.src = `../static/assets/img/${color_id}.png`;
    floatingPeg.classList.remove("hidden_peg");

    floatingPeg.style.left = event.clientX + "px";
    floatingPeg.style.top  = event.clientY + "px";
  });
});

document.addEventListener("mousemove", function(e) {
  if (floatingPeg) {
    floatingPeg.style.left = e.clientX + "px";
    floatingPeg.style.top = e.clientY + "px";
  }
});

Array.from(all_feedback_pegs).forEach(feedback => {
    feedback.addEventListener("click", function(event) {
    const feedback_id = event.currentTarget.id;
    current_color = null;
    floatingPeg = false;
    if (feedback_id == "Unselct") {
      document.body.style.cursor = 'auto';
      document.body.removeChild(floatingPeg);
      current_feedback = null;
      floatingPeg = null;
      floatingPeg.classList.remove("key-floating-peg");
      return;
    }
      console.log(feedback_id);
      current_feedback = feedback_id[9];

    if (!floatingPeg) {
      console.log(current_feedback);
      floatingPeg = feedback_pegs[current_feedback].cloneNode(true);
      floatingPeg.className = "floating-peg";
      floatingPeg.style.position = "fixed";   
      floatingPeg.style.pointerEvents = "none";
      floatingPeg.classList.add("key-floating-peg");
      document.body.appendChild(floatingPeg);
    }

    floatingPeg.src = `../static/assets/img/feedback-${current_feedback}.png`;
    floatingPeg.classList.remove("hidden_peg");
    floatingPeg.style.left = event.clientX + "px";
    floatingPeg.style.top  = event.clientY + "px";
  });
});





