const retry_btn = document.getElementById("retry_btn");
const continue_btn = document.getElementById("continue_btn");
const algorith_selection = document.getElementById("algorithm_selection");
const blend_btn = document.getElementById("blend_btn");


function createBoundedSelection(sourceCanvas, drawingCanvas) {
    const drawingCtx = drawingCanvas.getContext("2d");

    const width = drawingCanvas.width;
    const height = drawingCanvas.height;

    const drawingData = drawingCtx.getImageData(
        0,
        0,
        width,
        height
    );

    const data = drawingData.data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    // Find bounding box of selected region
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const index = (y * width + x) * 4;
            const alpha = data[index + 3];

            if (alpha > 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    // Nothing selected
    if (maxX === -1) {
        return null;
    }

    const boundedWidth = maxX - minX + 1;
    const boundedHeight = maxY - minY + 1;

    // Create cropped canvas
    const boundedCanvas = document.createElement("canvas");

    boundedCanvas.width = boundedWidth;
    boundedCanvas.height = boundedHeight;

    const boundedCtx = boundedCanvas.getContext("2d");

    // Draw the corresponding source-image region
    boundedCtx.drawImage(
        sourceCanvas,

        // Source rectangle
        minX,
        minY,
        boundedWidth,
        boundedHeight,

        // Destination rectangle
        0,
        0,
        boundedWidth,
        boundedHeight
    );

    // Keep source pixels only where drawing canvas is opaque
    boundedCtx.globalCompositeOperation = "destination-in";

    boundedCtx.drawImage(
        drawingCanvas,

        // Source rectangle
        minX,
        minY,
        boundedWidth,
        boundedHeight,

        // Destination rectangle
        0,
        0,
        boundedWidth,
        boundedHeight
    );

    // Restore normal drawing mode
    boundedCtx.globalCompositeOperation = "source-over";

    return boundedCanvas;
}

let selectedCanvas = null;
let originalWidth;
let originalHeight;
let selectedScale = 1;


mask_btn.addEventListener("click", () => {

    selectedCanvas = createBoundedSelection(
        source_canvas,
        drawing_canvas
    );

    if (!selectedCanvas) {
        alert("Please select something first.");
        return;
    }


    selectedCanvas.classList.add("selected_canvas");

    source_preview.appendChild(selectedCanvas);

    source_canvas.style.display = "none";
    drawing_canvas.style.display = "none";

    mask_btn.style.display = "none";
    retry_btn.style.display = "inline-block";
    continue_btn.style.display = "inline-block";

});

retry_btn.addEventListener("click", () => {
    // source_image.dispatchEvent(new Event("change"));
    // target_image.dispatchEvent(new Event("change"));
    mask_btn.style.display = "inline-block";
    retry_btn.style.display = "none";
    continue_btn.style.display = "none";
    drawing_canvas.style.display = "block";
    source_canvas.style.display = "block";
    selectedCanvas.remove();
    selectedCanvas = null;
    

});

continue_btn.addEventListener("click", () => {

    target_preview.appendChild(selectedCanvas);

    selectedX =
        (target_canvas.width - selectedCanvas.width) / 2;

    selectedY =
        (target_canvas.height - selectedCanvas.height) / 2;

     originalWidth = selectedCanvas.width;
    originalHeight = selectedCanvas.height;

     selectedScale = 1;

    updateSelectedPosition();
    retry_btn.style.display = "none";
    continue_btn.style.display = "none";
    setupPlacement();
    algorith_selection.style.display = "flex"
    blend_btn.style.display = "inline-block";
    upload_container.style.gridTemplateColumns = "1fr";
    source_preview.style.display = 'none'
});
