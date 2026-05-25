from flask import Blueprint
from controllers.alert_controller import get_overdue_tasks, get_alerts_summary, dismiss_alert
from middleware.auth_middleware import token_required

alert_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")

alert_bp.route("/overdue", methods=["GET"])(token_required(get_overdue_tasks))
alert_bp.route("/summary", methods=["GET"])(token_required(get_alerts_summary))
alert_bp.route("/<task_id>/dismiss", methods=["POST"])(token_required(dismiss_alert))
