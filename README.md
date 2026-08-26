# Image Blend
---
This is an interactive webpage where you can upload any two images and blend them seamlessly selecting any part of source image and place it anywhere on target image.
Currently I have implemented Laplacian pyramid using NumPy. I will soon add Poisson editing which is a more advanced technique.

## Laplacian pyramid
---
Laplace pyramid finds out important edges at different resolution of image lowering the resolution of both image at each. 
As the mask gets smaller in the pyramid, the transition line becomes heavily blurred. This means your high-detail layers get a sharp, hard-cut mask, while your low-detail color layers get a very soft, faded mask.

## Poisson editing (Coming soon)
---
This maintains the gradient or edges inside the source image and on the boundary, it matches the exact color of the adjacent target image pixel

##  Tech Stack
*   **Backend:** Python, FastAPI, NumPy
*   **Frontend:** HTML, CSS, JavaScript (Interactive UI and Canvas masking)
