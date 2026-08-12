import './style.css';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const BACKGROUND_COLOR = '#111827';
const PADDLE_WIDTH = 104;
const PADDLE_HEIGHT = 14;
const PADDLE_BOTTOM_OFFSET = 24;
const PADDLE_SPEED = 360;
const PADDLE_COLOR = '#60a5fa';
const BALL_RADIUS = 10;
const BALL_INITIAL_X = CANVAS_WIDTH / 2;
const BALL_INITIAL_Y = 300;
const BALL_INITIAL_VELOCITY_X = 260;
const BALL_INITIAL_VELOCITY_Y = -120;
const BALL_COLOR = '#f9fafb';
const PADDLE_MAX_HORIZONTAL_SPEED_FACTOR = 0.85;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 8;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 8;
const BRICK_SIDE_MARGIN = 36;
const BRICK_TOP_OFFSET = 48;
const BRICK_WIDTH = (
  CANVAS_WIDTH
  - BRICK_SIDE_MARGIN * 2
  - BRICK_GAP * (BRICK_COLUMNS - 1)
) / BRICK_COLUMNS;
const BRICK_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee'];
const MAX_DELTA_SECONDS = 0.05;

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface InputState {
  leftPressed: boolean;
  rightPressed: boolean;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
}

interface GameState {
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
  ballExitedBottom: boolean;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }

  return element;
}

function requireCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas rendering is not supported by this browser.');
  }

  return context;
}

const canvas = requireElement<HTMLCanvasElement>('#game-canvas');
const status = requireElement<HTMLParagraphElement>('#status');
const restartButton = requireElement<HTMLButtonElement>('#restart-button');
const context = requireCanvasContext(canvas);

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const inputState: InputState = {
  leftPressed: false,
  rightPressed: false,
};

let gameState = createInitialGameState();
let previousFrameTime: number | null = null;

function createBricks(): Brick[] {
  const bricks: Brick[] = [];

  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let column = 0; column < BRICK_COLUMNS; column += 1) {
      bricks.push({
        x: BRICK_SIDE_MARGIN + column * (BRICK_WIDTH + BRICK_GAP),
        y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: BRICK_COLORS[row] ?? '#f9fafb',
        active: true,
      });
    }
  }

  return bricks;
}

function createInitialGameState(): GameState {
  return {
    paddle: {
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - PADDLE_BOTTOM_OFFSET - PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
    },
    ball: {
      x: BALL_INITIAL_X,
      y: BALL_INITIAL_Y,
      radius: BALL_RADIUS,
      velocityX: BALL_INITIAL_VELOCITY_X,
      velocityY: BALL_INITIAL_VELOCITY_Y,
    },
    bricks: createBricks(),
    ballExitedBottom: false,
  };
}

function setMovementKey(code: string, pressed: boolean): boolean {
  if (code === 'ArrowLeft') {
    inputState.leftPressed = pressed;
    return true;
  }

  if (code === 'ArrowRight') {
    inputState.rightPressed = pressed;
    return true;
  }

  return false;
}

function updatePaddle(paddle: Paddle, deltaSeconds: number): void {
  const direction = Number(inputState.rightPressed) - Number(inputState.leftPressed);
  const nextX = paddle.x + direction * paddle.speed * deltaSeconds;
  paddle.x = Math.max(0, Math.min(nextX, CANVAS_WIDTH - paddle.width));
}

function updateBall(ball: Ball, deltaSeconds: number): void {
  ball.x += ball.velocityX * deltaSeconds;
  ball.y += ball.velocityY * deltaSeconds;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.velocityX = Math.abs(ball.velocityX);
  } else if (ball.x + ball.radius > CANVAS_WIDTH) {
    ball.x = CANVAS_WIDTH - ball.radius;
    ball.velocityX = -Math.abs(ball.velocityX);
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.velocityY = Math.abs(ball.velocityY);
  }
}

function ballOverlapsRectangle(
  ball: Ball,
  rectangle: Pick<Paddle, 'x' | 'y' | 'width' | 'height'>,
): boolean {
  const closestX = Math.max(rectangle.x, Math.min(ball.x, rectangle.x + rectangle.width));
  const closestY = Math.max(rectangle.y, Math.min(ball.y, rectangle.y + rectangle.height));
  const distanceX = ball.x - closestX;
  const distanceY = ball.y - closestY;

  return distanceX * distanceX + distanceY * distanceY <= ball.radius * ball.radius;
}

