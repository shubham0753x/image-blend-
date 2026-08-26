const source_upload = document.getElementById("source_upload");
const target_upload = document.getElementById("target_upload");

const source_image = document.getElementById("source_image");
const target_image = document.getElementById("target_image");

const source_canvas = document.getElementById("source_canvas");
const target_canvas = document.getElementById("target_canvas");
const drawing_canvas = document.getElementById("drawing_canvas");

const source_preview = document.getElementById("source_preview");
const target_preview = document.getElementById("target_preview");
const mask_btn = document.getElementById("mask_btn");

let count = 0;

function setupUpload(uploadBox, imageInput, canvas, preview,overlayCanvas) {

    // Click to open file picker
    uploadBox.addEventListener("click", () => {
        imageInput.click();
    });

    // File selected using file picker
    imageInput.addEventListener("change", () => {
        if (imageInput.files.length > 0) {
            preview.style.display = 'flex';
            const file = imageInput.files[0];
            const image = new Image();

            image.src = URL.createObjectURL(file);
            image.onload = () => {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                if (overlayCanvas) {
                    overlayCanvas.width = image.naturalWidth;
                    overlayCanvas.height = image.naturalHeight;
                }

                const ctx = canvas.getContext("2d");

                ctx.drawImage(image, 0, 0);
            };

            uploadBox.style.display = 'none';
            count++;
            if(count>1)mask_btn.style.display = "inline-block";

        }
    });

    // Drag over
    uploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadBox.classList.add("dragover");
    });

    // Drag leave
    uploadBox.addEventListener("dragleave", () => {
        uploadBox.classList.remove("dragover");
    });

    // Drop
    uploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadBox.classList.remove("dragover");

        const file = e.dataTransfer.files[0];

        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;

            uploadBox.style.display = 'none';
            imageInput.dispatchEvent(new Event("change"));
        }
    });
}

setupUpload(source_upload, source_image, source_canvas, source_preview,drawing_canvas);
setupUpload(target_upload, target_image, target_canvas, target_preview,null);
