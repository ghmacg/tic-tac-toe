// Factory function to create player objects
const Player = (
    name,
    token
) => {
    const getName = () => name;

    const getToken = () => token;

    return {
        getName,
        getToken
    };
};


// Factory function to create the cell object for each space in the gameboard
const Cell = () => {
    let value = '';

    // Changes the cell value to the players token value
    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken,
        getValue
    };
};


// Logic of the gameboard
const Gameboard = () => {
    // Define varibles for the area of gameboard,
    // the area is going to be defined in board array
    const rows = 3;
    const columns = 3;
    const board = [];
    // Push into board 3 arrays with 3 cell spaces in each,
    // to simulate the area we want for the game
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        };
    };

    const getBoard = () => board; 

    const restartBoard = () => {
        board.forEach((row) => {
            row.forEach((cell) => {
                cell.addToken('');
            });
        });
    };

    // Assigns the token value of the player to the selected cell 
    const dropToken = (selectedRow, selectedColumn, player) => {
        board[selectedRow][selectedColumn].addToken(player);
    };

    return {
        getBoard, 
        dropToken, 
        restartBoard
    };
};


// Logic of the game
const GameController = (
    // If no names assigned these are the default names
    playerOneName = 'Player One',
    playerTwoName = 'Player Two'
) => {
    // Initialize Gameboard and Players objects
    const board = Gameboard();
    const playerOne = Player(playerOneName, 'X');
    const playerTwo = Player(playerTwoName, 'O');

    const players = [playerOne, playerTwo];
    let activePlayer = players[0];

    // Game info variables
    let isEnded = false;
    let isTied = false;
    let winner = undefined;

    // Switch the active player when current player finishes his turn  
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const getIsEnded = () => isEnded;
    
    const getIsTied = () => isTied;
    
    const getWinner = () => winner;

    const restart = () => {
        board.restartBoard();
        activePlayer = players[0];
        isEnded = false;
        isTied = false;
        winner = undefined;
    };

    const getEmptyCells = () => {
        let emptyCells = [];

        let i = 0;
        board.getBoard().forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.getValue() === '') emptyCells.push({
                    rowIndex: rowIndex, 
                    columnIndex: columnIndex,
                    emptyValue: cell.getValue()
                });

                i++;
            });
        });

        return emptyCells;
    };

    const getBoardReordered = () => {
        let reorderedBoard = [];

        board.getBoard().forEach((row) => {
            row.forEach((cell) => {
                reorderedBoard.push(cell.getValue());
            });
        });

        return reorderedBoard;
    };

    function winning (board, player) {
        if (
                (board[0] == player && board[1] == player && board[2] == player) ||
                (board[3] == player && board[4] == player && board[5] == player) ||
                (board[6] == player && board[7] == player && board[8] == player) ||
                (board[0] == player && board[3] == player && board[6] == player) ||
                (board[1] == player && board[4] == player && board[7] == player) ||
                (board[2] == player && board[5] == player && board[8] == player) ||
                (board[0] == player && board[4] == player && board[8] == player) ||
                (board[2] == player && board[4] == player && board[6] == player)
        ) {
            return true;
        } else {
            return false;
        };
    };

    const minimax = (player) => {
        let availableCells = getEmptyCells();
        let reorderedBoard = getBoardReordered();

        if (winning(reorderedBoard, playerOne.getToken())) {
            return {score: -10};
        } else if (winning(reorderedBoard, playerTwo.getToken())) {
            return {score: +10};
        } else if (availableCells.length === 0) {
            return {score: 0};
        };

        let moves = [];

        for (let i = 0; i < availableCells.length; i++) {
            let move = {};
            let row = availableCells[i].rowIndex;
            let column = availableCells[i].columnIndex;
            let emptyValue = availableCells[i].emptyValue;
            move.row = row;
            move.column = column;
            
            board.dropToken(row, column, player.getToken());

            if (player === playerTwo) {
                let result = minimax(playerOne);
                move.score = result.score;
            } else {
                let result = minimax(playerTwo);
                move.score = result.score;
            }

            board.dropToken(row, column, emptyValue);
            moves.push(move)
        };

        let bestMove;

        if (player === playerTwo) {
            let bestScore = -10000;

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                };
            };
        } else {
            let bestScore = 10000;

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                };
            };
        };
        
        return moves[bestMove];
    };

    const checkForWin = () => {
        // Vertical and diagonal combinations to win,
        // each number in each array corresponds to an index
        const combos = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 1, 2], [2, 1, 0]];
        let combosResults = [];

        const isPlayerToken = (currentCell) => currentCell.getValue() === activePlayer.getToken();
        
        // Take values of gameboard and order them as each combo
        combos.forEach((combo) => {
            const reorderedValues = [];
            let row = 0;

            combo.forEach((index) => {
                reorderedValues.push(board.getBoard()[row][index]);
                row++;
            });
            
            combosResults.push(reorderedValues);
        });
        
        // Check if a player have won vertically or diagonally
        combosResults.forEach((reorderedValues) => {
            if (reorderedValues.every(isPlayerToken)) {
                isEnded = true;
                winner = activePlayer.getName();
            };
        });

        // Check if a player have won horizontally
        board.getBoard().forEach((row) => {
            if (row.every(isPlayerToken)) {
                isEnded = true;
                winner = activePlayer.getName();
            };
        });
    };

    const checkForTie = () => {
        let boardValues = [];

        const isToken = (currentValue) => currentValue === 'X' || currentValue === 'O';

        // Take all values of gameboard, including blank spaces
        board.getBoard().forEach((row) => {
            row.forEach((cell) => {
                boardValues.push(cell.getValue());
            });
        });

        // Check if every space is a token
        if (boardValues.every(isToken)) isTied = true;
    };

    const playRound = (row, column) => {
        // First check if the value of the selected cell is already played
        if (board.getBoard()[row][column].getValue() !== '') return;
        
        // Make the selected cell take the value of players token
        board.dropToken(row, column, activePlayer.getToken());

        checkForWin();
        if (!isEnded) checkForTie();
        if (isEnded || isTied) return;
        
        switchPlayerTurn();
        
        AISelection = minimax(activePlayer);
        board.dropToken(AISelection.row, AISelection.column, activePlayer.getToken());
        
        checkForWin();
        if (!isEnded) checkForTie();
        
        switchPlayerTurn();
;
    };

    return {
        playRound,
        getActivePlayer,
        getWinner,
        getIsEnded,
        getIsTied,
        restart,
        getBoard: board.getBoard
    };
};


