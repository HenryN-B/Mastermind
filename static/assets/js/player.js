export class Player {
    constructor(role) {
        this.is_code_giver = role; // Need to figure out how to send var here.
        this.selected_color = false;
        this.current_color = null;
        this.selected_feedback = false;
        this.floatingPeg = new Image();
        this.add_float_peg();
    }

    /**
     * Creates the floating peg.
     * @returns {void}.
     */
    add_float_peg() {
        this.floatingPeg.className = "floating-peg";
        this.floatingPeg.style.display = "none";
        this.floatingPeg.style.position = "fixed";  
        this.floatingPeg.style.pointerEvents = "none";
        document.body.appendChild(this.floatingPeg);
        return;
    }

    /**
     * Selects color or feedback when player click one of the colors and reveals floating peg. 
     * @param {Image} img Copy of the HTMl color element.
     * @param {Event} e Click event.
     * @param {boolean} isFeed Is the selected peg a feedback peg.
     * @returns {void}.
     */
    selectColor(img, e, isFeed) {
        this.unSelectColor(); 
        if (isFeed) {
            this.selected_feedback = true;
        } else if (!isFeed) {
            this.selected_color = true;
        }
        this.current_color = e.target.id
        this.floatingPeg.src = img.src;
        this.floatingPeg.style.display = "block";
        if (isFeed) {
            this.floatingPeg.classList.add("key-floating-peg");
        }
        this.floatingPeg.style.left = e.clientX + "px";
        this.floatingPeg.style.top  = e.clientY + "px";
        return;
    }

    /**
     * unselects color and hides floating peg.
     * @returns {void}.
     */
    unSelectColor() {
        if(this.selected_color || this.selected_feedback) {
            this.floatingPeg.classList.remove("key-floating-peg");
            this.floatingPeg.style.display = "none";
            this.current_color = null;
            this.selected_feedback = false;
            this.selected_color = false;
        }
        return;
    }

    /**
     * Moves the floating peg if it is visible 
     * @param {Event} e Move event.
     * @returns {void}.
    */
    floatingPegMove(e) {
        if (this.selected_color || this.selected_feedback) {
            this.floatingPeg.style.left = e.clientX + "px";
            this.floatingPeg.style.top = e.clientY + "px";
        }
        return;
    }

    /**
     * Get the current color/feedback id
     * @returns {string}.
    */
    getCurrentColor() {
        return this.current_color;
    }

    /**
     * Gets selected_color
     * @returns {boolean}.
    */
    isColorSelected() {
        return this.selected_color;
    }
    /**
     * Gets selected_feedback
     * @returns {boolean}.
    */
    isFeedbackSelected() {
      return this.selected_feedback;
    }


}


