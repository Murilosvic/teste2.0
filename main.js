const canvas = document.getElementById("ping");
const ctx = canvas.getContext("2d");
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

<div class="mobile-controls">
  <div class="left-controls">
    <button id="btn-w">▲</button>
    <button id="btn-s">▼</button>
  </div>
  <div class="right-controls">
    <button id="btn-up">▲</button>
    <button id="btn-down">▼</button>
  </div>
</div>

// Controle de teclas
const keysPressed = {};
document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) e.preventDefault();
  keysPressed[e.key] = true;
});
document.addEventListener("keyup", (e) => keysPressed[e.key] = false);

// Toggle do menu lateral
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("active");
}

// Elementos do jogo
const paddleWidth = 15;
const paddleHeight = 100;
const leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, speed: 6, score: 0 };
const rightPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2, speed: 6, score: 0, height: paddleHeight };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, dx: 5, dy: 5 };

// Movimento das raquetes
function movePaddles() {
  if (gameMode === "playerVsPlayer") {
    if (keysPressed["w"] && leftPaddle.y > 0) leftPaddle.y -= leftPaddle.speed;
    if (keysPressed["s"] && leftPaddle.y + paddleHeight < canvas.height) leftPaddle.y += leftPaddle.speed;
    if (keysPressed["ArrowUp"] && rightPaddle.y > 0) rightPaddle.y -= rightPaddle.speed;
    if (keysPressed["ArrowDown"] && rightPaddle.y + paddleHeight < canvas.height) rightPaddle.y += rightPaddle.speed;
  } else if (gameMode === "playerVsBot") {
    if (keysPressed["w"] && leftPaddle.y > 0) leftPaddle.y -= leftPaddle.speed;
    if (keysPressed["s"] && leftPaddle.y + paddleHeight < canvas.height) leftPaddle.y += leftPaddle.speed;

    if (typeof atualizarBot === "function") {
      atualizarBot(rightPaddle, ball);
    }
  }
}

// Movimento da bola
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy *= -1;

  if (
    ball.x - ball.radius < leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
    ball.x = leftPaddle.x + paddleWidth + ball.radius;

    // 🎵 TOCAR SOM
    somColisao.currentTime = 0;
    somColisao.play();
  }

  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
    ball.x = rightPaddle.x - ball.radius;

    // 🎵 TOCAR SOM
    somColisao.currentTime = 0;
    somColisao.play();
  }

  if (ball.x < 0) {
    rightPaddle.score++;
    resetBall();
  } else if (ball.x > canvas.width) {
    leftPaddle.score++;
    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx *= -1;
  ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
}

// Desenhos
function drawRoundedPaddle(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "60px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${leftPaddle.score}   ✦   ${rightPaddle.score}`, canvas.width / 2, 300);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoundedPaddle(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, 10, "#31323e");
  drawRoundedPaddle(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, 10, "#BFC0D1");

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();

  drawScore();
}

// Controle do jogo
let jogoEmAndamento = false;
let loopId;
let gameMode = null;

function startGameLoop() {
  if (!jogoEmAndamento) {
    jogoEmAndamento = true;
    loopId = requestAnimationFrame(gameLoop);
  }
}

function pauseGame() {
  jogoEmAndamento = false;
  cancelAnimationFrame(loopId);
}

function gameLoop() {
  if (!jogoEmAndamento) return;
  movePaddles();
  moveBall();
  draw();
  loopId = requestAnimationFrame(gameLoop);
}

// Modal campanha
document.getElementById("btnCampanha").addEventListener("click", () => {
  document.getElementById("modalCampanha").classList.remove("hidden");
  pauseGame();
});

function fecharCampanha() {
  const modalCampanha = document.getElementById('modalCampanha');
  if (modalCampanha) {
    modalCampanha.classList.add('hidden');
  }

  document.getElementById("modo-jogo").hidden = false;
  document.getElementById("dificuldade-bot").hidden = true;
}

function fecharModal() {
  document.getElementById("modalCampanha").classList.add("hidden");
}

// Mostrar/voltar níveis de bot
function mostrarNiveisBot() {
  document.getElementById("modo-jogo").hidden = true;
  document.getElementById("dificuldade-bot").hidden = false;
}
function voltarModoJogo() {
  document.getElementById("modo-jogo").hidden = false;
  document.getElementById("dificuldade-bot").hidden = true;
}

// Escolher modo de jogo
function escolherModo(modo) {
  gameMode = modo;
  if (modo === "playerVsBot") {
    mostrarNiveisBot();
  } else {
    fecharModal();
    reiniciarJogo();
    startGameLoop();
  }
}

// Escolher dificuldade do bot e importar script
function escolherDificuldade(dificuldade) {
  fecharModal();
  voltarModoJogo();

  const scriptAntigo = document.getElementById("botScript");
  if (scriptAntigo) {
    scriptAntigo.remove();
  }

  const novoScript = document.createElement("script");
  novoScript.src = `fases/${dificuldade}.js`; // Ex: fases/easy.js
  novoScript.id = "botScript";

  novoScript.onload = () => {
    reiniciarJogo();
    gameMode = "playerVsBot";
    startGameLoop();
  };

  document.body.appendChild(novoScript);
}

// Reinicia placar e posição
function reiniciarJogo() {
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  resetBall();
}

function mostrarNiveisBot() {
  document.getElementById('modo-jogo').hidden = true;
  document.getElementById('dificuldade-bot').hidden = false;
}

function voltarModoJogo() {
  document.getElementById('modo-jogo').hidden = false;
  document.getElementById('dificuldade-bot').hidden = true;
}

function iniciarBot(dificuldade) {
  fecharCampanha();

  const scriptAntigo = document.getElementById("botScript");
  if (scriptAntigo) {
    scriptAntigo.remove();
  }

  const script = document.createElement('script');
  script.src = `fases/${dificuldade}.js`;
  script.id = "botScript";
  script.onload = () => {
    console.log(`${dificuldade}.js carregado`);
    gameMode = "playerVsBot"; // ⚠️ precisa definir o modo aqui
    reiniciarJogo();          // ⚠️ limpa placar e posiciona
    startGameLoop();          // ⚠️ inicia o loop do jogo
  };
  script.onerror = () => console.error(`Erro ao carregar fases/${dificuldade}.js`);
  
  document.body.appendChild(script);
}

// Mobile: Simular teclas pressionadas ao tocar nos botões
function simularPressionarTecla(tecla) {
  keysPressed[tecla] = true;
  setTimeout(() => keysPressed[tecla] = false, 100); // Solta após 100ms
}

document.getElementById("btn-w").addEventListener("touchstart", () => simularPressionarTecla("w"));
document.getElementById("btn-s").addEventListener("touchstart", () => simularPressionarTecla("s"));
document.getElementById("btn-up").addEventListener("touchstart", () => simularPressionarTecla("ArrowUp"));
document.getElementById("btn-down").addEventListener("touchstart", () => simularPressionarTecla("ArrowDown"));

