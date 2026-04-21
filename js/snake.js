class Snake {
    constructor(id, headX, headY, colorHead, colorBody, controls) {
        this.id = id;
        this.body = [
            { x: headX, y: headY },
            { x: headX, y: headY + 1 },
            { x: headX, y: headY + 2 }
        ];
        this.direction = { x: 0, y: -1 };
        this.nextDirection = { x: 0, y: -1 };
        this.colorHead = colorHead;
        this.colorBody = colorBody;
        this.controls = controls;
        this.score = 0;
        this.isAlive = true;
        this.hasShield = false;
    }

    setDirection(dir) {
        // Prevent 180 degree turns
        if (dir.x === -this.direction.x && dir.x !== 0) return;
        if (dir.y === -this.direction.y && dir.y !== 0) return;
        this.nextDirection = dir;
    }

    update(tileCountX, tileCountY) {
        if (!this.isAlive) return;

        this.direction = this.nextDirection;
        const head = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.y
        };

        // Wall Wrapping
        if (head.x < 0) head.x = tileCountX - 1;
        if (head.x >= tileCountX) head.x = 0;
        if (head.y < 0) head.y = tileCountY - 1;
        if (head.y >= tileCountY) head.y = 0;

        this.body.unshift(head);
    }

    popTail() {
        this.body.pop();
    }

    checkCollision(otherSnakes = []) {
        const head = this.body[0];

        // Self collision
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === head.x && this.body[i].y === head.y) {
                return true;
            }
        }

        // Collision with other snakes
        for (const other of otherSnakes) {
            for (const segment of other.body) {
                if (segment.x === head.x && segment.y === head.y) {
                    return true;
                }
            }
        }

        return false;
    }

    draw(ctx) {
        this.body.forEach((segment, index) => {
            const isHead = index === 0;
            ctx.save();
            ctx.shadowBlur = isHead ? 20 : 10;
            ctx.shadowColor = this.colorHead;

            const alpha = 1 - (index / this.body.length) * 0.6;
            ctx.fillStyle = isHead ? this.colorHead : this.colorBody;
            ctx.globalAlpha = alpha;

            const padding = 2;
            const size = GRID_SIZE - padding * 2;

            if (isHead) {
                ctx.fillRect(segment.x * GRID_SIZE + padding, segment.y * GRID_SIZE + padding, size, size);

                // Eyes
                ctx.fillStyle = '#000';
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                const eyeSize = 3;
                if (this.direction.x === 1) { // Right
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
                } else if (this.direction.x === -1) { // Left
                    ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
                } else if (this.direction.y === -1) { // Up
                    ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                } else { // Down
                    ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - 8, segment.y * GRID_SIZE + GRID_SIZE - 8, eyeSize, eyeSize);
                }
            } else {
                ctx.beginPath();
                ctx.roundRect(segment.x * GRID_SIZE + padding, segment.y * GRID_SIZE + padding, size, size, 5);
                ctx.fill();
            }
            ctx.restore();
        });

        // Shield indicator
        if (this.hasShield) {
            ctx.save();
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff00ff';
            ctx.beginPath();
            ctx.arc(this.body[0].x * GRID_SIZE + GRID_SIZE / 2, this.body[0].y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}
