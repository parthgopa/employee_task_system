from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config.settings import config
from config.database import get_db
from middleware.error_handler import register_error_handlers
from routes.auth_routes import auth_bp
from routes.task_routes import task_bp
from routes.goal_routes import goal_bp
from routes.history_routes import history_bp
from routes.analytics_routes import analytics_bp
from routes.admin_routes import admin_bp
from routes.alert_routes import alert_bp
from routes.project_routes import project_bp

def create_app():
    app = Flask(__name__)

    CORS(
        app,
        resources={r"/api/*": {"origins": config.CORS_ORIGINS}},
        supports_credentials=True,
        always_send=True,
    )

    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per minute"],
        storage_uri="memory://",
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(goal_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(project_bp)

    register_error_handlers(app)

    @app.route("/api/health", methods=["GET"])
    def health():
        try:
            db = get_db()
            return jsonify({"status": "ok", "database": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "error", "database": str(e)}), 503

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=config.FLASK_DEBUG)
