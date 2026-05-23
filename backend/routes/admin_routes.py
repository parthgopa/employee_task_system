from flask import Blueprint
from controllers.admin_controller import (
    get_all_employees,
    get_employee_detail,
    get_employee_tasks,
    get_employee_history,
    get_admin_dashboard_stats,
)
from middleware.auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

admin_bp.route("/stats", methods=["GET"])(admin_required(get_admin_dashboard_stats))
admin_bp.route("/employees", methods=["GET"])(admin_required(get_all_employees))
admin_bp.route("/employees/<employee_id>", methods=["GET"])(admin_required(get_employee_detail))
admin_bp.route("/employees/<employee_id>/tasks", methods=["GET"])(admin_required(get_employee_tasks))
admin_bp.route("/employees/<employee_id>/history", methods=["GET"])(admin_required(get_employee_history))
