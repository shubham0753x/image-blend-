import numpy as np
from laplacian import calculate_levels


def prepare_laplacian_input(source, target, mask, x, y):
    """
    source: (Hs, Ws, 3)
    target: (Ht, Wt, 3)
    mask:   (Hs, Ws), values in [0, 1]
    x, y:   source position in target coordinates
    """

    levels = calculate_levels(source)
    margin = 2**levels
    source_h, source_w = source.shape[:2]
    target_h, target_w = target.shape[:2]

    # Desired ROI around source
    roi_left = int(x) - margin
    roi_top = int(y) - margin

    roi_right = int(x) + source_w + margin
    roi_bottom = int(y) + source_h + margin

    # Clip ROI to target boundaries
    roi_left_clipped = max(0, roi_left)
    roi_top_clipped = max(0, roi_top)

    roi_right_clipped = min(target_w, roi_right)
    roi_bottom_clipped = min(target_h, roi_bottom)

    # Extract target ROI
    target_roi = target[
        roi_top_clipped:roi_bottom_clipped,
        roi_left_clipped:roi_right_clipped
    ]

    # Position of source inside the actual ROI
    source_x = int(x) - roi_left_clipped
    source_y = int(y) - roi_top_clipped

    # Create source-sized arrays matching the target ROI
    roi_h, roi_w = target_roi.shape[:2]

    source_roi = np.zeros(
        (roi_h, roi_w, 3),
        dtype=float
    )

    mask_roi = np.zeros(
        (roi_h, roi_w),
        dtype=float
    )

    # Determine overlap in case source itself goes outside target
    src_x1 = max(0, -source_x)
    src_y1 = max(0, -source_y)

    src_x2 = min(
        source_w,
        roi_w - source_x
    )

    src_y2 = min(
        source_h,
        roi_h - source_y
    )

    if src_x1 < src_x2 and src_y1 < src_y2:

        dst_x1 = source_x + src_x1
        dst_y1 = source_y + src_y1

        dst_x2 = dst_x1 + (src_x2 - src_x1)
        dst_y2 = dst_y1 + (src_y2 - src_y1)

        source_roi[
            dst_y1:dst_y2,
            dst_x1:dst_x2
        ] = source[
            src_y1:src_y2,
            src_x1:src_x2
        ]

        mask_roi[
            dst_y1:dst_y2,
            dst_x1:dst_x2
        ] = mask[
            src_y1:src_y2,
            src_x1:src_x2
        ]

    return {
    "target_roi": target_roi,
    "source_roi": source_roi,
    "mask_roi": mask_roi,
    "roi_x": roi_left_clipped,
    "roi_y": roi_top_clipped,
    "levels": levels
}
def put_roi_back(target, blended_roi, roi_x, roi_y):

    result = target.copy()

    roi_h, roi_w = blended_roi.shape[:2]

    result[
        roi_y:roi_y + roi_h,
        roi_x:roi_x + roi_w
    ] = blended_roi

    return result