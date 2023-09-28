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

    // This changes the cell value to the players token value
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

    // Assigns the token value of the player to the selected cell 
    const dropToken = (selectedRow, selectedColumn, player) => {
        board[selectedRow][selectedColumn].addToken(player);
    };

    return {
        getBoard, 
        dropToken, 
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

    let gameEnded = false;

    // Used to switch the active player when current player finishes his turn  
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    
    const setGameEnded = (boolean) => gameEnded = boolean;

    const getGameEnded = () => gameEnded;

    const getActivePlayer = () => activePlayer;

    const checkForWin = (token) => {
        // Vertical and diagonal combinations to win,
        //each number in each array corresponds to an index
        const combos = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 1, 2], [2, 1, 0]];
        let combosResults = [];

        const isToken = (currentCell) => currentCell.getValue() === getActivePlayer().getToken();
        
        // Loop to take values of gameboard and order them as each combo
        combos.forEach((combo) => {
            const reorderedValues = [];
            let row = 0;

            combo.forEach((index) => {
                reorderedValues.push(board.getBoard()[row][index]);
                row++;
            });
            
            combosResults.push(reorderedValues);
        });
        
        // Loop to check if a player have won vertically or diagonally
        combosResults.forEach((reorderedValues) => {
            if (reorderedValues.every(isToken)) gameEnded = true;
        });

        // Loop to check if a player have won horizontally
        board.getBoard().forEach((row) => {
            if (row.every(isToken)) gameEnded = true;
        });
    };

    const playRound = (row, column) => {
        // First check if the value of the selected cell is already played, 
        // if it is stop the move
        if (board.getBoard()[row][column].getValue() !== '') return;
        
        // Make the selected cell take the value of players token
        board.dropToken(row, column, getActivePlayer().getToken());

        checkForWin();
        switchPlayerTurn();
    };

    return {
        playRound,
        getActivePlayer,
        getGameEnded,
        setGameEnded,
        getBoard: board.getBoard
    };
};


// Immediately Invoked Function that controls the display
const screenController = (() => {
    // Initialize the game with GameController
    const game = GameController();

    // Queries for the display
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');

    const updateScreen = () => {
        // Reset the board div content
        boardDiv.textContent = '';

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Update the current player display
        playerTurnDiv.textContent = `${activePlayer.getName()}'s turn...`;

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

    function clickHandlerBoard(e) {
        // Get datasets values of the clicked cell 
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        // Check to make sure the cell is clicked and not the space in between 
        if (!selectedColumn && !selectedRow) return;
        
        // Call playround function with the selected cell and update the display
        game.playRound(selectedRow, selectedColumn);
        updateScreen();
    };

    boardDiv.addEventListener("click", clickHandlerBoard);
    
    updateScreen();
})();
