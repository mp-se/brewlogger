import logging
import numpy
from typing import List
from api.db import schemas
import warnings

logger = logging.getLogger(__name__)

def create_formula(order, points = List[schemas.FormulaPoint]):
    logger.info(f"Creating formula based on {len(points)} points and {order}")
    warnings.filterwarnings("error")

    x = []
    y = []

    for p in points:
        x.append(p.angle)
        y.append(p.gravity)

    try:
        poly = numpy.polyfit(x, y, order, full = False)
    except numpy.exceptions.RankWarning as e:
        logger.error("Failed to create poly for supplied values")
        return ""

    if order == 4:
        return f"{poly[0]:.8f}*tilt^4+{poly[1]:.8f}*tilt^3+{poly[2]:.8f}*tilt^2+{poly[3]:.8f}*tilt+{poly[4]:.8f}"
    elif order == 3:
        return f"{poly[0]:.8f}*tilt^3+{poly[1]:.8f}*tilt^2+{poly[2]:.8f}*tilt+{poly[3]:.8f}"
    elif order == 2:
        return f"{poly[0]:.8f}*tilt^2+{poly[1]:.8f}*tilt+{poly[2]:.8f}"
    else:
        return f"{poly[0]:.8f}*tilt+{poly[1]:.8f}"

