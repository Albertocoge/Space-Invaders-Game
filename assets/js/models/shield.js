class Shield {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = 70; 
        this.height = 40;
        this.health = 200; 

        this.alive = true;

        this.sprite = new Image();
        this.sprite.src = "/assets/img/shield.png";
        this.sprite.isReady = false;

        this.sprite.onload = () => {
            this.sprite.isReady = true;
        };
    }

    draw() {
        if (!this.alive) return;

        if (this.sprite.isReady) {
            this.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            //Si la img no carga se dibuja rectangulo
            this.ctx.fillStyle = "grey";
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Método para recibir daño

    hit(damage = 20) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
           
        }
    }

    // Método para reiniciar el escudo

    reset() {
        this.health = 200;
        this.alive = true;
    }
}