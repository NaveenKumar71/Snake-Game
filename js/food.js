class Food {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.type = 'regular';
    }

    spawn(tileCountX, tileCountY, snakes) {
        this.x = Math.floor(Math.random() * tileCountX);
        this.y = Math.floor(Math.random() * tileCountY);

        // Ensure food doesn't spawn on any snake
        for (const snake of snakes) {
            for (const segment of snake.body) {
                if (segment.x === this.x && segment.y === this.y) {
                    return this.spawn(tileCountX, tileCountY, snakes);
                }
            }
        }

        const rand = Math.random();
        if (rand < 0.1) this.type = 'gold';
        else if (rand < 0.15) this.type = 'speed';
        else if (rand < 0.2) this.type = 'shield';
        else this.type = 'regular';
    }

    draw(ctx) {
        let color, glow;
        switch (this.type) {
            case 'gold': color = COLORS.FOOD_GOLD; glow = 'rgba(255, 204, 0, 0.5)'; break;
            case 'speed': color = COLORS.FOOD_SPEED; glow = 'rgba(0, 243, 255, 0.5)'; break;
            case 'shield': color = COLORS.FOOD_SHIELD; glow = 'rgba(255, 0, 255, 0.5)'; break;
            default: color = COLORS.FOOD_REGULAR; glow = 'rgba(255, 49, 49, 0.5)';
        }

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = glow;
        ctx.fillStyle = color;

        if (this.type !== 'regular') {
            this.drawStar(ctx, this.x * GRID_SIZE + GRID_SIZE / 2, this.y * GRID_SIZE + GRID_SIZE / 2, 5, GRID_SIZE / 2, GRID_SIZE / 4);
        } else {
            ctx.beginPath();
            ctx.arc(this.x * GRID_SIZE + GRID_SIZE / 2, this.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}
