from flask import Flask, render_template

def create_app():
    app = Flask(__name__)
    app.config.from_mapping(SECRET_KEY="dev")

    from blueprints.pages import bp as pages_bp
    app.register_blueprint(pages_bp)

    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)