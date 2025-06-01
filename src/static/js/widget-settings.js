// 위젯 설정 관리 모듈
const WidgetSettings = {
  // 위젯 설정 저장
  saveSettings: async function(widgetId, settings) {
    try {
      const response = await fetch(`/api/widget/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings: settings
        })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('위젯 설정 저장 실패');
        return null;
      }
    } catch (error) {
      console.error('위젯 설정 저장 오류:', error);
      return null;
    }
  },
  
  // 위젯 스타일 설정 UI 열기
  openStyleSettings: function(widget) {
    const style = widget.settings?.style || {};
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">위젯 스타일 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="widget-bg-color">배경 색상</label>
            <input type="color" id="widget-bg-color" class="form-control" value="${style.backgroundColor || '#ffffff'}">
          </div>
          <div class="form-group">
            <label for="widget-text-color">텍스트 색상</label>
            <input type="color" id="widget-text-color" class="form-control" value="${style.textColor || '#333333'}">
          </div>
          <div class="form-group">
            <label for="widget-border-color">테두리 색상</label>
            <input type="color" id="widget-border-color" class="form-control" value="${style.borderColor || '#eeeeee'}">
          </div>
          <div class="form-group">
            <label for="widget-border-width">테두리 두께</label>
            <input type="range" id="widget-border-width" class="form-control" min="0" max="10" value="${style.borderWidth || '1'}">
            <span id="border-width-value">${style.borderWidth || '1'}px</span>
          </div>
          <div class="form-group">
            <label for="widget-border-radius">모서리 둥글기</label>
            <input type="range" id="widget-border-radius" class="form-control" min="0" max="20" value="${style.borderRadius || '8'}">
            <span id="border-radius-value">${style.borderRadius || '8'}px</span>
          </div>
          <div class="form-group">
            <label for="widget-shadow">그림자 효과</label>
            <select id="widget-shadow" class="form-control">
              <option value="none" ${style.shadow === 'none' ? 'selected' : ''}>없음</option>
              <option value="light" ${style.shadow === 'light' || !style.shadow ? 'selected' : ''}>약함</option>
              <option value="medium" ${style.shadow === 'medium' ? 'selected' : ''}>중간</option>
              <option value="strong" ${style.shadow === 'strong' ? 'selected' : ''}>강함</option>
            </select>
          </div>
          <button id="save-style-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 슬라이더 값 표시 업데이트
    document.getElementById('widget-border-width').addEventListener('input', function() {
      document.getElementById('border-width-value').textContent = this.value + 'px';
    });
    
    document.getElementById('widget-border-radius').addEventListener('input', function() {
      document.getElementById('border-radius-value').textContent = this.value + 'px';
    });
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-style-settings').addEventListener('click', () => {
      const newStyle = {
        backgroundColor: document.getElementById('widget-bg-color').value,
        textColor: document.getElementById('widget-text-color').value,
        borderColor: document.getElementById('widget-border-color').value,
        borderWidth: document.getElementById('widget-border-width').value,
        borderRadius: document.getElementById('widget-border-radius').value,
        shadow: document.getElementById('widget-shadow').value
      };
      
      // 위젯 설정 업데이트
      const updatedSettings = {
        ...widget.settings,
        style: newStyle
      };
      
      this.saveSettings(widget.id, updatedSettings)
        .then(result => {
          if (result) {
            // 위젯 스타일 적용
            this.applyWidgetStyle(widget.id, newStyle);
            
            // 위젯 객체 업데이트
            const index = Dashboard.widgets.findIndex(w => w.id === widget.id);
            if (index !== -1) {
              Dashboard.widgets[index].settings = updatedSettings;
            }
          }
        });
      
      modal.remove();
    });
  },
  
  // 위젯 스타일 적용
  applyWidgetStyle: function(widgetId, style) {
    const widgetElement = document.getElementById(`widget-${widgetId}`);
    if (!widgetElement) return;
    
    // 배경 색상
    if (style.backgroundColor) {
      widgetElement.style.backgroundColor = style.backgroundColor;
    }
    
    // 텍스트 색상
    if (style.textColor) {
      widgetElement.style.color = style.textColor;
    }
    
    // 테두리
    if (style.borderColor) {
      widgetElement.style.borderColor = style.borderColor;
    }
    
    if (style.borderWidth) {
      widgetElement.style.borderWidth = `${style.borderWidth}px`;
      widgetElement.style.borderStyle = style.borderWidth > 0 ? 'solid' : 'none';
    }
    
    // 모서리 둥글기
    if (style.borderRadius) {
      widgetElement.style.borderRadius = `${style.borderRadius}px`;
    }
    
    // 그림자 효과
    switch (style.shadow) {
      case 'none':
        widgetElement.style.boxShadow = 'none';
        break;
      case 'light':
        widgetElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        break;
      case 'medium':
        widgetElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        break;
      case 'strong':
        widgetElement.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
        break;
    }
  },
  
  // 모든 위젯에 스타일 적용
  applyAllWidgetStyles: function() {
    Dashboard.widgets.forEach(widget => {
      if (widget.settings?.style) {
        this.applyWidgetStyle(widget.id, widget.settings.style);
      }
    });
  },
  
  // 위젯 설정 초기화
  resetWidgetSettings: function(widget) {
    const widgetType = widget.widget_type;
    let defaultSettings = {};
    
    // 위젯 타입별 기본 설정
    switch (widgetType) {
      case 'weather':
        defaultSettings = { location: '서울' };
        break;
      case 'news':
        defaultSettings = { category: 'general' };
        break;
      case 'crypto':
        defaultSettings = { coins: ['bitcoin', 'ethereum', 'ripple'] };
        break;
      case 'image':
        defaultSettings = { query: 'nature' };
        break;
    }
    
    // 스타일 기본값
    const defaultStyle = {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderColor: '#eeeeee',
      borderWidth: '1',
      borderRadius: '8',
      shadow: 'light'
    };
    
    // 기본 설정에 스타일 추가
    defaultSettings.style = defaultStyle;
    
    // 설정 저장
    return this.saveSettings(widget.id, defaultSettings);
  },
  
  // 위젯 설정 내보내기
  exportWidgetSettings: function() {
    const settings = {
      widgets: Dashboard.widgets.map(widget => ({
        id: widget.id,
        widget_type: widget.widget_type,
        position_x: widget.position_x,
        position_y: widget.position_y,
        width: widget.width,
        height: widget.height,
        settings: widget.settings
      }))
    };
    
    // JSON 문자열로 변환
    const settingsJson = JSON.stringify(settings, null, 2);
    
    // 다운로드 링크 생성
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  // 위젯 설정 가져오기
  importWidgetSettings: function(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const settings = JSON.parse(e.target.result);
        
        if (settings && settings.widgets && Array.isArray(settings.widgets)) {
          // 기존 위젯 모두 삭제
          const deletePromises = Dashboard.widgets.map(widget => 
            Dashboard.deleteWidget(widget.id)
          );
          
          Promise.all(deletePromises)
            .then(() => {
              // 새 위젯 추가
              const addPromises = settings.widgets.map(widget => 
                Dashboard.addWidget(widget.widget_type, {
                  position_x: widget.position_x,
                  position_y: widget.position_y,
                  width: widget.width,
                  height: widget.height,
                  settings: widget.settings
                })
              );
              
              return Promise.all(addPromises);
            })
            .then(() => {
              alert('위젯 설정을 성공적으로 가져왔습니다.');
            })
            .catch(error => {
              console.error('위젯 설정 가져오기 오류:', error);
              alert('위젯 설정을 가져오는 중 오류가 발생했습니다.');
            });
        } else {
          alert('유효하지 않은 설정 파일입니다.');
        }
      } catch (error) {
        console.error('설정 파일 파싱 오류:', error);
        alert('설정 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    
    reader.readAsText(file);
  }
};
