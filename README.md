# Mastermind

A two-player, online version of the board game. One player sets a secret code; the other has ten guesses to crack it.

**Play it live:** [henrynortonbower.com/mastermind](https://henrynortonbower.com/mastermind/)

## How to play

1. One player clicks **New game** to create a room and shares the 4-letter room code.
2. The other player clicks **Join game** and enters that code.
3. The host chooses whether they'll be the **code giver** or the **guesser**, then starts the game.
4. The code giver picks a secret code of 4 pegs from 8 colors and confirms it.
5. The guesser places 4 pegs in the current row and submits their guess.
6. The code giver answers with feedback pegs:
   - **Red**: right color in the right spot
   - **White**: right color in the wrong spot

   Feedback pegs can go in any order. The server checks the feedback, and if it's wrong, the code giver is asked to try again.
7. The guesser wins by getting 4 reds. The code giver wins if all 10 rows are used without the code being cracked.
8. When the game ends, the code is revealed to both players and the host can start a rematch.

## Features

- Real-time multiplayer over WebSockets (Socket.IO)
- Room codes for private two-player games
- Choice of code giver or guesser
- Server-side validation of guesses, codes, turns, and feedback
- The secret code is never sent to the guesser's browser until the game is over
- Game state survives page refreshes and dropped connections
- In-game chat
- Rematches in the same room

## Known limitations

- Game state is in memory only, so restarting the server ends all active games.
- Player identity is a client-generated ID stored in a cookie. There are no accounts or authentication.

## License

This project is licensed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE) for details.

Copyright (C) 2026 Henry Norton-Bower