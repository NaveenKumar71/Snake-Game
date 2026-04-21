class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UI();
        this.particles = new ParticleSystem();
        this.food = new Food();

        this.tileCountX = 0;
        this.tileCountY = 0;
        this.snakes = [];
        this.playerCount = 1;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.level = 1;
        this.baseSpeed = INITIAL_SPEED;
        this.gameSpeed = this.baseSpeed;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameLoopTimeout = null;
        this.screenShake = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('keydown', (e) => this.handleInput(e));

        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.start());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.playerCount = parseInt(btn.dataset.players);
                this.ui.controlsHint.textContent = this.playerCount === 1
                    ? 'P1: WASD / Arrows'
                    : 'P1: WASD | P2: Arrows';
            });
        });

        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.baseSpeed = parseInt(btn.dataset.speed);
                this.gameSpeed = this.baseSpeed;
            });
        });

        // Mobile controls
        this.setupMobileControls();
        this.ui.updateScores(0, 0, this.highScore, this.playerCount);
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.floor(container.clientWidth / GRID_SIZE) * GRID_SIZE;
        this.canvas.height = Math.floor(container.clientHeight / GRID_SIZE) * GRID_SIZE;
        this.tileCountX = this.canvas.width / GRID_SIZE;
        this.tileCountY = this.canvas.height / GRID_SIZE;
    }

    start() {
        this.snakes = [
            new Snake(1, 10, 10, COLORS.P1_HEAD, COLORS.P1_BODY, { Up: 'w', Down: 's', Left: 'a', Right: 'd', AltUp: 'ArrowUp', AltDown: 'ArrowDown', AltLeft: 'ArrowLeft', AltRight: 'ArrowRight' })
        ];

        if (this.playerCount === 2) {
            this.snakes.push(new Snake(2, this.tileCountX - 11, this.tileCountY - 11, COLORS.P2_HEAD, COLORS.P2_BODY, { Up: 'ArrowUp', Down: 'ArrowDown', Left: 'ArrowLeft', Right: 'ArrowRight' }));
            // Re-assign P1 controls if 2P mode
            this.snakes[0].controls = { Up: 'w', Down: 's', Left: 'a', Right: 'd' };
        }

        this.food.spawn(this.tileCountX, this.tileCountY, this.snakes);
        this.score = 0;
        this.level = 1;
        this.gameSpeed = this.baseSpeed;
        this.isPaused = false;
        this.isGameOver = false;

        this.ui.hideOverlays();
        this.ui.updateLevel(1);

        if (this.gameLoopTimeout) clearTimeout(this.gameLoopTimeout);
        this.loop();
    }

    loop() {
        if (this.isPaused || this.isGameOver) return;
        this.update();
        this.draw();
        this.gameLoopTimeout = setTimeout(() => this.loop(), this.gameSpeed);
    }

    update() {
        this.snakes.forEach(snake => {
            snake.update(this.tileCountX, this.tileCountY);

            // Food Check
            const head = snake.body[0];
            if (head.x === this.food.x && head.y === this.food.y) {
                this.handleEating(snake);
            } else {
                snake.popTail();
            }
        });

        // Collision Check
        this.snakes.forEach(snake => {
            const others = this.snakes.filter(s => s !== snake);
            if (snake.checkCollision(others)) {
                if (snake.hasShield) {
                    snake.hasShield = false;
                    this.screenShake = 15;
                } else {
                    this.gameOver();
                }
            }
        });

        this.particles.update();
    }

    handleEating(snake) {
        if (this.food.type === 'gold') {
            snake.score += 50;
            this.screenShake = 10;
            this.particles.create(this.food.x * GRID_SIZE, this.food.y * GRID_SIZE, COLORS.FOOD_GOLD, 15);
        } else if (this.food.type === 'speed') {
            this.gameSpeed = Math.max(30, this.gameSpeed / 2);
            setTimeout(() => this.resetSpeed(), 5000);
            this.particles.create(this.food.x * GRID_SIZE, this.food.y * GRID_SIZE, COLORS.FOOD_SPEED, 10);
        } else if (this.food.type === 'shield') {
            snake.hasShield = true;
            this.particles.create(this.food.x * GRID_SIZE, this.food.y * GRID_SIZE, COLORS.FOOD_SHIELD, 10);
        } else {
            snake.score += 10;
            this.particles.create(this.food.x * GRID_SIZE, this.food.y * GRID_SIZE, snake.colorHead, 8);
        }

        this.food.spawn(this.tileCountX, this.tileCountY, this.snakes);
        this.checkLevelUp();
        this.ui.updateScores(
            this.snakes[0].score,
            this.snakes[1] ? this.snakes[1].score : 0,
            this.highScore,
            this.playerCount
        );
        this.vibrate(50);
    }

    resetSpeed() {
        this.gameSpeed = Math.max(MIN_SPEED, this.baseSpeed - (this.level - 1) * SPEED_INCREMENT);
    }

    checkLevelUp() {
        const totalScore = this.snakes.reduce((acc, s) => acc + s.score, 0);
        const newLevel = Math.floor(totalScore / LEVEL_UP_SCORE) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.ui.updateLevel(this.level);
            this.resetSpeed();
            this.screenShake = 20;
        }
    }

    draw() {
        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate(Math.random() * this.screenShake - this.screenShake / 2, Math.random() * this.screenShake - this.screenShake / 2);
            this.screenShake *= 0.9;
            if (this.screenShake < 1) this.screenShake = 0;
        }

        // BG
        this.ctx.fillStyle = COLORS.BG_DARK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        this.ctx.strokeStyle = COLORS.GRID_LINE;
        for (let i = 0; i <= this.canvas.width; i += GRID_SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.canvas.height); this.ctx.stroke();
        }
        for (let i = 0; i <= this.canvas.height; i += GRID_SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.canvas.width, i); this.ctx.stroke();
        }

        this.food.draw(this.ctx);
        this.snakes.forEach(s => s.draw(this.ctx));
        this.particles.draw(this.ctx);

        this.ctx.restore();
    }

    handleInput(e) {
        if (e.key === 'p' || e.key === 'Escape') this.togglePause();
        if (this.isPaused || this.isGameOver) return;

        this.snakes.forEach(snake => {
            const keys = snake.controls;
            if (e.key === keys.Up || e.key === keys.AltUp) snake.setDirection({ x: 0, y: -1 });
            if (e.key === keys.Down || e.key === keys.AltDown) snake.setDirection({ x: 0, y: 1 });
            if (e.key === keys.Left || e.key === keys.AltLeft) snake.setDirection({ x: -1, y: 0 });
            if (e.key === keys.Right || e.key === keys.AltRight) snake.setDirection({ x: 1, y: 0 });
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.ui.togglePause(this.isPaused);
        if (!this.isPaused) this.loop();
    }

    gameOver() {
        this.isGameOver = true;
        const totalScore = this.snakes.reduce((acc, s) => acc + s.score, 0);
        if (totalScore > this.highScore) {
            this.highScore = totalScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        this.ui.showGameOver(
            this.snakes[0].score,
            this.snakes[1] ? this.snakes[1].score : 0,
            this.highScore
        );
        this.vibrate([100, 50, 100]);
    }

    vibrate(p) { if (navigator.vibrate) navigator.vibrate(p); }

    setupMobileControls() {
        // Player 1 only for mobile
        document.getElementById('ctrl-up').addEventListener('click', () => this.snakes[0].setDirection({ x: 0, y: -1 }));
        document.getElementById('ctrl-down').addEventListener('click', () => this.snakes[0].setDirection({ x: 0, y: 1 }));
        document.getElementById('ctrl-left').addEventListener('click', () => this.snakes[0].setDirection({ x: -1, y: 0 }));
        document.getElementById('ctrl-right').addEventListener('click', () => this.snakes[0].setDirection({ x: 1, y: 0 }));
    }
}

new Game();
