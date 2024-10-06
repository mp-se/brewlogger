import logging
import numpy
from typing import List
from api.db import schemas
import warnings

logger = logging.getLogger(__name__)


def create_formula(order, points=List[schemas.FormulaPoint]):
    logger.info(f"Creating formula based on {len(points)} points and {order}")
    warnings.filterwarnings("error")

    x = []
    y = []

    for p in points:
        if p.a > 0:  # Ignore angles of Zero
            x.append(float(p.a))
            y.append(float(p.g))

    if len(x) == 0:
        logger.error("Too few values supplied for poly")
        return ""

    try:
        poly = numpy.polyfit(x, y, order, full=False)
    except numpy.exceptions.RankWarning:
        logger.error("Failed to create poly for supplied values")
        return ""

    result = ""

    if order == 4:
        result = f"{poly[0]:.8f}*tilt^4+{poly[1]:.8f}*tilt^3+{poly[2]:.8f}*tilt^2+{poly[3]:.8f}*tilt+{poly[4]:.8f}"
    elif order == 3:
        result = f"{poly[0]:.8f}*tilt^3+{poly[1]:.8f}*tilt^2+{poly[2]:.8f}*tilt+{poly[3]:.8f}"
    elif order == 2:
        result = f"{poly[0]:.8f}*tilt^2+{poly[1]:.8f}*tilt+{poly[2]:.8f}"
    else:
        result = f"{poly[0]:.8f}*tilt+{poly[1]:.8f}"

    return result.replace("+-", "-")
