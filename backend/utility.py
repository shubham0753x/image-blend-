import numpy as np


def gaussian_kernel(size=5, sigma=1.0):

    if size % 2 == 0:
        raise ValueError("Kernel size must be odd.")

    if sigma <= 0:
        raise ValueError("Sigma must be positive.")

    center = size // 2

    x = np.arange(-center, center + 1)
    y = np.arange(-center, center + 1)

    X, Y = np.meshgrid(x, y)

    kernel = np.exp(
        -(X**2 + Y**2) / (2 * sigma**2)
    )

    kernel /= kernel.sum()

    return kernel

def convolve(image, kernel):

    kernel_height, kernel_width = kernel.shape

    pad_height = kernel_height // 2
    pad_width = kernel_width // 2

    if image.ndim == 2:

        padded = np.pad(
            image,
            (
                (pad_height, pad_height),
                (pad_width, pad_width)
            ),
            mode="reflect"
        )

        output = np.zeros_like(
            image,
            dtype=float
        )

        for i in range(image.shape[0]):
            for j in range(image.shape[1]):

                region = padded[
                    i:i + kernel_height,
                    j:j + kernel_width
                ]

                output[i, j] = np.sum(
                    region * kernel
                )

    elif image.ndim == 3:

        padded = np.pad(
            image,
            (
                (pad_height, pad_height),
                (pad_width, pad_width),
                (0, 0)
            ),
            mode="reflect"
        )

        output = np.zeros_like(
            image,
            dtype=float
        )

        for i in range(image.shape[0]):
            for j in range(image.shape[1]):

                region = padded[
                    i:i + kernel_height,
                    j:j + kernel_width,
                    :
                ]

                output[i, j] = np.sum(
                    region * kernel[:, :, np.newaxis],
                    axis=(0, 1)
                )

    else:
        raise ValueError(
            "Image must be 2D or 3D."
        )

    return output


def gaussian_blur(image, size=5, sigma=1.0):

    kernel = gaussian_kernel(size, sigma)

    return convolve(image, kernel)
