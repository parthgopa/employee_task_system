from flask import Blueprint
from controllers.analytics_controller import get_weekly_analytics, get_monthly_analytics, get_overall_stats
from middleware.auth_middleware import token_required

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

analytics_bp.route("/weekly", methods=["GET"])(token_required(get_weekly_analytics))
analytics_bp.route("/monthly", methods=["GET"])(token_required(get_monthly_analytics))
analytics_bp.route("/stats", methods=["GET"])(token_required(get_overall_stats))
