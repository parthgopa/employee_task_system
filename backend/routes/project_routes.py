from flask import Blueprint
from controllers.project_controller import (
    get_projects, get_project, create_project, update_project, delete_project
)
from middleware.auth_middleware import token_required

project_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

project_bp.route("", methods=["GET"])(token_required(get_projects))
project_bp.route("/<project_id>", methods=["GET"])(token_required(get_project))
project_bp.route("", methods=["POST"])(token_required(create_project))
project_bp.route("/<project_id>", methods=["PUT"])(token_required(update_project))
project_bp.route("/<project_id>", methods=["DELETE"])(token_required(delete_project))
