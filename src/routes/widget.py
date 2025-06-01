from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from src.models.user import db, Widget
import json

widget_bp = Blueprint('widget', __name__)

# 위젯 목록 조회 API
@widget_bp.route('/widgets', methods=['GET'])
@login_required
def get_widgets():
    widgets = Widget.query.filter_by(user_id=current_user.id).all()
    result = []
    
    for widget in widgets:
        result.append({
            'id': widget.id,
            'widget_type': widget.widget_type,
            'position_x': widget.position_x,
            'position_y': widget.position_y,
            'width': widget.width,
            'height': widget.height,
            'settings': widget.settings
        })
    
    return jsonify({'widgets': result}), 200

# 위젯 생성 API
@widget_bp.route('/widgets', methods=['POST'])
@login_required
def create_widget():
    data = request.get_json()
    
    # 필수 필드 검증
    if 'widget_type' not in data:
        return jsonify({'error': '위젯 타입은 필수 항목입니다.'}), 400
    
    # 새 위젯 생성
    widget = Widget(
        user_id=current_user.id,
        widget_type=data['widget_type'],
        position_x=data.get('position_x', 0),
        position_y=data.get('position_y', 0),
        width=data.get('width', 300),
        height=data.get('height', 200),
        settings=data.get('settings', {})
    )
    
    db.session.add(widget)
    db.session.commit()
    
    return jsonify({
        'message': '위젯이 생성되었습니다.',
        'widget': {
            'id': widget.id,
            'widget_type': widget.widget_type,
            'position_x': widget.position_x,
            'position_y': widget.position_y,
            'width': widget.width,
            'height': widget.height,
            'settings': widget.settings
        }
    }), 201

# 위젯 수정 API
@widget_bp.route('/widgets/<int:widget_id>', methods=['PUT'])
@login_required
def update_widget(widget_id):
    widget = Widget.query.filter_by(id=widget_id, user_id=current_user.id).first()
    
    if not widget:
        return jsonify({'error': '위젯을 찾을 수 없습니다.'}), 404
    
    data = request.get_json()
    
    # 위치 및 크기 업데이트
    if 'position_x' in data:
        widget.position_x = data['position_x']
    if 'position_y' in data:
        widget.position_y = data['position_y']
    if 'width' in data:
        widget.width = data['width']
    if 'height' in data:
        widget.height = data['height']
    if 'settings' in data:
        widget.settings = data['settings']
    
    db.session.commit()
    
    return jsonify({
        'message': '위젯이 업데이트되었습니다.',
        'widget': {
            'id': widget.id,
            'widget_type': widget.widget_type,
            'position_x': widget.position_x,
            'position_y': widget.position_y,
            'width': widget.width,
            'height': widget.height,
            'settings': widget.settings
        }
    }), 200

# 위젯 삭제 API
@widget_bp.route('/widgets/<int:widget_id>', methods=['DELETE'])
@login_required
def delete_widget(widget_id):
    widget = Widget.query.filter_by(id=widget_id, user_id=current_user.id).first()
    
    if not widget:
        return jsonify({'error': '위젯을 찾을 수 없습니다.'}), 404
    
    db.session.delete(widget)
    db.session.commit()
    
    return jsonify({'message': '위젯이 삭제되었습니다.'}), 200
