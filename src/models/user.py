from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # 소셜 로그인 관련 필드
    social_id = db.Column(db.String(255), unique=True, nullable=True)
    social_provider = db.Column(db.String(50), nullable=True)
    
    # 사용자 설정 관련
    settings = db.Column(db.JSON, nullable=True)  # 사용자 전체 설정 (테마 등)
    widgets = db.relationship('Widget', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        if self.password_hash:
            return check_password_hash(self.password_hash, password)
        return False
    
    def __repr__(self):
        return f'<User {self.username}>'


class Widget(db.Model):
    __tablename__ = 'widgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    widget_type = db.Column(db.String(50), nullable=False)  # 'weather', 'news', 'crypto', 'image' 등
    position_x = db.Column(db.Integer, default=0)
    position_y = db.Column(db.Integer, default=0)
    width = db.Column(db.Integer, default=300)
    height = db.Column(db.Integer, default=200)
    settings = db.Column(db.JSON, nullable=True)  # 위젯별 설정 저장 (JSON 형태)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Widget {self.widget_type} for User {self.user_id}>'
