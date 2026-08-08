import './style.css';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const BACKGROUND_COLOR = '#111827';

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

function render(): void {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function restart(): void {
  status.textContent = 'Game surface ready';
  render();
}

function gameLoop(): void {
  render();
  requestAnimationFrame(gameLoop);
}

restartButton.addEventListener('click', restart);
requestAnimationFrame(gameLoop);
