const chessboard = document.querySelector('.chessboard');
const squares = [];
let boardState = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], 
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], 
];

let selectedSquare = null;
let possibleMoves = [];
let currentPlayer = 'white'; 

function createBoard() {
    chessboard.innerHTML = ''; 
    squares.length = 0; 

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = row;
            square.dataset.col = col;

            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            const piece = boardState[row][col];
            if (piece) {
                square.textContent = getChessPieceUnicode(piece);
            }

            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
            squares.push(square);
        }
    }
}

function getChessPieceUnicode(piece) {
    switch (piece) {
        case 'r': return '♖'; 
        case 'n': return '♘'; 
        case 'b': return '♗'; 
        case 'q': return '♕'; 
        case 'k': return '♔'; 
        case 'p': return '♙'; 
        case 'R': return '♜'; 
        case 'N': return '♞'; 
        case 'B': return '♝'; 
        case 'Q': return '♛'; 
        case 'K': return '♚'; 
        case 'P': return '♟'; 
        default: return '';
    }
}

function handleSquareClick(event) {
    const clickedSquare = event.target;
    const row = parseInt(clickedSquare.dataset.row);
    const col = parseInt(clickedSquare.dataset.col);
    const piece = boardState[row][col];

    
    if (selectedSquare && selectedSquare === clickedSquare) {
        deselectSquare();
        return;
    }

    
    if (!selectedSquare && piece && getPieceColor(piece) === currentPlayer) {
        selectSquare(clickedSquare);
    } else if (selectedSquare) {
       
        const targetRow = parseInt(clickedSquare.dataset.row);
        const targetCol = parseInt(clickedSquare.dataset.col);

        if (isValidMove(selectedSquare, targetRow, targetCol)) {
            movePiece(selectedSquare, clickedSquare);
        }
    }
}

function selectSquare(square) {
    deselectSquare(); 
    selectedSquare = square;
    selectedSquare.classList.add('selected');
    const row = parseInt(selectedSquare.dataset.row);
    const col = parseInt(selectedSquare.dataset.col);
    possibleMoves = getPossibleMoves(row, col);
    highlightPossibleMoves();
}

function deselectSquare() {
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
        removeHighlight();
        selectedSquare = null;
        possibleMoves = [];
    }
}

function highlightPossibleMoves() {
    removeHighlight();
    possibleMoves.forEach(move => {
        const square = squares.find(s => parseInt(s.dataset.row) === move.row && parseInt(s.dataset.col) === move.col);
        if (square) {
            square.classList.add('highlight');
        }
    });
}

function removeHighlight() {
    squares.forEach(square => {
        square.classList.remove('highlight');
    });
}

function getPieceColor(piece) {
    return piece === piece.toUpperCase() ? 'white' : 'black';
}

function isValidMove(startSquare, endRow, endCol) {
    const startRow = parseInt(startSquare.dataset.row);
    const startCol = parseInt(startSquare.dataset.col);
    const piece = boardState[startRow][startCol];

    return possibleMoves.some(move => move.row === endRow && move.col === endCol);
}

function movePiece(startSquare, endSquare) {
    const startRow = parseInt(startSquare.dataset.row);
    const startCol = parseInt(startSquare.dataset.col);
    const endRow = parseInt(endSquare.dataset.row);
    const endCol = parseInt(endSquare.dataset.col);

    boardState[endRow][endCol] = boardState[startRow][startCol];
    boardState[startRow][startCol] = null;

    deselectSquare();
    createBoard(); 
    switchPlayer();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    console.log(`Current player: ${currentPlayer}`);
}

function getPossibleMoves(row, col) {
    const piece = boardState[row][col];
    const color = getPieceColor(piece);
    const moves = [];

    if (!piece) return moves;

    switch (piece.toLowerCase()) {
        case 'p': 
            const direction = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;

            
            let newRow = row + direction;
            if (newRow >= 0 && newRow < 8 && !boardState[newRow][col]) {
                moves.push({ row: newRow, col: col });
                
                if (row === startRow && !boardState[newRow + direction]?.[col]) {
                    moves.push({ row: newRow + direction, col: col });
                }
            }
            
            [-1, 1].forEach(dCol => {
                let captureCol = col + dCol;
                if (captureCol >= 0 && captureCol < 8 && boardState[newRow]?.[captureCol] && getPieceColor(boardState[newRow][captureCol]) !== color) {
                    moves.push({ row: newRow, col: captureCol });
                }
            });
           
            break;
        case 'r': 
            const rookDirections = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
            for (const dir of rookDirections) {
                let currentRow = row + dir.dr;
                let currentCol = col + dir.dc;
                while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                    if (!boardState[currentRow][currentCol]) {
                        moves.push({ row: currentRow, col: currentCol });
                    } else {
                        if (getPieceColor(boardState[currentRow][currentCol]) !== color) {
                            moves.push({ row: currentRow, col: currentCol });
                        }
                        break; 
                    }
                    currentRow += dir.dr;
                    currentCol += dir.dc;
                }
            }
            break;
        case 'n': 
            const knightMoves = [
                { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
                { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
                { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
                { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
            ];
            for (const move of knightMoves) {
                const newRow = row + move.dr;
                const newCol = col + move.dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && (!boardState[newRow][newCol] || getPieceColor(boardState[newRow][newCol]) !== color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
            break;
        case 'b': 
            const bishopDirections = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
            for (const dir of bishopDirections) {
                let currentRow = row + dir.dr;
                let currentCol = col + dir.dc;
                while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                    if (!boardState[currentRow][currentCol]) {
                        moves.push({ row: currentRow, col: currentCol });
                    } else {
                        if (getPieceColor(boardState[currentRow][currentCol]) !== color) {
                            moves.push({ row: currentRow, col: currentCol });
                        }
                        break; 
                    }
                    currentRow += dir.dr;
                    currentCol += dir.dc;
                }
            }
            break;
        case 'q':
            const queenDirections = [
                { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }, 
                { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }  
            ];
            for (const dir of queenDirections) {
                let currentRow = row + dir.dr;
                let currentCol = col + dir.dc;
                while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                    if (!boardState[currentRow][currentCol]) {
                        moves.push({ row: currentRow, col: currentCol });
                    } else {
                        if (getPieceColor(boardState[currentRow][currentCol]) !== color) {
                            moves.push({ row: currentRow, col: currentCol });
                        }
                        break; 
                    }
                    currentRow += dir.dr;
                    currentCol += dir.dc;
                }
            }
            break;
        case 'k': 
            const kingMoves = [
                { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
                { dr: 0, dc: -1 },                     { dr: 0, dc: 1 },
                { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }
            ];
            for (const move of kingMoves) {
                const newRow = row + move.dr;
                const newCol = col + move.dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && (!boardState[newRow][newCol] || getPieceColor(boardState[newRow][newCol]) !== color)) {
                    
                    moves.push({ row: newRow, col: newCol });
                }
            }
           
            break;
    }

    return moves;
}


createBoard();