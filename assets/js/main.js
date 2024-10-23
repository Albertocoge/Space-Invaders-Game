

  window.addEventListener("load", () => {
    const game = new Game("main-canvas");
    game.drawMenu();

    document.addEventListener("keydown" , (event) => game.onKeyEvent(event));
    document.addEventListener("keyup" , (event) => game.onKeyEvent(event));

    const canvas = document.getElementById("main-canvas");
    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      game.handleCanvasClick(mouseX, mouseY);
    });
  }); 
