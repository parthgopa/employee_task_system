from flask import Blueprint
from controllers.history_controller import get_history_by_date, get_history_dates
from middleware.auth_middleware import token_required

history_bp = Blueprint("history", __name__, url_prefix="/api/history")

history_bp.route("", methods=["GET"])(token_required(get_history_dates))
history_bp.route("/<date>", methods=["GET"])(token_required(get_history_by_date))