// Immediately Invoked Function that controls the display
const screenController = (() => {
    // Initialize the game with GameController
    const game = GameController('Human', 'AI');

    // Queries for the display
    const playerTurnDiv = document.getElementById('turn');
    const boardDiv = document.getElementById('board');
    const restartButton = document.getElementById('restart');

    const updateScreen = () => {
        // Reset the board div content
        boardDiv.textContent = '';

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Update turn div text depending on game status
        if (game.getIsEnded()) {
            playerTurnDiv.textContent = `${game.getWinner()} won!`;
        } else if (game.getIsTied()) {
            playerTurnDiv.textContent = 'Tie!';
        } else {
            playerTurnDiv.textContent = `${activePlayer.getName()}'s turn...`;
        }

        // Loop through each cell in the board array 
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                
                // Define datasets in each element to identify each cell easier
                cellButton.dataset.column = columnIndex;
                cellButton.dataset.row = rowIndex;
                // Update the displayed value 
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard (e) {
        // Get datasets values of the clicked cell 
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        // Check to make sure the cell is clicked and not the space in between 
        if (!selectedColumn && !selectedRow) return;

        if (game.getIsEnded() || game.getIsTied()) return;

        if (game.getActivePlayer().getName() === 'AI') return;
        
        // Call playround function with the selected cell and update the display
        game.playRound(selectedRow, selectedColumn);
        updateScreen();
    };

    function clickHandlerRestart () {
        game.restart();
        updateScreen();
    };

    boardDiv.addEventListener("click", clickHandlerBoard);

    restartButton.addEventListener('click', clickHandlerRestart);
    
    updateScreen();
})();
