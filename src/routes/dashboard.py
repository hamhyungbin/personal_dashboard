from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from src.models.user import db, Widget, User
import json

dashboard_bp = Blueprint('dashboard', __name__)

# 대시보드 설정 저장 API
@dashboard_bp.route('/dashboard/settings', methods=['POST'])
@login_required
def save_dashboard_settings():
    data = request.get_json()
    
    if not data or 'widgets' not in data:
        return jsonify({'error': '유효하지 않은 데이터입니다.'}), 400
    
    try:
        # 현재 사용자의 모든 위젯 가져오기
        user_widgets = Widget.query.filter_by(user_id=current_user.id).all()
        
        # 위젯 ID 매핑 (클라이언트 ID -> DB ID)
        widget_id_map = {widget.id: widget for widget in user_widgets}
        
        # 클라이언트에서 받은 위젯 설정 처리
        for widget_data in data['widgets']:
            widget_id = widget_data.get('id')
            
            if widget_id in widget_id_map:
                # 기존 위젯 업데이트
                widget = widget_id_map[widget_id]
                widget.position_x = widget_data.get('position_x', widget.position_x)
                widget.position_y = widget_data.get('position_y', widget.position_y)
                widget.width = widget_data.get('width', widget.width)
                widget.height = widget_data.get('height', widget.height)
                widget.settings = widget_data.get('settings', widget.settings)
            else:
                # 새 위젯 생성
                new_widget = Widget(
                    user_id=current_user.id,
                    widget_type=widget_data.get('widget_type'),
                    position_x=widget_data.get('position_x', 0),
                    position_y=widget_data.get('position_y', 0),
                    width=widget_data.get('width', 300),
                    height=widget_data.get('height', 200),
                    settings=widget_data.get('settings', {})
                )
                db.session.add(new_widget)
        
        # 클라이언트에서 삭제된 위젯 처리
        client_widget_ids = [w.get('id') for w in data['widgets']]
        for widget in user_widgets:
            if widget.id not in client_widget_ids:
                db.session.delete(widget)
        
        db.session.commit()
        
        return jsonify({'message': '대시보드 설정이 저장되었습니다.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 대시보드 설정 불러오기 API
@dashboard_bp.route('/dashboard/settings', methods=['GET'])
@login_required
def get_dashboard_settings():
    try:
        # 현재 사용자의 모든 위젯 가져오기
        user_widgets = Widget.query.filter_by(user_id=current_user.id).all()
        
        # 위젯 데이터 변환
        widgets_data = []
        for widget in user_widgets:
            widgets_data.append({
                'id': widget.id,
                'widget_type': widget.widget_type,
                'position_x': widget.position_x,
                'position_y': widget.position_y,
                'width': widget.width,
                'height': widget.height,
                'settings': widget.settings
            })
        
        return jsonify({
            'settings': {
                'widgets': widgets_data
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 사용자 테마 설정 저장 API
@dashboard_bp.route('/user/theme', methods=['POST'])
@login_required
def save_user_theme():
    data = request.get_json()
    
    if not data or 'theme' not in data:
        return jsonify({'error': '유효하지 않은 데이터입니다.'}), 400
    
    try:
        # 사용자 설정 업데이트
        user = User.query.get(current_user.id)
        
        # 사용자 설정이 없으면 초기화
        if not user.settings:
            user.settings = {}
        
        # 테마 설정 업데이트
        user.settings['theme'] = data['theme']
        
        db.session.commit()
        
        return jsonify({'message': '테마 설정이 저장되었습니다.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 사용자 테마 설정 불러오기 API
@dashboard_bp.route('/user/theme', methods=['GET'])
@login_required
def get_user_theme():
    try:
        # 사용자 설정 가져오기
        user = User.query.get(current_user.id)
        
        # 기본 테마
        theme = 'light'
        
        # 사용자 설정이 있으면 테마 가져오기
        if user.settings and 'theme' in user.settings:
            theme = user.settings['theme']
        
        return jsonify({'theme': theme}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
