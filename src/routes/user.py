from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import db, User
import os
import json
from flask_oauthlib.client import OAuth

user_bp = Blueprint('user', __name__)
oauth = OAuth()

# OAuth 제공자 설정
google = oauth.remote_app(
    'google',
    consumer_key=os.getenv('GOOGLE_CLIENT_ID', ''),
    consumer_secret=os.getenv('GOOGLE_CLIENT_SECRET', ''),
    request_token_params={
        'scope': 'email profile'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

# 로그인 매니저 초기화 함수
def init_login_manager(app):
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'user.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    return login_manager

# 회원가입 API
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 필수 필드 검증
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': '모든 필드를 입력해주세요.'}), 400
    
    # 이메일 중복 확인
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': '이미 등록된 이메일입니다.'}), 400
    
    # 사용자명 중복 확인
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '이미 사용 중인 사용자명입니다.'}), 400
    
    # 새 사용자 생성
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': '회원가입이 완료되었습니다.',
        'user_id': user.id
    }), 201

# 로그인 API
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # 필수 필드 검증
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': '이메일과 비밀번호를 입력해주세요.'}), 400
    
    # 사용자 조회
    user = User.query.filter_by(email=data['email']).first()
    
    # 사용자 인증
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({
            'message': '로그인 성공',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    
    return jsonify({'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}), 401

# 로그아웃 API
@user_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': '로그아웃 되었습니다.'}), 200

# 사용자 정보 조회 API
@user_bp.route('/me', methods=['GET'])
@login_required
def get_user_info():
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        }
    }), 200

# Google OAuth 로그인 시작
@user_bp.route('/login/google')
def login_google():
    return google.authorize(callback=url_for('user.authorized_google', _external=True))

# Google OAuth 콜백
@user_bp.route('/login/google/callback')
def authorized_google():
    resp = google.authorized_response()
    if resp is None or resp.get('access_token') is None:
        return jsonify({'error': '인증에 실패했습니다.'}), 401
    
    session['google_token'] = (resp['access_token'], '')
    user_info = google.get('userinfo')
    
    # 소셜 ID로 사용자 조회
    social_id = f"google_{user_info.data['id']}"
    user = User.query.filter_by(social_id=social_id).first()
    
    # 사용자가 없으면 새로 생성
    if not user:
        user = User(
            username=user_info.data['name'],
            email=user_info.data['email'],
            social_id=social_id,
            social_provider='google'
        )
        db.session.add(user)
        db.session.commit()
    
    login_user(user)
    return redirect('/')

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')
