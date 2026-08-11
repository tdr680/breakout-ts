# Browser Breakout Game

## Summary

Build a small Breakout game using Vite, TypeScript, and the HTML Canvas API. Keep the game logic in a single readable TypeScript module, with minimal HTML and CSS. The canvas will use a fixed 640×480 coordinate system.

## Milestones

### 1. Project setup and game surface

- Scaffold a vanilla Vite + TypeScript project.
- Add scripts for development, production builds, and preview.
- Replace the starter UI with:
  - A 640×480 canvas.
  - A short controls/status label.
  - A restart button.
- Add minimal styling to center the game and preserve the canvas aspect ratio on narrow screens.

Acceptance: the project starts with `npm run dev`, builds with `npm run build`, and displays an empty game canvas.

### 2. Core game model and rendering

- Define compact internal types for:
  - `GameStatus`: `playing`, `won`, or `lost`.
  - Ball position, velocity, and radius.
  - Paddle position, size, and speed.
  - Bricks with position, size, and active state.
  - Overall game state.
- Add constants for canvas dimensions, brick layout, colors, and movement speeds.
- Create a rectangular brick grid from row and column constants.
- Render the background, paddle, ball, active bricks, and terminal win/loss message.

Acceptance: the initial paddle, ball, and complete brick grid render correctly.

### 2.5. GitHub Pages deployment

- Configure Vite to build assets for the `/breakout-ts/` repository path.
- Add a GitHub Actions workflow that builds the project with `npm ci` and `npm run build` on pushes to `main` or manual dispatch.
- Upload `dist/` as a GitHub Pages artifact and deploy it with the official Pages actions.
- Use the `github-pages` environment and the minimum required deployment permissions.

Acceptance: the production build succeeds locally, and the workflow publishes the site to `https://tdr680.github.io/breakout-ts/` after GitHub Pages is configured to use GitHub Actions.

### 3. Input and game loop

- Track left and right arrow-key state using `keydown` and `keyup`.
- Prevent arrow keys from scrolling the page while controlling the game.
- Use `requestAnimationFrame` for the main loop.
- Calculate frame delta time and cap unusually large deltas to avoid movement jumps.
- Move the paddle while keeping it within the canvas.
- Move the ball only while the game status is `playing`.

Acceptance: the paddle responds smoothly to both arrow keys and cannot leave the game area.

### 4. Collisions and game rules

- Bounce the ball from the left, right, and top walls.
- Detect paddle collisions while the ball is moving downward:
  - Return the ball above the paddle.
  - Reverse its vertical direction.
  - Adjust horizontal velocity based on where it struck the paddle.
- Detect collision with active bricks:
  - Deactivate one struck brick per update.
  - Reverse the ball along the collision’s shallowest overlap axis.
- Set the status to `lost` when the entire ball passes below the canvas.
- Set the status to `won` when no active bricks remain.
- Stop gameplay updates after either terminal state.

Acceptance: every surface produces a believable bounce, bricks disappear when hit, and the correct win or loss state is reached.

### 5. Restart and final verification

- Implement one reset function that reconstructs the initial ball, paddle, bricks, and `playing` status.
- Connect reset to the restart button.
- Allow `R` to restart at any time, including after winning or losing.
- Show the current control hint and a clear win/loss message.
- Remove unused Vite starter files and confirm there are no runtime or TypeScript errors.

Acceptance: repeated restarts always restore a fresh, playable game without reloading the page.

## Interfaces and Structure

- Keep gameplay and rendering in `src/main.ts`; keep presentation rules in `src/style.css`.
- Do not expose a public API or introduce classes, a framework, or shared state libraries.
- Separate the module into small functions such as initialization, input handling, update, collision detection, rendering, and restart.
- Use canvas-space coordinates for all physics; CSS scaling must not change collision behavior.

## Test Plan

- Run the TypeScript production build successfully.
- Verify the paddle moves left and right, stops at both edges, and stops when keys are released.
- Verify the ball bounces from all three enclosing walls and from the paddle at its center and edges.
- Verify brick hits remove only active bricks and never remove the same brick twice.
- Verify losing occurs only after the ball leaves the bottom.
- Verify destroying the final brick produces the win state.
- Verify motion stops after winning or losing.
- Verify both the button and `R` restore the full grid and initial positions.
- Verify browser resizing does not distort the aspect ratio or alter game physics.

## Assumptions

- The canvas coordinate area is exactly 640×480.
- The game starts immediately after page load; there is no start screen, score, lives system, sound, touch input, or persistent state.
- Brick layout and speeds are fixed constants tuned for straightforward play.
- Collision detection uses simple circle-versus-rectangle checks suitable for one ball and a small brick grid.
- Browser-based acceptance testing is sufficient; no testing framework is added unless collision behavior later becomes complex enough to justify it.
