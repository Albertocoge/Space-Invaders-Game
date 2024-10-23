

const GAME_STATES = {
    MENU: "MENU",
    PLAYING: "PLAYING",
    GAMEOVER: "GAMEOVER"
};

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.height = CANVAS_H;
        this.canvas.width = CANVAS_W;
        this.ctx = this.canvas.getContext("2d");

        this.fps = FPS;
        this.drawIntervalId = undefined;

        this.background = new Background(this.ctx);

        this.player = new Player(this.ctx, 380, 580); 

        this.enemies = [];
        this.createEnemies();

        this.enemyBullets = []; 

        this.enemyDirection = 1;
        this.directionChanged = false;

        this.state = GAME_STATES.MENU;
    }

    onKeyEvent(event) {
        if(this.state === GAME_STATES.PLAYING) {
            this.player.onKeyEvent(event);
        }
    }

    start() {
        if(!this.drawIntervalId) {
            this.drawIntervalId = setInterval(() => {
                this.clear();
                this.move();
                this.draw();
            }, this.fps);
        }
    }

    stop() {
        clearInterval(this.drawIntervalId);
        this.drawIntervalId = undefined;
    }

    move() {
        if(this.state !== GAME_STATES.PLAYING) return;

        this.player.move();
        this.background.move();

        if(this.shouldChangeDirection()) {
            if (!this.directionChanged) {
                this.enemyDirection *= -1;
                this.moveEnemiesDown();
                this.directionChanged = true;
            }
        } else {
            this.directionChanged = false;
        }

        
        this.enemies.forEach(enemy => {
            enemy.move(this.enemyDirection);
            enemy.tryToFire(this.enemyBullets)
        });

        // Mover balas de enemigos
        this.enemyBullets.forEach(bullet => bullet.move());
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);

        // Verificar colisiones entre balas de enemigos y el jugador
        this.checkCollisions();
    }

    draw() {
        if (this.state === GAME_STATES.MENU) {
            this.drawMenu();
        } else if (this.state === GAME_STATES.PLAYING) {
            this.background.draw();
            this.player.draw();
            this.enemies.forEach(enemy => enemy.draw());

            // Dibujar balas de enemigos
            this.enemyBullets.forEach(bullet => bullet.draw());
        } else if (this.state === GAME_STATES.GAMEOVER) {
            this.drawGameOver();
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.state === GAME_STATES.PLAYING) {
            this.player.clear();
        }
    }

    createEnemies() {
        const rows = 5;
        const cols = 11;
        const enemyWidth = 50;
        const enemyHeight = 35; 
        const padding = 10;
        const offsetX = 30;
        const offsetY = 30;

        const alienImages = [
            "/assets/img/alien-magenta.png", 
            "/assets/img/alien-yellow.png", 
            "/assets/img/alien-cyan.png", 
            "/assets/img/alien-white.png",
            "/assets/img/alien-white.png"
        ];

        for(let row = 0; row < rows; row++) {
            for(let col = 0; col < cols; col++) {
                const x = offsetX + col * (enemyWidth + padding);
                const y = offsetY + row * (enemyHeight + padding);
                const imagePath = alienImages[row % alienImages.length];
                const enemy = new Enemy(this.ctx, x, y, imagePath );
                this.enemies.push(enemy);
            }
        }
    }

    shouldChangeDirection() {
        for(let enemy of this.enemies) {
            if(
                (enemy.x + enemy.w + enemy.vx * this.enemyDirection >= CANVAS_W && this.enemyDirection === 1) ||
                (enemy.x + enemy.vx * this.enemyDirection <= 0 && this.enemyDirection === -1)
            ) {
                return true;
            }
        }
        return false;
    }   

    moveEnemiesDown() {
        this.enemies.forEach(enemy => {
            enemy.moveDown();
        
            if (enemy.y + enemy.h > CANVAS_H) {
                enemy.y = CANVAS_H - enemy.h;
               
                this.handlePlayerHit();
            }
        });
    }

    
    drawMenu() {
        this.clear();

       
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Título del juego
        this.ctx.fillStyle = "white";
        this.ctx.font = "48px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Space Invaders", this.canvas.width / 2, this.canvas.height / 2 - 50);

        // Botón Play
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillRect(this.canvas.width / 2 - 75, this.canvas.height / 2, 150, 50);

        // Texto del botón Play
        this.ctx.fillStyle = "black";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Play", this.canvas.width / 2, this.canvas.height / 2 + 35);
    }

    // Método para dibujar la pantalla de Game Over
    drawGameOver() {
        this.clear();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "red";
        this.ctx.font = "48px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 50);

        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillRect(this.canvas.width / 2 - 75, this.canvas.height / 2, 150, 50);

        this.ctx.fillStyle = "black";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Restart", this.canvas.width / 2, this.canvas.height / 2 + 35);
    }

    // Método para manejar clics en el canvas
    handleCanvasClick(x, y) {
        if (this.state === GAME_STATES.MENU) {
            const buttonX = this.canvas.width / 2 - 75;
            const buttonY = this.canvas.height / 2;
            const buttonWidth = 150;
            const buttonHeight = 50;

            if (
                x >= buttonX &&
                x <= buttonX + buttonWidth &&
                y >= buttonY &&
                y <= buttonY + buttonHeight
            ) {
                this.startGame();
            }
        } else if (this.state === GAME_STATES.GAMEOVER) {
            const buttonX = this.canvas.width / 2 - 75;
            const buttonY = this.canvas.height / 2;
            const buttonWidth = 150;
            const buttonHeight = 50;

            if (
                x >= buttonX &&
                x <= buttonX + buttonWidth &&
                y >= buttonY &&
                y <= buttonY + buttonHeight
            ) {
                this.restartGame();
            }
        }
    }

    // Método para iniciar el juego desde el menú
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.start();
    }

    // Método para reiniciar el juego
    restartGame() {
        // Reiniciar las propiedades del juego
        this.enemies = [];
        this.createEnemies();
        this.enemyBullets = [];
        this.player.reset();
        this.background.reset(); 

        this.state = GAME_STATES.PLAYING;
        this.start();
    }

    // Método para verificar colisiones entre balas de enemigos y el jugador
    checkCollisions() {
        this.enemyBullets.forEach((bullet) => {
            if (this.isColliding(bullet, this.player)) {
                bullet.active = false;
                this.handlePlayerHit();
            }
        });
    }

    // Método para verificar colisiones entre dos objetos
    isColliding(a, b) {
        return !(
            a.x > b.x + b.w ||
            a.x + a.w < b.x ||
            a.y > b.y + b.h ||
            a.y + a.h < b.y
        );
    }

    // Método para manejar el impacto en el jugador
    handlePlayerHit() {
        this.player.hit();

        if (this.player.lives > 0) {
            // Reiniciar la posición del jugador
            this.player.reset();
        } else {
            // Game Over
            this.stop();
            this.state = GAME_STATES.GAMEOVER;
            this.drawGameOver();
        }
    }
}
