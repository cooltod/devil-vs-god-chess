import { Chess } from 'chess.js';

const chess = new Chess();

// Core Game Functions
export function resetGame() {
    chess.reset();
    return chess.board();
}

export function makeMove(from, to, promotion = 'q') {
    try {
        const move = chess.move({ from, to, promotion });
        return { success: true, move };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export function undoMove() {
    const move = chess.undo();
    return { success: !!move, move };
}

// Game State Functions
export function getBoardState() {
    return chess.board();
}

export function isGameOver() {
    return chess.isGameOver();
}

export function getGameResult() {
    if (chess.isCheckmate()) return 'checkmate';
    if (chess.isDraw()) return 'draw';
    return 'ongoing';
}

export function getTurn() {
    return chess.turn();
}

// Ability System
export function applyAbility(ability, target) {
    const piece = chess.get(target);
    if (!piece) return false;

    switch(ability) {
        case 'healing-aura':
            return true; // Placeholder
        case 'inferno':
            chess.remove(target);
            return true;
        default:
            return false;
    }
}
