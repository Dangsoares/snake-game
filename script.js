// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 8;
let frameCount = 0;

// DOM elements
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Pausar';
        gameLoop();
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Retomar' : 'Pausar';
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreDisplay.textContent = score;
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';
    frameCount = 0;
    draw();
}

function generateFood() {
    let newFood;
    let collision = true;
    
    while (collision) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        collision = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    return newFood;
}

function gameLoop() {
    frameCount++;
    
    if (frameCount % Math.round(30 / gameSpeed) === 0) {
        if (!gamePaused) {
            update();
        }
    }
    
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: (head.x + direction.x + tileCount) % tileCount,
        y: (head.y + direction.y + tileCount) % tileCount
    };
    
    // Check collision with self
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();
        gameSpeed = Math.min(gameSpeed + 0.1, 15);
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowColor = 'rgba(0, 204, 0, 0.3)';
            ctx.shadowBlur = 5;
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    ctx.shadowColor = 'transparent';
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
}

function gameOver() {
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        alert(`🎉 Novo Recorde! Você marcou ${score} pontos!`);
    } else {
        alert(`Game Over! Você marcou ${score} pontos.\nRecorde: ${highScore}`);
    }
}

// Initial draw
draw();
