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

export class Game {
    constructor(hostID, room, codeGiverID) {
        this.board = Array.from({ length: 10 }, () => new Array(4).fill(-1));
        this.keyBoard = Array.from({ length: 10 }, () => new Array(4).fill(-1));
        this.currentRow = -1;
        this.host = hostID;
        this.codeGiver = codeGiverID;
        this.code = null;
        this.room = room;
        this.codeTurn = true;
        this.gameOver = false;
        this.winner = null;
        this.codeIsSet = false;

    }

    /**
     * Sets the secret code 
     * @param {Array<number>} code a Array of integers which represents the code
     * @returns {void}
    */
    setCode(code) {
        this.code = code;
    }

    /**
     * Get the code
     * @returns {Array<number>}
    */
    getCode() {
        return this.code;
    }

    /**
     * Checks to see if the input clientId matches the game host.
     * @param {String} clientId a clientId
     * @returns {Boolean}
    */
    isHost(clientId) {
        return clientId === this.host;
    }

    /**
     * Sets the color value of a single peg on the board
     * @param {Number} row a row number 0-9
     * @param {Number} col a column number 0-3
     * @param {Number} color a color number 0-9
     * @returns {void}
    */
    setPeg(row, col, color) {
        this.board[row][col] = color;
    }

    setKey(row, num, color) {
        this.keyBoard[row][num] = color;
    }

    setCurrentRow(row) {
        this.currentRow = row; 
    }

    getCurrentRow() {
        return this.currentRow;
    }

    getRoom() {
        return this.room;
    }

    getBoard() {
        return this.board;
    }

    setBoard(board) {
        this.board = board;
    }

    getKeyBoard() {
        return this.keyBoard;
    }

    setKeyBoard(keyBoard) {
        this.keyBoard = keyBoard;
    }

    getCodeTurn() {
        return this.codeTurn;
    }

    setCodeTurn(turn) {
        this.codeTurn = turn;
    }

    /**
     * Checks to see if the input clientId matches the code giver.
     * @param {String} clientId a clientId
     * @returns {Boolean}
     */
    isCodeGiver(clientId) {
        return clientId === this.codeGiver;
    }

    getCodeGiver() {
        return this.codeGiver;
    }
    setGameOver(isOver) { 
        this.gameOver = isOver; 
    }

    getGameOver() { 
        return this.gameOver; 
    }

    setWinner(winner) { 
        this.winner = winner; 
    }

    getWinner() { 
        return this.winner; 
    }

    setCodeIsSet(value) { 
        this.codeIsSet = value; 
    }

    getCodeIsSet() { 
        return this.codeIsSet; 
    }
}