const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 7;

let player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: -5,
    dy: -5,
    radius: ballSize,
    speed: 5
};

let scores = {
    player: 0,
    computer: 0
};

let gameActive = false;
let keys = {};

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    gameActive = true;
    resetBall();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    scores.player = 0;
    scores.computer = 0;
    gameActive = false;
    resetBall();
    updateScore();
    draw();
});

// Update Functions
function updatePlayerPaddle() {
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    } else if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Clamp ball position to prevent getting stuck
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        } else {
            ball.y = canvas.height - ball.radius;
        }
    }

    // Paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        // Add spin based on where ball hits paddle
        ball.dy += (ball.y - (player.y + player.height / 2)) * 0.1;
    }

    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        // Add spin based on where ball hits paddle
        ball.dy += (ball.y - (computer.y + computer.height / 2)) * 0.1;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        scores.computer++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        scores.player++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

function updateScore() {
    document.getElementById('playerScore').textContent = scores.player;
    document.getElementById('computerScore').textContent = scores.computer;
}

// Draw Functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();

    // Draw game status
    if (!gameActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press START GAME to begin', canvas.width / 2, canvas.height / 2);
    }
}

// Game Loop
function gameLoop() {
    if (gameActive) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
gameLoop();
