// const drawing_canvas = document.getElementById("drawing_canvas");
let currentStroke = null;

const strokes = [];
const drawCntx = drawing_canvas.getContext("2d");

let isDrawing = false;



drawing_canvas.addEventListener("pointerdown", (event) => {
    isDrawing = true;

    const rect = drawing_canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) *
        (drawing_canvas.width / rect.width);

    const y = (event.clientY - rect.top) *
        (drawing_canvas.height / rect.height);

    currentStroke = {
        points: [{ x, y }]
    };

    drawCntx.strokeStyle = "red";
    drawCntx.lineWidth = 2;
    drawCntx.lineCap = "round";
    drawCntx.lineJoin = "round";

    drawCntx.beginPath();
    drawCntx.moveTo(x, y);
});

drawing_canvas.addEventListener("pointermove", (event) => {
    if (!isDrawing) return;

    const rect = drawing_canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) *
        (drawing_canvas.width / rect.width);

    const y = (event.clientY - rect.top) *
        (drawing_canvas.height / rect.height);

    currentStroke.points.push({ x, y });

    drawCntx.lineTo(x, y);
    drawCntx.stroke();
});

drawing_canvas.addEventListener("pointerup", () => {
    if (!isDrawing) return;

    isDrawing = false;

    drawCntx.closePath();

    drawCntx.fillStyle = "red";
    drawCntx.fill();

    strokes.push(currentStroke);

    currentStroke = null;
});

let undo_stack = [];

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "z") {
        event.preventDefault();

        if (undo_stack.length > 0) {
            const previousState = undo_stack.pop();

            drawCntx.putImageData(previousState, 0, 0);
        }
    }
});

function redraw() {

    drawCntx.clearRect(
        0,
        0,
        drawing_canvas.width,
        drawing_canvas.height
    );

    for (const stroke of strokes) {

        drawCntx.beginPath();

        const firstPoint = stroke.points[0];

        drawCntx.moveTo(
            firstPoint.x,
            firstPoint.y
        );

        for (let i = 1; i < stroke.points.length; i++) {

            const point = stroke.points[i];

            drawCntx.lineTo(
                point.x,
                point.y
            );
        }

        drawCntx.stroke();

        drawCntx.closePath();

        drawCntx.fill();
    }
}

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "z") {

        event.preventDefault();

        if (strokes.length === 0) return;

        strokes.pop();

        redraw();
    }
});