from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    voice_preference = db.Column(db.String(20), default="female", nullable=False)  # male or female
    voice_pitch = db.Column(db.Float, default=1.0, nullable=False)  # 0.5 to 2.0
    voice_speed = db.Column(db.Float, default=1.0, nullable=False)  # 0.5 to 2.0
    chats = db.relationship('Chat', backref='user', lazy=True)
    checkpoints = db.relationship('Checkpoint', backref='user', lazy=True)

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable for guest chats
    session_id = db.Column(db.String(128), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    messages = db.relationship('Message', backref='chat', lazy=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_bot = db.Column(db.Boolean, default=False, nullable=False)

class Checkpoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    progress = db.Column(db.Integer, default=0, nullable=False)  # 0-100 percentage
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
class AnxietyAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # Score from 0-21 for GAD-7
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    @property
    def severity(self):
        if self.score <= 4:
            return "Minimal Anxiety"
        elif self.score <= 9:
            return "Mild Anxiety"
        elif self.score <= 14:
            return "Moderate Anxiety"
        else:
            return "Severe Anxiety"
