import { Chess } from './chess.js';

// Initialize Chess Game
const chess = new Chess();

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('chess-canvas'), antialias: true });

renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
renderer.shadowMap.enabled = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Chessboard Setup
const boardSize = 8;
const squareSize = 1;
let selectedPiece = null;
const pieceModels = {
    'wK': null,
    'bQ': null
};

function createChessboard() {
    const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
    const materialWhite = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const materialBlack = new THREE.MeshStandardMaterial({ color: 0x222222 });

    for(let i = 0; i < boardSize; i++) {
        for(let j = 0; j < boardSize; j++) {
            const material = (i + j) % 2 === 0 ? materialWhite : materialBlack;
            const square = new THREE.Mesh(geometry, material);
            square.receiveShadow = true;
            square.position.set(
                i * squareSize - (boardSize * squareSize)/2 + squareSize/2,
                -0.05,
                j * squareSize - (boardSize * squareSize)/2 + squareSize/2
            );
            square.userData.position = {x: i, y: j};
            scene.add(square);
        }
    }
}

// Load 3D Models
const loader = new THREE.GLTFLoader();

async function loadPieceModel(path, type) {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.traverse(child => {
                if(child.isMesh) {
                    child.castShadow = true;
                }
            });
            model.scale.set(0.4, 0.4, 0.4);
            pieceModels[type] = model;
            scene.add(model);
            resolve(model);
        });
    });
}

// Initialize Game
async function initGame() {
    createChessboard();
    await loadPieceModel('assets/devil-king.glb', 'bQ');
    await loadPieceModel('assets/god-queen.glb', 'wK');
    updatePiecePositions();
}

// Update 3D Models Position
function updatePiecePositions() {
    chess.board().forEach((row, x) => {
        row.forEach((square, y) => {
            if(square) {
                const modelType = `${square.color}${square.type.toUpperCase()}`;
                if(pieceModels[modelType]) {
                    pieceModels[modelType].position.set(
                        x * squareSize - (boardSize * squareSize)/2 + squareSize/2,
                        0.5,
                        y * squareSize - (boardSize * squareSize)/2 + squareSize/2
                    );
                }
            }
        });
    });
}

// Camera Setup
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0);

// Raycaster for Piece Selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onCanvasClick(event) {
    mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if(intersects.length > 0) {
        const intersect = intersects[0];
        if(intersect.object.userData.position) {
            handleSquareClick(intersect.object.userData.position);
        }
    }
}

// Game Logic
function handleSquareClick(position) {
    const chessNotation = `${String.fromCharCode(97 + position.x)}${8 - position.y}`;
    
    if(selectedPiece) {
        const move = chess.move({
            from: selectedPiece,
            to: chessNotation,
            promotion: 'q'
        });
        
        if(move) {
            updatePiecePositions();
            checkGameState();
        }
        selectedPiece = null;
    } else {
        const piece = chess.get(chessNotation);
        if(piece && piece.color === chess.turn()) {
            selectedPiece = chessNotation;
        }
    }
}

function checkGameState() {
    if(chess.isGameOver()) {
        setTimeout(() => {
            alert(getGameResult());
            resetGame();
        }, 500);
    }
}

// Mana System
let mana = 100;

function useMana(cost) {
    if(mana >= cost) {
        mana -= cost;
        document.getElementById('mana-fill').style.width = `${mana}%`;
        return true;
    }
    alert("Not enough mana!");
    return false;
}

// Ability Effects
function activateHealingAura() {
    if(useMana(20)) {
        // Add healing effect logic
        console.log("Health restored!");
    }
}

// Event Listeners
document.getElementById('chess-canvas').addEventListener('click', onCanvasClick);
document.getElementById('healing-aura').addEventListener('click', activateHealingAura);
document.getElementById('reset-game').addEventListener('click', () => {
    chess.reset();
    updatePiecePositions();
    mana = 100;
    document.getElementById('mana-fill').style.width = '100%';
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start Game
initGame();
animate();
