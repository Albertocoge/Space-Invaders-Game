class EnemyBullet {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.vy = SPEED_ENEMY_BULLET; 
        this.w = 3;
        this.h = 12;
        this.active = true;
    }

    move() {
        this.y += this.vy;
        if (this.y > this.ctx.canvas.height) {
            this.active = false;
        }
    }

    draw(){
        this.ctx.save();
        this.ctx.fillStyle = "#0000FF"; 
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
        this.ctx.restore();
    }
}