// --- ELEMENTOS DO DOM ---
const mainMenu = document.getElementById('mainMenu');
const gameScreen = document.getElementById('gameScreen');
const shopScreen = document.getElementById('shopScreen');

const startGameBtn = document.getElementById('startGameBtn');
const openShopBtn = document.getElementById('openShopBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const dino = document.getElementById('dino');
const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('gameOverMessage');
const coinDisplay = document.getElementById('coinCount');
const shopCoinDisplay = document.getElementById('shopCoinCount');
const skinContainer = document.getElementById('skinContainer');

// --- DADOS DAS SKINS ---
const SKINS = [
    { id: 'default', name: 'Padrão', price: 0, cssClass: '' },
    { id: 'red', name: 'Vermelho', price: 100, cssClass: 'dino-red' },
    { id: 'blue', name: 'Azul', price: 250, cssClass: 'dino-blue' },
    { id: 'zombie', name: 'Zumbi', price: 500, cssClass: 'dino-zombie' },
];

// --- VARIÁVEIS DE JOGO ---
const insults = [ "Você é mais lento que uma tartaruga com preguiça!", "Até um dinossauro extinto faria melhor que você!", "Foi isso? Achei que era mais difícil!", "Parece que seu cérebro está no modo avião!", "Cadê a coordenação? Sumiu junto com os dinossauros!", "Acho que o dinossauro não é o único que está morto aqui...", "Jogando assim, até o T-Rex te pega!", "Mais devagar que sinal de trânsito na madrugada!", "Se fosse um obstáculo, você já teria desistido!", "Pule melhor, ou vire comida de dinossauro!" ];

let isJumping = false;
let position = 0;
let score = 0;
let gameOver = false;
let obstacles = [];
let activeCoins = [];
let speed = 8;
let lastSpeedIncreaseTime = Date.now();
const speedIncreaseInterval = 1000;
const speedIncrement = 0.3;
let jumpPressStart = 0;
let gameLoopInterval; // Para controlar o loop de criação

// --- DADOS DO JOGADOR (CARREGADOS DO LOCALSTORAGE) ---
let record = Number(localStorage.getItem('dinoRecord') || 0);
let coins = Number(localStorage.getItem('dinoCoins') || 0);
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '["default"]');
let equippedSkin = localStorage.getItem('equippedSkin') || 'default';

// --- GERENCIAMENTO DE TELAS ---
function showScreen(screenName) {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    
    if (screenName === 'menu') mainMenu.style.display = 'block';
    if (screenName === 'game') gameScreen.style.display = 'block';
    if (screenName === 'shop') shopScreen.style.display = 'block';
}

// --- LÓGICA DA LOJA ---
function renderShop() {
    skinContainer.innerHTML = '';
    shopCoinDisplay.textContent = coins;

    SKINS.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const isEquipped = equippedSkin === skin.id;

        const skinCard = document.createElement('div');
        skinCard.className = 'skin-card';

        const preview = document.createElement('div');
        preview.className = 'skin-preview';
        if(skin.cssClass) preview.classList.add(skin.cssClass);

        const name = document.createElement('h3');
        name.textContent = skin.name;

        const button = document.createElement('button');
        button.className = 'skin-btn';

        if (isEquipped) {
            button.textContent = 'Equipado';
            button.classList.add('equipped');
            button.disabled = true;
        } else if (isOwned) {
            button.textContent = 'Equipar';
            button.classList.add('equip');
            button.onclick = () => equipSkin(skin.id);
        } else {
            button.textContent = `Comprar (${skin.price})`;
            button.classList.add('buy');
            if (coins < skin.price) button.disabled = true;
            button.onclick = () => buySkin(skin.id);
        }

        skinCard.appendChild(preview);
        skinCard.appendChild(name);
        skinCard.appendChild(button);
        skinContainer.appendChild(skinCard);
    });
}

function buySkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && coins >= skin.price) {
        coins -= skin.price;
        ownedSkins.push(skin.id);
        
        localStorage.setItem('dinoCoins', coins);
        localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
        
        updateAllCoinDisplays();
        renderShop();
    }
}

function equipSkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && ownedSkins.includes(skin.id)) {
        equippedSkin = skin.id;
        localStorage.setItem('equippedSkin', equippedSkin);
        applyEquippedSkin();
        renderShop();
    }
}

function applyEquippedSkin() {
    const skin = SKINS.find(s => s.id === equippedSkin);
    dino.className = ''; // Limpa classes antigas
    if (skin && skin.cssClass) {
        dino.classList.add(skin.cssClass);
    }
}

// --- FUNÇÕES DE ATUALIZAÇÃO DE UI ---
function updateAllCoinDisplays() {
    coinDisplay.textContent = coins;
    shopCoinDisplay.textContent = coins;
}

function updateScore() {
    scoreDisplay.textContent = `Pontuação: ${score} | Recorde: ${record}`;
}

// --- LÓGICA DO JOGO ---
function resetGame() {
    gameOver = false;
    isJumping = false;
    position = 0;
    score = 0;
    speed = 8;
    obstacles.forEach(obs => obs.remove());
    activeCoins.forEach(c => c.remove());
    obstacles = [];
    activeCoins = [];
    
    dino.style.bottom = '0px';
    gameOverMessage.style.display = 'none';

    updateScore();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
}

function startGame() {
    resetGame();
    showScreen('game');
    
    // Inicia o loop de criação de obstáculos e moedas
    function gameCreationLoop() {
        if(gameOver) {
            clearInterval(gameLoopInterval);
            return;
        }
        createObstacle();
        if (Math.random() > 0.5) {
             setTimeout(createCoin, Math.random() * 500);
        }
    }

    gameCreationLoop(); // Chama a primeira vez
    const interval = Math.max(400, 1500 - (speed - 8) * 150);
    gameLoopInterval = setInterval(gameCreationLoop, interval + Math.random() * 400);
}

