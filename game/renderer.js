class Renderer {

    render(gameState) {
        // Defining the canvas dimensions for fixed phone size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

    
        // Porpoerties of the borders of game
        const borderWidth = 20;
        const borderColor = "Black";

        context.fillStyle = borderColor;
        // Top Border
        context.fillRect(0, 0, canvas.width, borderWidth);
        //Bottom Border
        context.fillRect(0, canvas.height - borderWidth, canvas.width, borderWidth);
        // Left Border
        context.fillRect(0, 0, borderWidth, canvas.height);
        //Right Border
        context.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height);
    }
}