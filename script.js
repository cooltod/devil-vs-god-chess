import { resetGame, makeMove, undoMove, getBoardState, applyAbility, getTurn, getPieceAt } from './chess.js';

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('chess-canvas'), antialias: true });
const canvas = document.getElementById('chess-canvas');
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
camera.aspect = canvas.clientWidth / canvas.clientHeight;
camera.updateProjectionMatrix();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Game State
let selectedPiece = null;
let mana = 100;
const pieceMeshes = [];
const boardSize = 8;
const squareSize = 1;

// Initialize Board
function createBoard() {
    const boardGeometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
    
    for(let x = 0; x < boardSize; x++) {
        for(let z = 0; z < boardSize; z++) {
            const material = new THREE.MeshStandardMaterial({
                color: (x + z) % 2 === 0 ? 0xeeeeee : 0x222222
            });
            const square = new THREE.Mesh(boardGeometry, material);
            square.position.set(
                x * squareSize - (boardSize * squareSize)/2 + squareSize/2,
                -0.1,
                z * squareSize - (boardSize * squareSize)/2 + squareSize/2
            );
            square.userData.position = {x, z};
            scene.add(square);
        }
    }
}

// Load Pieces
const loader = new THREE.GLTFLoader();
const pieceModels = {
    'wK': null,
    'bQ': null
};

async function loadPieces() {
    pieceModels['wK'] = await loadModel('assets/god-queen.glb');
    pieceModels['bQ'] = await loadModel('assets/devil-king.glb');
    updatePieces();
}

function loadModel(path) {
    return new Promise(resolve => {
        loader.load(path, gltf => {
            const model = gltf.scene;
            model.scale.set(0.4, 0.4, 0.4);
            resolve(model);
        });
    });
}

// Update 3D Pieces
function updatePieces() {
    // Clear existing pieces
    pieceMeshes.forEach(mesh => scene.remove(mesh));
    pieceMeshes.length = 0;

    // Add new pieces
    getBoardState().forEach((row, x) => {
        row.forEach((square, z) => {
            if(square) {
                const model = pieceModels[`${square.color}${square.type.toUpperCase()}`].clone();
                model.position.set(
                    z * squareSize - (boardSize * squareSize)/2 + squareSize/2,
                    0.5,
                    x * squareSize - (boardSize * squareSize)/2 + squareSize/2
                );
                pieceMeshes.push(model);
                scene.add(model);
            }
        });
    });
}

// Interaction System
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.getElementById('chess-canvas').addEventListener('click', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if(intersects.length > 0) {
        const square = intersects[0].object.userData.position;
        handleSquareClick(square);
    }
});

function handleSquareClick(pos) {
    const square = `${String.fromCharCode(97 + pos.x)}${8 - pos.z}`;
    
    if(selectedPiece) {
        const result = makeMove(selectedPiece, square);
        if(result.success) {
            updatePieces();
            checkGameState();
        }
        selectedPiece = null;
    } else {
        const piece = getPieceAt(square);
        if(piece && piece.color === getTurn()) {
            selectedPiece = square;
        }
    }
}

// Game Logic
function checkGameState() {
    if(isGameOver()) {
        setTimeout(() => {
            alert(getGameResult());
            resetGame();
            updatePieces();
        }, 500);
    }
}

// Mana System
function updateManaDisplay() {
    document.getElementById('mana-fill').style.width = `${mana}%`;
}

document.getElementById('healing-aura').addEventListener('click', () => {
    if(mana >= 20) {
        mana -= 20;
        updateManaDisplay();
        applyAbility('healing-aura', 'e5'); // Example target
    }
});

// Initialize
createBoard();
loadPieces();
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('chess-canvas');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});
