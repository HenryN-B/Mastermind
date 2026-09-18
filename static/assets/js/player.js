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

export class Player {
    constructor(role) {
        this.is_code_giver = role; // Need to figure out how to send var here.
        this.selected_color = false;
        this.current_color = null;
        this.selected_feedback = false;
        this.floatingPeg = new Image();
        this.add_float_peg();
        this.client_id
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
     * Selects a color or feedback peg and shows it as a floating peg following the cursor.
     * @param {Image} img Copy of the color/feedback image element to show as the floating peg.
     * @param {number} value The color (0-7) or feedback (0-1) value being selected.
     * @param {boolean} isFeed Is the selected peg a feedback peg.
     * @param {number} clientX Cursor x position, for placing the floating peg.
     * @param {number} clientY Cursor y position, for placing the floating peg.
     * @returns {void}
     */
    selectColor(img, value, isFeed, clientX, clientY) {
    this.unSelectColor();

    if (isFeed) {
        this.selected_feedback = true;
    } else {
        this.selected_color = true;
    }

    this.current_color = value; // just the number now, not an id string
    this.floatingPeg.src = img.src;
    this.floatingPeg.style.display = "block";

    if (isFeed) {
        this.floatingPeg.classList.add("key-floating-peg");
    }

    this.floatingPeg.style.left = clientX + "px";
    this.floatingPeg.style.top = clientY + "px";
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
     * Sets the client id of the player 
     * @param {string} id Id of the client.
     * @returns {void}
    */
    setClientID(id) {
        this.client_id = id;
    }

    /**
     * Get the current color/feedback id
     * @returns {string}
    */
    getCurrentColor() {
        return this.current_color;
    }

    /**
     * Get the client id of a player
     * @returns {string}
    */
    getClientID() {
        return this.client_id;
    }


    /**
     * Gets selected_color
     * @returns {boolean}
    */
    isColorSelected() {
        return this.selected_color;
    }
    /**
     * Gets selected_feedback
     * @returns {boolean}
    */
    isFeedbackSelected() {
      return this.selected_feedback;
    }

    /**
     * Gets is_code_giver
     * @returns {boolean}
    */
    getRole() {
      return this.is_code_giver;
    }



}