function doJump(dynamicHeight, dynamicDelay) { /* ... (código inalterado) ... */ }
function jump() { /* ... (código inalterado) ... */ }
// Colando o código de pulo inalterado para completude
function doJump(dynamicHeight, dynamicDelay) {
  if (isJumping || gameOver) return;
  isJumping = true;
  const maxHeight = dynamicHeight;
  const baseDelay = dynamicDelay;
  let upInterval = setInterval(() => {
    if (position >= maxHeight) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (position <= 0) { clearInterval(downInterval); isJumping = false; } 
        else { position -= 10; dino.style.bottom = position + 'px'; }
      }, baseDelay);
    } else { position += 10; dino.style.bottom = position + 'px'; }
  }, baseDelay);
}
function jump() {
  if (gameOver || isJumping) return;
  const jumpHoldTime = Date.now() - jumpPressStart;
  const minHold = 100, maxHold = 600;
  const hold = Math.min(Math.max(jumpHoldTime, minHold), maxHold);
  const minHeight = 100, maxHeight = 250;
  const dynamicHeight = minHeight + ((hold - minHold) / (maxHold - minHold)) * (maxHeight - minHeight);
  const minDelay = 8, maxDelay = 20;
  const dynamicDelay = maxDelay - ((hold - minHold) / (maxHold - minHold)) * (maxDelay - minDelay);
  doJump(dynamicHeight, dynamicDelay);
}
// Fim do código de pulo inalterado

function createCoin() {
    if (gameOver) return;
    const coin = document.createElement('div');
    coin.classList.add('coin');
    const randomHeight = 20 + Math.random() * 80; 
    coin.style.bottom = randomHeight + 'px';
    game.appendChild(coin);
    activeCoins.push(coin);
    let coinPosition = -20;
    coin.style.left = coinPosition + 'px';

    function moveCoin() {
        if (gameOver) { coin.remove(); return; }
        coinPosition += speed;
        coin.style.left = coinPosition + 'px';
        const dinoRect = dino.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();
        if (dinoRect.left<coinRect.right && dinoRect.right>coinRect.left && dinoRect.top<coinRect.bottom && dinoRect.bottom>coinRect.top) {
            coins++;
            updateAllCoinDisplays();
            localStorage.setItem('dinoCoins', coins);
            coin.remove();
            activeCoins = activeCoins.filter(c => c !== coin);
            return;
        }
        if (coinPosition > game.offsetWidth + 20) {
            coin.remove();
            activeCoins = activeCoins.filter(c => c !== coin);
        } else { requestAnimationFrame(moveCoin); }
    }
    moveCoin();
}

function createObstacle() {
    if (gameOver) return;
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    const types = ['small', 'medium', 'large'];
    obstacle.classList.add(types[Math.floor(Math.random() * types.length)]);
    game.appendChild(obstacle);
    let obstaclePosition = -30;
    obstacle.style.left = obstaclePosition + 'px';
    const dinoWidth = dino.offsetWidth;
    const dinoRightPos = game.offsetWidth - 50 - dinoWidth;

    function move() {
        if (gameOver) { obstacle.remove(); return; }
        const now = Date.now();
        if (now - lastSpeedIncreaseTime > speedIncreaseInterval) {
            speed += speedIncrement;
            lastSpeedIncreaseTime = now;
        }
        obstaclePosition += speed;
        obstacle.style.left = obstaclePosition + 'px';
        const obstacleWidth = obstacle.offsetWidth;
        const obstacleHeight = obstacle.offsetHeight;
        const horizontalCollision = (obstaclePosition + obstacleWidth) > dinoRightPos && obstaclePosition < (dinoRightPos + dinoWidth);
        const verticalCollision = position < obstacleHeight;

        if (horizontalCollision && verticalCollision) {
            gameOver = true;
            clearInterval(gameLoopInterval);
            if(score > record) {
                record = score;
                localStorage.setItem('dinoRecord', record);
            }
            const finalMsg = `${insults[Math.floor(Math.random()*insults.length)]}\n\nSua pontuação: ${score}\nRecorde: ${record}`;
            gameOverMessage.textContent = finalMsg;
            if (!document.getElementById('restartBtn')) {
                const btn = document.createElement('button');
                btn.id = 'restartBtn';
                btn.textContent = 'Jogar Novamente';
                btn.onclick = startGame;
                gameOverMessage.appendChild(document.createElement('br'));
                gameOverMessage.appendChild(btn);
            }
            gameOverMessage.style.display = 'block';
            return;
        }
        if (obstaclePosition > game.offsetWidth + 30) {
            obstacle.remove();
            score++;
            updateScore();
            obstacles = obstacles.filter(obs => obs !== obstacle);
        } else { requestAnimationFrame(move); }
    }
    move();
    obstacles.push(obstacle);
}

// --- EVENT LISTENERS ---
document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver && gameScreen.style.display === 'block') {
    if (jumpPressStart === 0) jumpPressStart = Date.now();
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver && gameScreen.style.display === 'block') {
    if (jumpPressStart !== 0) { jump(); jumpPressStart = 0; }
    e.preventDefault();
  }
});

startGameBtn.addEventListener('click', startGame);
openShopBtn.addEventListener('click', () => {
    renderShop();
    showScreen('shop');
});
backToMenuBtn.addEventListener('click', () => showScreen('menu'));

// --- INICIALIZAÇÃO ---
function init() {
    updateAllCoinDisplays();
    applyEquippedSkin();
    showScreen('menu');
}

init();