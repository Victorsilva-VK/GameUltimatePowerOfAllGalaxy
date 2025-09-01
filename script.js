const dino = document.getElementById('dino');
const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('gameOverMessage');

const insults = [
  "Você é mais lento que uma tartaruga com preguiça!",
  "Até um dinossauro extinto faria melhor que você!",
  "Foi isso? Achei que era mais difícil!",
  "Parece que seu cérebro está no modo avião!",
  "Cadê a coordenação? Sumiu junto com os dinossauros!",
  "Acho que o dinossauro não é o único que está morto aqui...",
  "Jogando assim, até o T-Rex te pega!",
  "Mais devagar que sinal de trânsito na madrugada!",
  "Se fosse um obstáculo, você já teria desistido!",
  "Pule melhor, ou vire comida de dinossauro!",
];

let isJumping = false;
let position = 0;
let score = 0;
let gameOver = false;
let obstacles = [];

let speed = 8;
const speedIncreaseInterval = 1000;
const speedIncrement = 0.3;
let lastSpeedIncreaseTime = Date.now();

// Recorde salvo no localStorage
let record = localStorage.getItem('dinoRecord') || 0;
record = Number(record);

function updateScore() {
  scoreDisplay.textContent = `Pontuação: ${score} | Recorde: ${record}`;
}

// --- Sistema de pulo apenas dinâmico ---
let jumpPressStart = 0;
let jumpHoldTime = 0;

function doJump(dynamicHeight, dynamicDelay) {
  if (isJumping || gameOver) return;
  isJumping = true;

  const maxHeight = dynamicHeight;
  const baseDelay = dynamicDelay;

  let upInterval = setInterval(() => {
    if (position >= maxHeight) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (position <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          position -= 10;
          dino.style.bottom = position + 'px';
        }
      }, baseDelay);
    } else {
      position += 10;
      dino.style.bottom = position + 'px';
    }
  }, baseDelay);
}

function jump() {
  if (gameOver || isJumping) return;

  jumpHoldTime = Date.now() - jumpPressStart;

  const minHold = 100;
  const maxHold = 600;
  const hold = Math.min(Math.max(jumpHoldTime, minHold), maxHold);

  const minHeight = 100;
  const maxHeight = 250;
  const dynamicHeight = minHeight + ((hold - minHold) / (maxHold - minHold)) * (maxHeight - minHeight);

  const minDelay = 8;
  const maxDelay = 20;
  const dynamicDelay = maxDelay - ((hold - minHold) / (maxHold - minHold)) * (maxDelay - minDelay);

  doJump(dynamicHeight, dynamicDelay);
}

function createObstacle() {
  if (gameOver) return;

  function spawnSingleObstacle(delay = 0) {
    setTimeout(() => {
      if (gameOver) return;
      const obstacle = document.createElement('div');
      obstacle.classList.add('obstacle');

      const types = ['small', 'medium', 'large'];
      const type = types[Math.floor(Math.random() * types.length)];
      obstacle.classList.add(type);

      game.appendChild(obstacle);

      let obstaclePosition = -30;
      obstacle.style.left = obstaclePosition + 'px';

      const dinoWidth = dino.offsetWidth;
      const dinoHeight = dino.offsetHeight;
      const dinoRightPos = game.offsetWidth - 50 - dinoWidth;

      function move() {
        if (gameOver) {
          obstacle.remove();
          return;
        }

        const now = Date.now();
        if (now - lastSpeedIncreaseTime > speedIncreaseInterval) {
          speed += speedIncrement;
          lastSpeedIncreaseTime = now;
        }

        obstaclePosition += speed;
        obstacle.style.left = obstaclePosition + 'px';

        const obstacleWidth = obstacle.offsetWidth;
        const obstacleHeight = obstacle.offsetHeight;
        const obstacleRightEdge = obstaclePosition + obstacleWidth;
        const dinoBottom = position;

        const horizontalCollision = obstacleRightEdge > dinoRightPos && obstaclePosition < (dinoRightPos + dinoWidth);
        const verticalCollision = dinoBottom < obstacleHeight;

        if (horizontalCollision && verticalCollision) {
          gameOver = true;

          let newRecord = false;
          if(score > record) {
            record = score;
            localStorage.setItem('dinoRecord', record);
            newRecord = true;
          }

          const insult = insults[Math.floor(Math.random() * insults.length)];
          const finalMsg = `${insult}\n\nSua pontuação: ${score}\nRecorde: ${record}`;

          gameOverMessage.textContent = finalMsg;

          if (!document.getElementById('restartBtn')) {
            const btn = document.createElement('button');
            btn.id = 'restartBtn';
            btn.textContent = 'Jogar Novamente';
            btn.onclick = () => location.reload();
            gameOverMessage.appendChild(document.createElement('br'));
            gameOverMessage.appendChild(btn);
          }

          gameOverMessage.style.display = 'block';

          obstacles.forEach(obs => obs.remove());

          if (newRecord) {
            alert(`Novo recorde!\n\n${finalMsg}`);
          }

          return;
        }

        if (obstaclePosition > game.offsetWidth + 30) {
          obstacle.remove();
          score++;
          updateScore();
          obstacles = obstacles.filter(obs => obs !== obstacle);
        } else {
          requestAnimationFrame(move);
        }
      }

      move();
      obstacles.push(obstacle);
    }, delay);
  }

  if (speed >= 12) {
    spawnSingleObstacle(0);
    spawnSingleObstacle(600);
  } else {
    spawnSingleObstacle(0);
  }

  const minInterval = 400;
  const maxInterval = 1500;
  const interval = Math.max(minInterval, maxInterval - (speed - 8) * 150);

  if (!gameOver) {
    setTimeout(createObstacle, interval + Math.random() * 400);
  }
}

document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver) {
    if (jumpPressStart === 0) {
      jumpPressStart = Date.now();
    }
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver) {
    if (jumpPressStart !== 0) {
      jump();
      jumpPressStart = 0;
    }
    e.preventDefault();
  }
});

updateScore();
createObstacle();