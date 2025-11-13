const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Skor Elementleri
const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");

// Oyun Değişkenleri
let raccoon = {x: 50, y: 120, width: 60, height: 80, vy: 0, gravity: 1.2, jump: -20, isJumping: false}; 
let obstacles = [];
let score = 0;
let highScore = 0;
let gameSpeed = 5; // Başlangıç oyun hızı
let obstacleSpawnRate = 1800; 
let isGameOver = false;

// --- GÖRSEL VE EMOJİ TANIMLAMA ---
const RACCOON_EMOJI = "🦝"; 
const EMOJI_FONT_SIZE = "70px"; 

const humanImg = new Image();
humanImg.src = "human.png"; // human.png dosyasını buradan yüklemeye çalışıyor

const GROUND_LEVEL = canvas.height - raccoon.height;


// --- OYUN FONKSİYONLARI ---

function drawRaccoon() {
    ctx.font = EMOJI_FONT_SIZE + " sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(RACCOON_EMOJI, raccoon.x + raccoon.width / 2, raccoon.y + raccoon.height - 10); 
    ctx.textAlign = "left"; 
}

function drawObstacle(obstacle) {
    // humanImg.complete: Görselin yüklenmesi bitti mi?
    // humanImg.naturalHeight !== 0: Görsel doğru yüklendi mi?
    if (humanImg.complete && humanImg.naturalHeight !== 0) {
        // Görsel yüklendiyse onu çiz
        ctx.drawImage(humanImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
        // Yüklenmediyse (veya dosya adı hatası varsa) pembe blok kullan
        ctx.fillStyle = "#ff4081"; 
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function spawnObstacle() {
    if (isGameOver) return;
    const obstacleHeight = 50 + Math.random() * 20; 
    const obstacleWidth = 30 + Math.random() * 20; 
    obstacles.push({
        x: canvas.width, 
        y: canvas.height - obstacleHeight, 
        width: obstacleWidth, 
        height: obstacleHeight
    });
}

function updateGame() {
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Montserrat";
        ctx.textAlign = "center";
        ctx.fillText("OYUN BİTTİ! Yeniden Başlatmak İçin Tıkla", canvas.width / 2, canvas.height / 2);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "left"; 

    // 1. Rakun Hareketi
    raccoon.vy += raccoon.gravity;
    raccoon.y += raccoon.vy;
    
    if (raccoon.y >= GROUND_LEVEL) {
        raccoon.y = GROUND_LEVEL;
        raccoon.isJumping = false;
        raccoon.vy = 0;
    }

    drawRaccoon();

    // 2. Engeller ve Çarpışma Kontrolü
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed; 

        // Çarpışma Kontrolü
        if (raccoon.x < obstacles[i].x + obstacles[i].width &&
            raccoon.x + raccoon.width > obstacles[i].x &&
            raccoon.y < obstacles[i].y + obstacles[i].height &&
            raccoon.y + raccoon.height > obstacles[i].y) 
        {
            isGameOver = true;
            gameOver();
            return; 
        }

        // Engel Ekrandan Çıktı (Puan Kazanma ve Hız Artışı)
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            scoreDisplay.textContent = `Skor: ${score}`; 
            
            // HIZ ARTIŞI BURADA!
            gameSpeed += 0.2; 
            obstacleSpawnRate = Math.max(800, obstacleSpawnRate - 50); 
            
            i--; 
        } else {
            drawObstacle(obstacles[i]);
        }
    }

    // Zemin Çizgisi
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    requestAnimationFrame(updateGame);
}

function jump() {
    if (!raccoon.isJumping && !isGameOver) {
        raccoon.isJumping = true;
        raccoon.vy = raccoon.jump;
    }
}

function gameOver() {
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `Rekor: ${highScore}`;
    }
    gameSpeed = 5; 
    clearInterval(obstacleInterval); 
}

function resetGame() {
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = `Skor: 0`;
    obstacles = [];
    raccoon.y = GROUND_LEVEL;
    raccoon.isJumping = false;
    gameSpeed = 5; 
    obstacleSpawnRate = 1800; 
    
    obstacleInterval = setInterval(spawnObstacle, obstacleSpawnRate);
    
    requestAnimationFrame(updateGame);
}

// --- OLAY DİNLEYİCİLERİ ---
canvas.addEventListener("mousedown", () => {
    if (isGameOver) {
        resetGame();
    } else {
        jump();
    }
}); 
document.addEventListener("keydown", (e) => { 
    if (e.code === "Space") {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
        e.preventDefault(); 
    }
});

let obstacleInterval = setInterval(spawnObstacle, obstacleSpawnRate);

requestAnimationFrame(updateGame);