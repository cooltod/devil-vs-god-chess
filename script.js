// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('chess-canvas') });

renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

// Chessboard setup
const boardSize = 8;
const squareSize = 1;

function createChessboard() {
    const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
    const materialWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const materialBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const material = (i + j) % 2 === 0 ? materialWhite : materialBlack;
            const square = new THREE.Mesh(geometry, material);
            square.position.x = i * squareSize - (boardSize * squareSize) / 2 + squareSize / 2;
            square.position.z = j * squareSize - (boardSize * squareSize) / 2 + squareSize / 2;
            scene.add(square);
        }
    }
}

createChessboard();

// Load 3D Models
const loader = new THREE.GLTFLoader();

// Load Devil King
loader.load('assets/devil-king.glb', (gltf) => {
    const devilKing = gltf.scene;
    devilKing.scale.set(0.5, 0.5, 0.5);
    devilKing.position.set(-3.5, 0.5, -3.5);
    scene.add(devilKing);
}, undefined, (error) => {
    console.error('Error loading Devil King:', error);
});

// Load God Queen
loader.load('assets/god-queen.glb', (gltf) => {
    const godQueen = gltf.scene;
    godQueen.scale.set(0.5, 0.5, 0.5);
    godQueen.position.set(3.5, 0.5, 3.5);
    scene.add(godQueen);
}, undefined, (error) => {
    console.error('Error loading God Queen:', error);
});

// Camera position
camera.position.y = 5;
camera.position.z = 10;
camera.lookAt(0, 0, 0);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Intro Screen Logic
document.getElementById('start-game').addEventListener('click', () => {
    document.getElementById('intro-screen').style.display = 'none';
});

// Abilities Logic
let mana = 100;

function useMana(cost) {
    if (mana >= cost) {
        mana -= cost;
        document.getElementById('mana-fill').style.width = `${mana}%`;
        return true;
    }
    alert("Not enough mana!");
    return false;
}

document.getElementById('healing-aura').addEventListener('click', () => {
    if (useMana(20)) {
        alert("Healing Aura activated!");
    }
});

document.getElementById('inferno').addEventListener('click', () => {
    if (useMana(30)) {
        alert("Inferno activated!");
    }
});
