class UI {
    constructor() {
        this.p1Score = document.getElementById('score');
        this.p2Score = document.getElementById('score-p2');
        this.p2StatItem = document.querySelector('.stat-item.p2');
        this.highScore = document.getElementById('high-score');
        this.level = document.getElementById('current-level');
        this.controlsHint = document.getElementById('controls-hint');

        this.screens = {
            start: document.getElementById('start-screen'),
            gameOver: document.getElementById('game-over-screen'),
            pause: document.getElementById('pause-screen')
        };

        this.finalScore = document.getElementById('final-score');
        this.finalHighScore = document.getElementById('final-high-score');
    }

    updateScores(s1, s2, hs, mode) {
        if (this.p1Score) this.p1Score.textContent = s1.toString().padStart(4, '0');
        if (mode === 2) {
            if (this.p2Score) this.p2Score.textContent = s2.toString().padStart(4, '0');
            this.p2StatItem.style.display = 'flex';
        } else {
            this.p2StatItem.style.display = 'none';
        }
        if (this.highScore) this.highScore.textContent = hs.toString().padStart(4, '0');
    }

    updateLevel(lvl) {
        if (this.level) this.level.textContent = lvl;
    }

    showGameOver(s1, s2, hs) {
        this.screens.gameOver.classList.add('active');
        this.finalScore.textContent = `P1: ${s1} | P2: ${s2}`;
        this.finalHighScore.textContent = hs;
    }

    hideOverlays() {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
    }

    togglePause(paused) {
        if (paused) this.screens.pause.classList.add('active');
        else this.screens.pause.classList.remove('active');
    }
}
