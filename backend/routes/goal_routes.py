from flask import Blueprint
from controllers.goal_controller import get_today_goal, get_goal_by_date, upsert_goal, update_goal
from middleware.auth_middleware import token_required

goal_bp = Blueprint("goals", __name__, url_prefix="/api/goals")

goal_bp.route("/today", methods=["GET"])(token_required(get_today_goal))
goal_bp.route("/date/<date>", methods=["GET"])(token_required(get_goal_by_date))
goal_bp.route("", methods=["POST"])(token_required(upsert_goal))
goal_bp.route("/<goal_id>", methods=["PUT"])(token_required(update_goal))
