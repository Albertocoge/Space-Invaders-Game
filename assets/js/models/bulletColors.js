function getColorFromImagePath(imagePath) {
    if (imagePath.includes("magenta")) return "#FF00FF";
    if (imagePath.includes("yellow")) return "#FFFF00";
    if (imagePath.includes("cyan")) return "#00FFFF";
    if (imagePath.includes("white")) return "#FFFFFF";
    
    // Color por defecto
    return "#0000FF";
}

window.getColorFromImagePath = getColorFromImagePath;