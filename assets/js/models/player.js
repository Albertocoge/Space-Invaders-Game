class Player {

    constructor(ctx, x, y) {
        this.ctx = ctx;

        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.vx = SPEED_MOVE;
        this.y = y;
        this.w = 45;
        this.h = 25; 

        this.movements = {
            right: false,
            left: false,
            isShutting: false,
            firePressed: false
        }

        this.bullets = [];

        this.health = 100;
        
        this.sprite = new Image();
        this.sprite.src = "./assets/img/cannon.png";
        this.sprite.isReady = false;

        this.sprite.onload = () => {
            this.sprite.isReady = true;
        }
            
    }

    hit(damage = 20) {
        this.health -= damage;
        if(this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.bullets = [];
        this.movements = {
            right: false,
            left: false,
            isShutting: false,
            firePressed: false
        }
       
    }

    destroy(){}

    



    onKeyEvent(event) { 
        const isKeyDown = event.type === "keydown";
        const isKeyUp = event.type === "keyup";
        switch(event.keyCode) {
            case KEY_RIGHT:
                this.movements.right = isKeyDown;
                break;
            case KEY_LEFT:
                this.movements.left = isKeyDown;
                break;    
            case KEY_FIRE:
                if(isKeyDown) {
                    if(!this.movements.firePressed) {
                        this.fire();
                        this.movements.firePressed = true;
                    }
                }   else if(isKeyUp) {
                    this.movements.firePressed = false;
                }
                break;
        }    
    }

    fire() {
        
        const bulletX = this.x + this.w / 2 - 2.5;
        const bulletY = this.y;
        this.bullets.push(new Bullet(this.ctx, bulletX, bulletY)); 
        

    }

    clear() {
        this.bullets = this.bullets.filter((bullet) => bullet.x < this.ctx.canvas.width);
        
    }

    move() {
        this.bullets.forEach((bullet) => bullet.move());
        this.bullets = this.bullets.filter(bullet => bullet.active);

       if(this.movements.right) {
            this.x += this.vx;
       }else if (this.movements.left) {
            this.x -= this.vx;
       }

       if (this.x < 0) {
        this.x = 0;
       }

       const maxX = this.ctx.canvas.width - this.w;
       if (this.x > maxX) {
        this.x = maxX;
       }
    }

    draw() {
        if (this.sprite.isReady) {
            this.ctx.drawImage (
                this.sprite,
                this.x,
                this.y,
                this.w,
                this.h
            );
        }   else {
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(this.x, this.y, this.w, this.h);
        }
        
        this.bullets.forEach((bullet) => bullet.draw());
    }

  
}
