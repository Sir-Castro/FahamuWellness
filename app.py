import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_login import LoginManager
from flask_mail import Mail

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()
mail = Mail()

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "fahamu_secret_key_dev")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # Needed for url_for to generate with https

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///fahamu.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configure Flask-Mail
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "your-email@gmail.com")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "your-password")
app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_DEFAULT_SENDER", "your-email@gmail.com")

# Initialize extensions with the app
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message_category = "info"
mail.init_app(app)

# Import routes
with app.app_context():
    # Make sure to import the models here or their tables won't be created
    import models  # noqa: F401
    from routes import *  # noqa: F401, F403

    db.create_all()

    # Create admin user if it doesn't exist
    from models import User
    from werkzeug.security import generate_password_hash
    
    admin = User.query.filter_by(email="admin@fahamu.com").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@fahamu.com",
            password_hash=generate_password_hash("admin"),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        logger.info("Admin user created")
