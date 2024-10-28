

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

        this.score = 0;

        this.shields = [];
        this.createShields();

        this.shootMusic = document.getElementById('shootMusic');
        this.invaderKilledMusic = document.getElementById('invaderKilledMusic');
        

      

       
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

        //Mover balas del jugador

        this.player.bullets.forEach(bullet => bullet.move());
        this.player.bullets = this.player.bullets.filter(bullet => bullet.active);

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

            //Dibujo escudos
            this.shields.forEach(shield => shield.draw());

            //Dibujar puntuación
            this.drawScore();

            //Dibujar salud player
            this.drawHealth();
        
        } else if (this.state === GAME_STATES.GAMEOVER) {
            if (this.enemies.every(enemy => !enemy.alive)) {
                this.drawVictory();
            } else {
            this.drawGameOver();
            }
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
                this.game = this;
                this.enemies.push(enemy);
            }
        }
    }

    createShields() {
        const numberOfShields = 5;
        const shieldSpacing = (CANVAS_W - (numberOfShields * 70)) / (numberOfShields + 1); 
        const yPosition = this.canvas.height - 200; 

        for (let i = 0; i < numberOfShields; i++) {
            const xPosition = shieldSpacing + i * (70 + shieldSpacing); 
            const shield = new Shield(this.ctx, xPosition, yPosition);
            this.shields.push(shield);
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
        this.ctx.font = "20px Arial";
        this.ctx.fillText("PLAY", this.canvas.width / 2, this.canvas.height / 2 + 35);
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

        // Mostrar puntuación final
        this.ctx.fillStyle = "white";
        this.ctx.font = "24px Arial";
        this.ctx.fillRect(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);

        //Botón reiniciar
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillRect(this.canvas.width / 2 - 75, this.canvas.height / 2, 150, 50);

        //Texto botón reiniciar
        this.ctx.fillStyle = "black";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Restart", this.canvas.width / 2, this.canvas.height / 2 + 35);
    }

    drawVictory() {
        this.clear();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "green";
        this.ctx.font = "48px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("¡Ganaste!", this.canvas.width / 2, this.canvas.height / 2 - 50);

        // Mostrar la puntuación final
        this.ctx.fillStyle = "white";
        this.ctx.font = "24px Arial";
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);

        // Botón de Reiniciar
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillRect(this.canvas.width / 2 - 75, this.canvas.height / 2 + 50, 150, 50);

        // Texto del botón Reiniciar
        this.ctx.fillStyle = "black";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Reiniciar", this.canvas.width / 2, this.canvas.height / 2 + 85);
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
            const buttonX = this.state === GAME_STATES.GAMEOVER && this.enemies.every(enemy => !enemy.alive) 
                ? this.canvas.width / 2 - 75 
                : this.canvas.width / 2 - 75;
            const buttonY = this.state === GAME_STATES.GAMEOVER && this.enemies.every(enemy => !enemy.alive) 
            ? this.canvas.height / 2 + 50 
            : this.canvas.height / 2;
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

        this.score = 0;

        this.shields.forEach(shield => shield.reset());

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

            this.shields.forEach(shield => {
                if(shield.alive && this.isColliding(bullet, shield)){
                    bullet.active = false;
                    shield.hit();

                }
            })
        });
      //Método colisiones balas jugador y enemigos 

        this.player.bullets.forEach((bullet) => {
            this.enemies.forEach((enemy) => {
                if (enemy.alive && this.isColliding(bullet, enemy)) {
                    enemy.hit();
                    bullet.active = false;
                    this.score += 10;
                }
            });
            /*
            this.shields.forEach(shield => {
                if (shield.alive && this.isColliding(bullet, shield)) {
                    bullet.active = false;
                    shield.hit();
                }
        }); */
    });

        if(this.enemies.every(enemy => !enemy.alive)) {
            this.handleVictory();
        }
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

        if (this.player.health > 0) {
            // Reiniciar la posición del jugador
            this.player.reset();
        } else {
            // Game Over
            this.stop();
            this.state = GAME_STATES.GAMEOVER;
            this.drawGameOver();
        }
    }

    handleVictory() {
        this.stop();
        this.state = GAME_STATES.GAMEOVER;
        this.drawVictory();
    }

    drawScore() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    drawHealth() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "right";
        this.ctx.fillText(`Health: ${this.player.health}`, this.canvas.width - 10, 30);
    }

  
}
