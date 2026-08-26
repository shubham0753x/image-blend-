from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware


from PIL import Image
import io
import numpy as np

from preprocessing import (
    prepare_laplacian_input,
    put_roi_back
)

from laplacian import laplacian_blend


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/blend")
async def blend(
    selected_image: UploadFile = File(...),
    target_image: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...),
    algorithm: str = Form(...)
):

    # --------------------------------
    # 1. Read uploaded files
    # --------------------------------

    selected_bytes = await selected_image.read()
    target_bytes = await target_image.read()


    # --------------------------------
    # 2. Decode images
    # --------------------------------

    selected_pil = Image.open(
        io.BytesIO(selected_bytes)
    ).convert("RGBA")

    target_pil = Image.open(
        io.BytesIO(target_bytes)
    ).convert("RGB")


    # --------------------------------
    # 3. Convert to NumPy
    # --------------------------------

    selected = np.array(selected_pil)
    target = np.array(target_pil)


    # --------------------------------
    # 4. Separate source and mask
    # --------------------------------

    source = selected[:, :, :3]

    mask = selected[:, :, 3] / 255.0


    # --------------------------------
    # 5. Select algorithm
    # --------------------------------

    if algorithm == "laplacian":

        data = prepare_laplacian_input(
            source,
            target,
            mask,
            x,
            y
        )

      
        # Get preprocessing results
        source_roi = data["source_roi"]
        target_roi = data["target_roi"]
        mask_roi = data["mask_roi"]

        roi_x = data["roi_x"]
        roi_y = data["roi_y"]

        levels = data["levels"]


        # --------------------------------
        # 6. Run Laplacian blending
        # --------------------------------

        blended_roi = laplacian_blend(
            source_roi,
            target_roi,
            mask_roi,
            levels
        )


        # --------------------------------
        # 7. Put ROI back into target
        # --------------------------------

        result = put_roi_back(
            target,
            blended_roi,
            roi_x,
            roi_y
        )


    elif algorithm == "poisson":

        # We'll implement this later
        raise NotImplementedError(
            "Poisson blending is not implemented yet."
        )


    else:

        raise ValueError(
            f"Unknown algorithm: {algorithm}"
        )


    # --------------------------------
    # 8. Convert result to uint8
    # --------------------------------

    result = np.clip(
        result,
        0,
        255
    ).astype(np.uint8)


    # --------------------------------
    # 9. Convert NumPy → PNG
    # --------------------------------

    result_pil = Image.fromarray(
        result,
        mode="RGB"
    )

    output = io.BytesIO()

    result_pil.save(
        output,
        format="PNG"
    )

    output.seek(0)


    # --------------------------------
    # 10. Return image
    # --------------------------------

    from fastapi.responses import StreamingResponse

    return StreamingResponse(
        output,
        media_type="image/png"
    )