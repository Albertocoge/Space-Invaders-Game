class Enemy {

    constructor(ctx, x, y, imagePath) {
        this.ctx = ctx;

        this.x = x;
        this.vx = SPEED_ENEMY;
        this.y = y;
        this.vy = SPEED_ENEMY_VERTICAL;
        this.w = 50;
        this.h = 35;
        this.alive = true;

        this.sprite = new Image();
        this.sprite.src = imagePath;
        this.sprite.isReady = false;

        this.sprite.onload = () => {
            this.sprite.isReady = true;
        };

        this.sprite.onerror = () => {
            console.error();
        };

        this.bulletCooldown = 0;

        this.color = getColorFromImagePath(imagePath);
    
    }

    move(direction) {
        this.x += this.vx * direction;

        if (this.x < 0) { 
            this.x = 0;
        }

        if (this.x + this.w > CANVAS_W) {
            this.x = CANVAS_W - this.w;
        }

       
    }

    moveDown() {
        this.y += this.vy;
    }

    draw() {
        if(!this.alive) return;

        if(this.sprite.isReady) {
            this.ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
        } else {
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }

    tryToFire(enemyBullets) {
        if(this.bulletCooldown > 0) {
            this.bulletCooldown--;
        }
        const fireProbability = 0.001; 

        if (Math.random() < fireProbability && this.bulletCooldown === 0) {
            this.fire(enemyBullets);
            this.bulletCooldown = 100; 
        }
    }

    fire(enemyBullets) {
        const bulletX = this.x + this.w / 2 - 1.5;
        const bulletY = this.y + this.h;0
        enemyBullets.push(new EnemyBullet(this.ctx, bulletX, bulletY, this.color));

        if (this.game && this.game.shootMusic) { 
            this.game.shootMusic.currentTime = 0; 
            this.game.shootMusic.play().catch((error) => {
                console.log("No se pudo reproducir invaderKilledMusic automáticamente:", error);
            });
        }
    }

    hit(damage = 10) {
        this.alive = false;
        
        if (this.game && this.game.invaderKilledMusic) { 
            this.game.invaderKilledMusic.currentTime = 0; 
            this.game.invaderKilledMusic.play().catch((error) => {
                console.log("No se pudo reproducir invaderKilledMusic automáticamente:", error);
            });
        }
    }  
}