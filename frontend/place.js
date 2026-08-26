let selectedX;
let selectedY
let isDragging = false;

let dragStartX;
let dragStartY;

const result_container =
    document.getElementById("result_container");


function updateSelectedPosition() {
    const targetRect = target_canvas.getBoundingClientRect();
    
    // Get the bounding box of the parent container holding the absolute positioned canvas
    const previewRect = target_preview.getBoundingClientRect(); 

    // Calculate the scale ratios
    const scaleX = targetRect.width / target_canvas.width;
    const scaleY = targetRect.height / target_canvas.height;

    // Calculate how far the canvas is pushed away from the top/left of its container
    const offsetX = targetRect.left - previewRect.left;
    const offsetY = targetRect.top - previewRect.top;

    // Reset any CSS properties that might interfere with absolute positioning
    selectedCanvas.style.position = "absolute";
    selectedCanvas.style.transform = "none"; 
    selectedCanvas.style.margin = "0";

    // Add the visual offset to the scaled internal coordinates
    selectedCanvas.style.left = (selectedX * scaleX + offsetX) + "px";
    selectedCanvas.style.top = (selectedY * scaleY + offsetY) + "px";

    selectedCanvas.style.width = originalWidth * selectedScale * scaleX + "px";
    selectedCanvas.style.height = originalHeight * selectedScale * scaleY + "px";
}

function setupPlacement() {

    selectedCanvas.addEventListener("pointerdown", (event) => {

        isDragging = true;

        selectedCanvas.setPointerCapture(event.pointerId);

        dragStartX = event.clientX;
        dragStartY = event.clientY;
    });

    selectedCanvas.addEventListener("pointermove", (event) => {

        if (!isDragging) return;

        const targetRect = target_canvas.getBoundingClientRect();

        const scaleX = target_canvas.width / targetRect.width;
        const scaleY = target_canvas.height / targetRect.height;

        const dx = (event.clientX - dragStartX) * scaleX;
        const dy = (event.clientY - dragStartY) * scaleY;

        selectedX += dx;
        selectedY += dy;

        dragStartX = event.clientX;
        dragStartY = event.clientY;

        updateSelectedPosition();

      
    });

    selectedCanvas.addEventListener("pointerup", () => {
        isDragging = false;
    });

    selectedCanvas.addEventListener("wheel", (event) => {
        event.preventDefault();

        // Current center in target-image coordinates
        const centerX =
            selectedX +
            (originalWidth * selectedScale) / 2;

        const centerY =
            selectedY +
            (originalHeight * selectedScale) / 2;

        // Change scale
        const zoomFactor = Math.exp(-event.deltaY * 0.002);

        selectedScale *= zoomFactor;

        selectedScale = Math.max(
            0.1,
            Math.min(selectedScale, 5)
        );

        // New dimensions
        const newWidth =
            originalWidth * selectedScale;

        const newHeight =
            originalHeight * selectedScale;

        // Keep center fixed
        selectedX = centerX - newWidth / 2;
        selectedY = centerY - newHeight / 2;

        updateSelectedPosition();
    });

    blend_btn.style.display = "inline-block";

   

}

function getScaledSelectedCanvas() {

    const width = Math.round(
        originalWidth * selectedScale
    );

    const height = Math.round(
        originalHeight * selectedScale
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        selectedCanvas,
        0,
        0,
        width,
        height
    );

    return canvas;
}


blend_btn.addEventListener("click", async () => {


    // Get selected algorithm
    const selectedAlgorithm =
        document.querySelector(
            'input[name="algorithm"]:checked'
        );

    if (!selectedAlgorithm) {
        alert("Please select a blending algorithm.");
        return;
    }

    const algorithm = selectedAlgorithm.value;

    // Convert selected canvas to PNG
    const scaledCanvas = getScaledSelectedCanvas();

    const selectedBlob = await new Promise((resolve) => {
        scaledCanvas.toBlob(
            resolve,
            "image/png"
        );
    });
    // Convert target canvas to PNG
    const targetBlob = await new Promise((resolve) => {
        target_canvas.toBlob(
            resolve,
            "image/png"
        );
    });

    // Make sure conversion succeeded
    if (!selectedBlob || !targetBlob) {
        alert("Could not prepare images.");
        return;
    }

    // Create request data
    const formData = new FormData();

    formData.append(
        "selected_image",
        selectedBlob,
        "selected.png"
    );

    formData.append(
        "target_image",
        targetBlob,
        "target.png"
    );


    formData.append(
        "x",
        selectedX
    );

    formData.append(
        "y",
        selectedY
    );

    formData.append(
        "algorithm",
        algorithm
    );

    try {

    blend_btn.disabled = true;
    blend_btn.textContent = "Blending...";

    const response = await fetch(
        "http://localhost:8000/blend",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(
            `Backend returned ${response.status}`
        );
    }

    const resultBlob = await response.blob();

    const resultURL =
        URL.createObjectURL(resultBlob);

    result_image.src = resultURL;

    result_container.style.display = "flex";

    // Hide editing interface
    upload_container.style.display = "none";
    source_preview.style.display = "none";
    target_preview.style.display = "none";
    document.querySelector(".buttons_wrap").style.display = "none";
    algorith_selection.style.display = "none";
    blend_btn.style.display = "none";

    download_btn.style.display = "inline-block";

} catch (error) {

    console.error(error);

    alert(
        "Something went wrong while blending."
    );

    // Let the user try again
    blend_btn.disabled = false;
    blend_btn.textContent = "Blend";
}
});
