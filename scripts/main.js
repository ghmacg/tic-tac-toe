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

    const addToken = player => {
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
    /* Push into board 3 arrays with 3 cell spaces in each,
    ** to simulate the area we want for the game ex.
    **  [   
    **      [ {Cell}, {Cell}, {Cell} ],
    **      [ {Cell}, {Cell}, {Cell} ],
    **      [ {Cell}, {Cell}, {Cell} ]
    **  ]
    */
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        };
    };

    const getBoard = () => board; 

    const restartBoard = () => {
        board.forEach(row => {
            row.forEach(cell => {
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
    playerOneName = 'Player One',
    playerTwoName = 'Player Two'
) => {
    const board = Gameboard();
    const playerOne = Player(playerOneName, 'X');
    const playerTwo = Player(playerTwoName, 'O');
    
    const boardArray = board.getBoard();
    const players = [playerOne, playerTwo];
    let activePlayer = players[0];
    let isEnded = false;
    let isTied = false;
    let winner = undefined;

    const getIsEnded = () => isEnded;
    
    const getIsTied = () => isTied;
    
    const getWinner = () => winner;

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => activePlayer = activePlayer === players[0] ? players[1] : players[0];

    const restart = () => {
        board.restartBoard();
        activePlayer = players[0];
        isEnded = false;
        isTied = false;
        winner = undefined;
    };

    // Get cells where no player have played and make an array with each index, 
    // each index is composed of row index and column index
    const getEmptyCells = () => {
        let emptyCells = [];

        boardArray.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                let cellValue = cell.getValue();

                if (cellValue === '') emptyCells.push({
                    rowIndex: rowIndex, 
                    columnIndex: columnIndex,
                });
            });
        });

        return emptyCells;
    };

    /* Get the board values reordered in a simple array...
    **
    ** simple array ex. ['X', '', '', 'O', 'X', '', 'X', '', 'O']
    **
    ** original array with same values ex.
    **  [   
    **      [ {Cell.value = 'X'}, {Cell.value = ''}, {Cell.value = ''} ],
    **      [ {CellCell.value = 'O'}, {Cell.value = 'X'}, {CellCell.value = ''} ],
    **      [ {Cell.value = 'X'}, {CellCell.value = ''}, {CellCell.value = 'O'} ]
    **  ] 
    */
    const getBoardReordered = () => {
        let reorderedBoard = [];

        boardArray.forEach(row => {
            row.forEach(cell => {
                let cellValue = cell.getValue();

                reorderedBoard.push(cellValue);
            });
        });

        return reorderedBoard;
    };

    function winningMinimax (board, player) {
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

    // Minimax Algorithm 
    const minimax = (player) => {
        const playerOneToken = playerOne.getToken();
        const playerTwoToken = playerTwo.getToken();
        let availableCells = getEmptyCells();
        let reorderedBoard = getBoardReordered();
        let playerToken = player.getToken();

        // Checks for the terminal states such as win, lose, and tie and returns a value accordingly
        if (winningMinimax(reorderedBoard, playerOneToken)) {
            return {score: -10};
        } else if (winningMinimax(reorderedBoard, playerTwoToken)) {
            return {score: +10};
        } else if (availableCells.length === 0) {
            return {score: 0};
        };

        let moves = [];

        // Loop through available cells, 
        // create an object for each and store the index of that cell
        for (let i = 0; i < availableCells.length; i++) {
            let move = {};
            let row = availableCells[i].rowIndex;
            let column = availableCells[i].columnIndex;
            move.row = row;
            move.column = column;
            
            // Set the empty cell to the current player token
            board.dropToken(row, column, playerToken);

            // Collect the score resulted from calling minimax on the opponent of the current player
            if (player === playerTwo) {
                let result = minimax(playerOne);
                move.score = result.score;
            } else {
                let result = minimax(playerTwo);
                move.score = result.score;
            };

            // Reset the spot to empty
            board.dropToken(row, column, '');

            moves.push(move)
        };

        let bestMove;

        // If it is the AI's turn loop over the moves and choose the move with the highest score
        if (player === playerTwo) {
            let bestScore = -10000;

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                };
            };
        } else {
            // Else loop over the moves and choose the move with the lowest score
            let bestScore = 10000;

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                };
            };
        };
        
        // Return the chosen move object from the array to the higher depth
        return moves[bestMove];
    };

    const checkForWin = () => {
        // Vertical and diagonal combinations to win,
        // each number in each array corresponds to an index
        const combos = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 1, 2], [2, 1, 0]];
        let combosResults = [];

        const isPlayerToken = currentCell => currentCell.getValue() === activePlayer.getToken();
        
        // Take values of gameboard and order them as each combo
        combos.forEach(combo => {
            const reorderedValues = [];
            let row = 0;

            combo.forEach(index => {
                reorderedValues.push(boardArray[row][index]);
                row++;
            });
            
            combosResults.push(reorderedValues);
        });
        
        // Check if a player have won vertically or diagonally
        combosResults.forEach(reorderedValues => {
            if (reorderedValues.every(isPlayerToken)) {
                isEnded = true;
                winner = activePlayer.getName();
            };
        });

        // Check if a player have won horizontally
        boardArray.forEach(row => {
            if (row.every(isPlayerToken)) {
                isEnded = true;
                winner = activePlayer.getName();
            };
        });
    };

    const checkForTie = () => {
        let boardValues = [];

        const isToken = currentValue => currentValue === 'X' || currentValue === 'O';

        boardArray.forEach(row => {
            row.forEach(cell => {
                boardValues.push(cell.getValue());
            });
        });

        // Check if every space is a token
        if (boardValues.every(isToken)) isTied = true;
    };

    const playRound = (row, column) => {
        // Check if the value of the selected cell is already played
        if (boardArray[row][column].getValue() !== '') return;
        
        board.dropToken(row, column, activePlayer.getToken());

        checkForWin();
        if (!isEnded) checkForTie();
        if (isEnded || isTied) return;
        
        switchPlayerTurn();
        
        AI = minimax(activePlayer);
        row = AI.row;
        column = AI.column;
        board.dropToken(row, column, activePlayer.getToken());
        
        checkForWin();
        if (!isEnded) checkForTie();
        
        switchPlayerTurn();
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
    const game = GameController('Human', 'AI');

    const playerTurnDiv = document.getElementById('turn');
    const boardDiv = document.getElementById('board');
    const restartButton = document.getElementById('restart');

    const updateScreen = () => {
        boardDiv.textContent = '';

        const boardArray = game.getBoard();
        const activePlayer = game.getActivePlayer();
        const isEnded = game.getIsEnded();
        const isTied = game.getIsTied();
        const winner = game.getWinner();

        if (isEnded) {
            playerTurnDiv.textContent = `${winner} won!`;
        } else if (isTied) {
            playerTurnDiv.textContent = 'Tie!';
        } else {
            playerTurnDiv.textContent = `${activePlayer.getName()}'s turn...`;
        };

        boardArray.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                
                // Define datasets in each element to identify each cell easier
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;

                // Update the displayed value 
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard (e) {
        const isEnded = game.getIsEnded();
        const isTied = game.getIsTied();
        const activePlayer = game.getActivePlayer();
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        
        if (!selectedColumn && !selectedRow) return;
        if (isEnded || isTied) return;        
        if (activePlayer.getName() === 'AI') return;
        
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
