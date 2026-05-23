from flask import Blueprint
from controllers.auth_controller import register, login, get_me, update_profile, change_password
from middleware.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_bp.route("/register", methods=["POST"])(register)
auth_bp.route("/login", methods=["POST"])(login)
auth_bp.route("/me", methods=["GET"])(token_required(get_me))
auth_bp.route("/me", methods=["PUT"])(token_required(update_profile))
auth_bp.route("/password", methods=["PUT"])(token_required(change_password))
