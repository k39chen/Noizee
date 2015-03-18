window.IMAGE_FIT = {
    // scale types
    NONE: "none",
    FILL: "fill",
    BEST_FILL: "best-fill",
    BEST_FIT: "best-fit",
    BEST_FIT_DOWN_ONLY: "best-fit-down",
    
    // align types
    ALIGN_LEFT: 'left',
    ALIGN_RIGHT: 'right',
    ALIGN_CENTER: 'center',
    ALIGN_TOP: 'top',
    ALIGN_BOTTOM: 'bottom',
    ALIGN_TOP_LEFT: 'top-left',
    ALIGN_TOP_RIGHT: 'top-right',
    ALIGN_BOTTOM_LEFT: 'bottom-left',
    ALIGN_BOTTOM_RIGHT: 'bottom-right',
};
/**
 * Returns a frame (x, y, width, height) fitting the source size (sourceWidth & sourceHeight) within the
 * destination size (destWidth & destHeight) according to the align and scale properties.
 *
 * @method innerFrame
 * @param scale {String}
 * @param align {String}
 * @param sourceWidth {Number}
 * @param sourceHeight {Number}
 * @param destWidth {Number}
 * @param destHeight {Number}
 * @returns {Object} the inner frame with properties: { x: value, y: value, width: value, height: value }
 */
window.computeImageFit = function(scale, align, sourceWidth, sourceHeight, destWidth, destHeight) {
    // start by defining the base object for the inner frame specifications
    var result = {
        x: 0,
        y: 0,
        width: destWidth,
        height: destHeight
    };
    if (scale === IMAGE_FIT.FILL) return result;

    // Determine the appropriate scale
    var scaleX = destWidth / sourceWidth;
    var scaleY = destHeight / sourceHeight;

    // compute the scale factor as prescribed by the requested scale type
    switch (scale) {
    case IMAGE_FIT.BEST_FIT_DOWN_ONLY:
        if ((sourceWidth > destWidth) || (sourceHeight > destHeight)) {
            scale = scaleX < scaleY ? scaleX : scaleY;
        } else {
            scale = 1.0;
        }
        break;
    case IMAGE_FIT.BEST_FIT:
        scale = scaleX < scaleY ? scaleX : scaleY;
        break;
    case IMAGE_FIT.NONE:
        scale = 1.0;
        break;
    case IMAGE_FIT.BEST_FILL:
        /* falls through */
    default:
        scale = scaleX > scaleY ? scaleX : scaleY;
        break;
    }
    // compute the target source dimensions accordingly
    sourceWidth *= scale;
    sourceHeight *= scale;

    // publish these dimensions
    result.width = Math.round(sourceWidth);
    result.height = Math.round(sourceHeight);

    // align the image within its frame
    switch (align) {
    case IMAGE_FIT.ALIGN_LEFT:
        result.x = 0;
        result.y = (destHeight - sourceHeight) / 2;
        break;
    case IMAGE_FIT.ALIGN_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = (destHeight - sourceHeight) / 2;
        break;
    case IMAGE_FIT.ALIGN_TOP:
        result.x = (destWidth - sourceWidth) / 2;
        result.y = 0;
        break;
    case IMAGE_FIT.ALIGN_BOTTOM:
        result.x = (destWidth - sourceWidth) / 2;
        result.y = destHeight - sourceHeight;
        break;
    case IMAGE_FIT.ALIGN_TOP_LEFT:
        result.x = 0;
        result.y = 0;
        break;
    case IMAGE_FIT.ALIGN_TOP_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = 0;
        break;
    case IMAGE_FIT.ALIGN_BOTTOM_LEFT:
        result.x = 0;
        result.y = destHeight - sourceHeight;
        break;
    case IMAGE_FIT.ALIGN_BOTTOM_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = destHeight - sourceHeight;
        break;
    case IMAGE_FIT.ALIGN_CENTER:
        /* falls through */
    default:
        result.x = (destWidth - sourceWidth) / 2;
        result.y = (destHeight - sourceHeight) / 2;
        break;
    }
    return result;
};
