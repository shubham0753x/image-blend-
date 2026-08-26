import numpy as np
from utility import gaussian_blur, gaussian_kernel, convolve


def downsample(image):
    return image[::2, ::2]

def upsample(image, kernel):

    height, width = image.shape[:2]

    if image.ndim == 2:
        expanded = np.zeros(
            (height * 2, width * 2),
            dtype=float
        )
    else:
        expanded = np.zeros(
            (height * 2, width * 2, image.shape[2]),
            dtype=float
        )

    # Put original pixels at even coordinates
    expanded[::2, ::2] = image

    # Scale kernel for pyramid expansion
    kernel = kernel * 4

    # Smooth/interpolate
    expanded = convolve(expanded, kernel)

    return expanded

def gaussian_pyramid(image, levels):

    pyramid = [image]

    kernel = gaussian_kernel(5, 1.0)

    current = image

    for _ in range(levels - 1):

        blurred = convolve(current, kernel)

        current = downsample(blurred)

        pyramid.append(current)

    return pyramid


def laplacian_pyramid(gaussian_pyr, kernel):

    laplacian_pyr = []

    for i in range(len(gaussian_pyr) - 1):

        expanded = upsample(
            gaussian_pyr[i + 1],
            kernel
        )

        # Make sure dimensions match
        expanded = expanded[
            :gaussian_pyr[i].shape[0],
            :gaussian_pyr[i].shape[1]
        ]

        laplacian = (
            gaussian_pyr[i] - expanded
        )

        laplacian_pyr.append(laplacian)

    # Coarsest Gaussian level
    laplacian_pyr.append(
        gaussian_pyr[-1]
    )

    return laplacian_pyr


def blend_pyramids(
    source_pyramid,
    target_pyramid,
    mask_pyramid
):

    blended_pyramid = []

    for source_level, target_level, mask_level in zip(
        source_pyramid,
        target_pyramid,
        mask_pyramid
    ):

        mask_level = mask_level[:, :, np.newaxis]

        blended = (
            mask_level * source_level
            + (1 - mask_level) * target_level
        )

        blended_pyramid.append(blended)

    return blended_pyramid


def reconstruct(laplacian_pyramid, kernel):

    image = laplacian_pyramid[-1]

    for i in range(len(laplacian_pyramid) - 2, -1, -1):

        expanded = upsample(image, kernel)

        # Match dimensions in case of odd image sizes
        expanded = expanded[
            :laplacian_pyramid[i].shape[0],
            :laplacian_pyramid[i].shape[1]
        ]

        image = laplacian_pyramid[i] + expanded

    return image

def calculate_levels(source, min_size=32):

    height, width = source.shape[:2]

    levels = 1

    while min(height, width) >= 2 * min_size:
        height //= 2
        width //= 2
        levels += 1

    return levels

def laplacian_blend(source, target_roi, mask, levels):

    # Determine a common number of pyramid levels

    # Gaussian kernel used for pyramid operations
    kernel = gaussian_kernel(5, 1.0)

    # Build Gaussian pyramids
   # --- FIX: replace source background (mask ≈ 0) with target content ---
    # so that low-frequency pyramid levels don't leak arbitrary source-background
    # color (e.g. the white padding around the cutout) into the blend.
    mask3 = mask[:, :, np.newaxis]
    source = mask3 * source + (1 - mask3) * target_roi

    source_gaussian = gaussian_pyramid(source, levels)
    target_gaussian = gaussian_pyramid(target_roi, levels)
    mask_gaussian   = gaussian_pyramid(mask, levels)

    # Build Laplacian pyramids
    source_laplacian = laplacian_pyramid(
        source_gaussian,
        kernel
    )

    target_laplacian = laplacian_pyramid(
        target_gaussian,
        kernel
    )

    # Blend corresponding pyramid levels
    blended_laplacian = blend_pyramids(
        source_laplacian,
        target_laplacian,
        mask_gaussian
    )

    # Reconstruct the final blended ROI
    result = reconstruct(
        blended_laplacian,
        kernel
    )

    return result