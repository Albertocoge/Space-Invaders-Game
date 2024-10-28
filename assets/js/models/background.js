class Background {
    constructor(ctx) {

        this.ctx = ctx;

        this.x = 0;
        this.y = 0;
        this.vy = SPEED_BACKGROUND;
        this.w = this.ctx.canvas.width;
        this.h = this.ctx.canvas.height;

        this.sprite = new Image();
        this.sprite.src = "assets/img/universe1.png";
        this.sprite.isReady = false;

        this.sprite.onload = () => {
            this.sprite.isReady = true;

        }
    }

    move() {
        this.y += this.vy;
        if(this.y >= this.h){
            this.y = 0;
        }
    }

    draw() {
        if(this.sprite.isReady) {
            this.ctx.drawImage(
                this.sprite,
                this.x,
                this.y,
                this.w,
                this.h
            )

            this.ctx.drawImage(
                this.sprite,
                this.x,
                this.y - this.h,
                this.w,
                this.h
            )

            
        }
    }

    reset() {
        this.y = 0;
    }

}