function resolvePaddleCollision(ball: Ball, paddle: Paddle): void {
  if (ball.velocityY <= 0 || !ballOverlapsRectangle(ball, paddle)) {
    return;
  }

  const paddleCenter = paddle.x + paddle.width / 2;
  const hitOffset = Math.max(-1, Math.min(1, (ball.x - paddleCenter) / (paddle.width / 2)));
  const speed = Math.hypot(ball.velocityX, ball.velocityY);

  ball.x = Math.max(ball.radius, Math.min(ball.x, CANVAS_WIDTH - ball.radius));
  ball.y = paddle.y - ball.radius;
  ball.velocityX = speed * PADDLE_MAX_HORIZONTAL_SPEED_FACTOR * hitOffset;
  ball.velocityY = -Math.sqrt(speed * speed - ball.velocityX * ball.velocityX);
}

function resolveBrickCollision(ball: Ball, brick: Brick): void {
  const overlapFromLeft = ball.x + ball.radius - brick.x;
  const overlapFromRight = brick.x + brick.width - (ball.x - ball.radius);
  const overlapFromTop = ball.y + ball.radius - brick.y;
  const overlapFromBottom = brick.y + brick.height - (ball.y - ball.radius);
  const horizontalOverlap = Math.min(overlapFromLeft, overlapFromRight);
  const verticalOverlap = Math.min(overlapFromTop, overlapFromBottom);

  if (horizontalOverlap < verticalOverlap) {
    if (ball.x < brick.x + brick.width / 2) {
      ball.x = brick.x - ball.radius;
      ball.velocityX = -Math.abs(ball.velocityX);
    } else {
      ball.x = brick.x + brick.width + ball.radius;
      ball.velocityX = Math.abs(ball.velocityX);
    }
  } else if (ball.y < brick.y + brick.height / 2) {
    ball.y = brick.y - ball.radius;
    ball.velocityY = -Math.abs(ball.velocityY);
  } else {
    ball.y = brick.y + brick.height + ball.radius;
    ball.velocityY = Math.abs(ball.velocityY);
  }
}

function hitFirstBrick(ball: Ball, bricks: Brick[]): void {
  for (const brick of bricks) {
    if (!brick.active || !ballOverlapsRectangle(ball, brick)) {
      continue;
    }

    brick.active = false;
    resolveBrickCollision(ball, brick);
    return;
  }
}

function update(deltaSeconds: number): void {
  updatePaddle(gameState.paddle, deltaSeconds);

  if (gameState.ballExitedBottom) {
    return;
  }

  updateBall(gameState.ball, deltaSeconds);
  resolvePaddleCollision(gameState.ball, gameState.paddle);
  hitFirstBrick(gameState.ball, gameState.bricks);

  if (gameState.ball.y - gameState.ball.radius > CANVAS_HEIGHT) {
    gameState.ballExitedBottom = true;
    status.textContent = 'Ball exited through the bottom';
  }
}

function renderPaddle(paddle: Paddle): void {
  context.fillStyle = PADDLE_COLOR;
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function renderBall(ball: Ball): void {
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = BALL_COLOR;
  context.fill();
}

function renderBricks(bricks: Brick[]): void {
  for (const brick of bricks) {
    if (!brick.active) {
      continue;
    }

    context.fillStyle = brick.color;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}

function render(): void {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderBricks(gameState.bricks);
  renderPaddle(gameState.paddle);
  renderBall(gameState.ball);
}

function restart(): void {
  gameState = createInitialGameState();
  inputState.leftPressed = false;
  inputState.rightPressed = false;
  previousFrameTime = null;
  status.textContent = 'Ball in play';
}

function gameLoop(timestamp: number): void {
  const elapsedSeconds = previousFrameTime === null
    ? 0
    : (timestamp - previousFrameTime) / 1000;
  const deltaSeconds = Math.min(elapsedSeconds, MAX_DELTA_SECONDS);

  previousFrameTime = timestamp;
  update(deltaSeconds);
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (setMovementKey(event.code, true)) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (setMovementKey(event.code, false)) {
    event.preventDefault();
  }
});

window.addEventListener('blur', () => {
  inputState.leftPressed = false;
  inputState.rightPressed = false;
});

restartButton.addEventListener('click', restart);
requestAnimationFrame(gameLoop);
