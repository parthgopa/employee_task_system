from flask import Blueprint
from controllers.task_controller import (
    get_today_tasks, get_tasks_by_date, create_task,
    update_task, delete_task, update_task_status, get_tasks_by_project,
)
from middleware.auth_middleware import token_required

task_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

task_bp.route("/today", methods=["GET"])(token_required(get_today_tasks))
task_bp.route("/date/<date>", methods=["GET"])(token_required(get_tasks_by_date))
task_bp.route("/project/<project_id>", methods=["GET"])(token_required(get_tasks_by_project))
task_bp.route("", methods=["POST"])(token_required(create_task))
task_bp.route("/<task_id>", methods=["PUT"])(token_required(update_task))
task_bp.route("/<task_id>", methods=["DELETE"])(token_required(delete_task))
task_bp.route("/<task_id>/status", methods=["PATCH"])(token_required(update_task_status))
