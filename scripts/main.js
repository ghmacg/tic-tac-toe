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

        boardArray.forEach(row => {
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
    const getReorderedBoard = () => {
        let reorderedBoard = [];

        boardArray.forEach(row => {
            row.forEach(cell => {
                let cellToken = cell.getToken();

                reorderedBoard.push(cellToken);
            });
        });

        return reorderedBoard;
    };

    function winning (board, playerToken) {
        if (
                (board[0] == playerToken && board[1] == playerToken && board[2] == playerToken) ||
                (board[3] == playerToken && board[4] == playerToken && board[5] == playerToken) ||
                (board[6] == playerToken && board[7] == playerToken && board[8] == playerToken) ||
                (board[0] == playerToken && board[3] == playerToken && board[6] == playerToken) ||
                (board[1] == playerToken && board[4] == playerToken && board[7] == playerToken) ||
                (board[2] == playerToken && board[5] == playerToken && board[8] == playerToken) ||
                (board[0] == playerToken && board[4] == playerToken && board[8] == playerToken) ||
                (board[2] == playerToken && board[4] == playerToken && board[6] == playerToken)
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
            isEnded = true;
            winner = playerName;
        };
    };

    const checkForTie = () => {
        let emptyCells = getEmptyCells();

        if (emptyCells.length === 0) isTied = true;
    };

    const playRound = (row, column) => {
        // Check if the value of the selected cell is already played
        if (boardArray[row][column].getToken() !== '') return;
        
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
        const activePlayerName = game.getActivePlayer().getName();
        const isEnded = game.getIsEnded();
        const isTied = game.getIsTied();
        const winner = game.getWinner();

        if (isEnded) {
            playerTurnDiv.textContent = `${winner} won!`;
        } else if (isTied) {
            playerTurnDiv.textContent = 'Tie!';
        } else {
            playerTurnDiv.textContent = `${activePlayerName}'s turn...`;
        };

        boardArray.forEach(row => {
            row.forEach(cell => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                
                // Define datasets in each element to identify each cell easier
                cellButton.dataset.row = cell.getRowIndex();
                cellButton.dataset.column = cell.getColumnIndex();

                // Update the displayed value 
                cellButton.textContent = cell.getToken();
                boardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard (e) {
        const isEnded = game.getIsEnded();
        const isTied = game.getIsTied();
        const activePlayerName = game.getActivePlayer().getName();
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        
        if (!selectedColumn && !selectedRow) return;
        if (isEnded || isTied) return;        
        if (activePlayerName === 'AI') return;
        
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
