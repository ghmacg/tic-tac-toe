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
const Cell = (row, column) => {
    let value = '';
    let rowIndex = row;
    let columnIndex = column;

    const addToken = player => {
        value = player;
    };

    const getToken = () => value;

    const getRowIndex = () => rowIndex;

    const getColumnIndex = () => columnIndex;

    return {
        addToken,
        getToken,
        getRowIndex,
        getColumnIndex
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
    for (let row = 0; row < rows; row++) {
        board[row] = [];
        for (let column = 0; column < columns; column++) {
            board[row].push(Cell(row, column));
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
    
    const originalBoard = board.getBoard();
    const players = [playerOne, playerTwo];
    let activePlayer = players[0];
    let isEnded = false;
    let isDraw = false;
    let winner = undefined;
    let winningCells = [];

    const getIsEnded = () => isEnded;
    
    const getIsDraw = () => isDraw;
    
    const getWinner = () => winner;

    const getWinningCells = () => winningCells;

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => activePlayer = activePlayer === players[0] ? players[1] : players[0];

    const restart = () => {
        board.restartBoard();
        activePlayer = players[0];
        isEnded = false;
        isDraw = false;
        winner = undefined;
        winningCells = [];
    };

    // Get cells where no player have played and make an array with each index, 
    // each index is composed of row index and column index
    const getEmptyCells = () => {
        let emptyCells = [];

        originalBoard.forEach(row => {
            row.forEach(cell => {
                let cellToken = cell.getToken();

                if (cellToken === '') emptyCells.push({
                    rowIndex: cell.getRowIndex(), 
                    columnIndex: cell.getColumnIndex(),
                });
            });
        });

        return emptyCells;
    };

    /* Get the board cell objects reordered in a simple array...
    **
    ** simple array ex. [{Cell}, {Cell}, {Cell}, {Cell}, {Cell}, {Cell}, {Cell}, {Cell}, {Cell}]
    **
    ** original array with ex.
    **  [   
    **      [ {Cell}, {Cell}, {Cell} ],
    **      [ {Cell}, {Cell}, {Cell} ],
    **      [ {Cell}, {Cell}, {Cell} ]
    **  ] 
    */
    const getReorderedBoard = () => {
        let reorderedBoard = [];

        originalBoard.forEach(row => {
            row.forEach(cell => {
                reorderedBoard.push(cell);
            });
        });

        return reorderedBoard;
    };

    function winning (reorderedBoard, playerToken) {
        let tokensBoard = [];

        reorderedBoard.forEach(cell => {
            let cellToken = cell.getToken();
            tokensBoard.push(cellToken);
        });

        if (
                ((tokensBoard[0] == playerToken) && (tokensBoard[1] == playerToken) && (tokensBoard[2] == playerToken)) ||
                ((tokensBoard[3] == playerToken) && (tokensBoard[4] == playerToken) && (tokensBoard[5] == playerToken)) ||
                ((tokensBoard[6] == playerToken) && (tokensBoard[7] == playerToken) && (tokensBoard[8] == playerToken)) ||
                ((tokensBoard[0] == playerToken) && (tokensBoard[3] == playerToken) && (tokensBoard[6] == playerToken)) ||
                ((tokensBoard[1] == playerToken) && (tokensBoard[4] == playerToken) && (tokensBoard[7] == playerToken)) ||
                ((tokensBoard[2] == playerToken) && (tokensBoard[5] == playerToken) && (tokensBoard[8] == playerToken)) ||
                ((tokensBoard[0] == playerToken) && (tokensBoard[4] == playerToken) && (tokensBoard[8] == playerToken)) ||
                ((tokensBoard[2] == playerToken) && (tokensBoard[4] == playerToken) && (tokensBoard[6] == playerToken))
        ) {
            return true;
        } else {
            return false;
        };
    };

    const setWinningCells = () => {
        const combos = [
            [originalBoard[0][0], originalBoard[0][1], originalBoard[0][2]],
            [originalBoard[1][0], originalBoard[1][1], originalBoard[1][2]],
            [originalBoard[2][0], originalBoard[2][1], originalBoard[2][2]],
            [originalBoard[0][0], originalBoard[1][0], originalBoard[2][0]],
            [originalBoard[0][1], originalBoard[1][1], originalBoard[2][1]],
            [originalBoard[0][2], originalBoard[1][2], originalBoard[2][2]],
            [originalBoard[0][0], originalBoard[1][1], originalBoard[2][2]],
            [originalBoard[0][2], originalBoard[1][1], originalBoard[2][0]]
        ];
        
        const isTrue = currentCell => currentCell.getToken() == activePlayer.getToken();
        
        combos.forEach(combo => {
            if(combo.every(isTrue)) {
                combo.forEach(cell => {
                    winningCells.push(cell);
                });
            };
        });
    };

    // Minimax Algorithm 
    const minimax = (player) => {
        const playerOneToken = playerOne.getToken();
        const playerTwoToken = playerTwo.getToken();
        let availableCells = getEmptyCells();
        let reorderedBoard = getReorderedBoard();
        let playerToken = player.getToken();

        // Checks for the terminal states such as win, lose, and tie and returns a value accordingly
        if (winning(reorderedBoard, playerOneToken)) {
            return {score: -10};
        } else if (winning(reorderedBoard, playerTwoToken)) {
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
        const reorderedBoard = getReorderedBoard();
        const playerToken = activePlayer.getToken();
        const playerName = activePlayer.getName();

        if (winning(reorderedBoard, playerToken)) {
            setWinningCells();
            isEnded = true;
            winner = playerName;
        };
    };

    const checkForDraw = () => {
        let emptyCells = getEmptyCells();

        if (emptyCells.length === 0) isDraw = true;
    };

    const playRound = (row, column) => {
        // Check if the value of the selected cell is already played
        if (originalBoard[row][column].getToken() !== '') return;
        
        board.dropToken(row, column, activePlayer.getToken());

        checkForWin();
        if (!isEnded) checkForDraw();
        if (isEnded || isDraw) return;
        
        switchPlayerTurn();
        
        AI = minimax(activePlayer);
        row = AI.row;
        column = AI.column;
        board.dropToken(row, column, activePlayer.getToken());
        
        checkForWin();
        if (!isEnded) checkForDraw();
        
        switchPlayerTurn();
    };

    return {
        playRound,
        getActivePlayer,
        getWinner,
        getIsEnded,
        getIsDraw,
        getWinningCells,
        restart,
        getBoard: board.getBoard
    };
};


// Immediately Invoked Function that controls the display
const screenController = (() => {
    const playerOne = 'Human';
    const playerTwo = 'AI';
    const game = GameController(playerOne, playerTwo);

    const playerTurnDiv = document.getElementById('turn');
    const boardDiv = document.getElementById('board');
    const restartButton = document.getElementById('restart');

    const updateScreen = () => {
        boardDiv.textContent = '';

        const originalBoard = game.getBoard();
        const activePlayer = game.getActivePlayer().getName();
        const isEnded = game.getIsEnded();
        const isDraw = game.getIsDraw();
        const winner = game.getWinner();

        if (isEnded) {
            playerTurnDiv.textContent = `${winner} won!`;
        } else if (isDraw) {
            playerTurnDiv.textContent = 'Draw!';
        } else {
            playerTurnDiv.textContent = `${activePlayer}'s turn...`;
        };

        originalBoard.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");

                if (isEnded) {
                    const winningCells = game.getWinningCells();
                    
                    for (let i = 0; i < winningCells.length; i++) {
                        let possibleRowIndex = winningCells[i].getRowIndex();
                        let possibleColumnIndex = winningCells[i].getColumnIndex();

                        if (
                            (winner === playerOne) && 
                            (possibleRowIndex === rowIndex) && 
                            (possibleColumnIndex === columnIndex)
                        ) {
                            cellButton.classList.add('player-one-win');
                        } else if (
                            (winner === playerTwo) && 
                            (possibleRowIndex === rowIndex) && 
                            (possibleColumnIndex === columnIndex)
                        ) {
                            cellButton.classList.add('player-two-win');
                        }
                    }
                } else if (isDraw) {
                    cellButton.classList.add('draw');
                };
                
                // Define datasets in each element to identify each cell easier
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;

                // Update the displayed value 
                cellButton.textContent = cell.getToken();
                boardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard (e) {
        const isEnded = game.getIsEnded();
        const isDraw = game.getIsDraw();
        const activePlayer = game.getActivePlayer().getName();
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        
        if (!selectedColumn && !selectedRow) return;
        if (isEnded || isDraw) return;        
        if (activePlayer === playerTwo) return;
        
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
