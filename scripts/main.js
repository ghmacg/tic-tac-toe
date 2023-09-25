// Factory fucntion to create player objects
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

    // Used to switch the active player when current player finishes his turn  
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        // First check if the value of the selected cell is already played, 
        // if it is stop the move
        if (board.getBoard()[row][column].getValue() !== '') return;
        
        // Make the selected cell take the value of players token
        board.dropToken(row, column, getActivePlayer().getToken());

        /*  This is where we would check for a winner and handle that logic,
        such as a win message. */

        switchPlayerTurn();
    };

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
};


