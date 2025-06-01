// 대시보드 관련 기능을 처리하는 모듈
const Dashboard = {
  // 위젯 목록
  widgets: [],
  
  // 초기화 함수
  init: function() {
    // 위젯 목록 가져오기
    this.fetchWidgets();
    
    // 이벤트 리스너 등록
    this.registerEventListeners();
    
    // 드래그 및 리사이즈 기능 초기화
    this.initInteractJS();
  },
  
  // 이벤트 리스너 등록
  registerEventListeners: function() {
    // 위젯 추가 버튼 클릭
    document.getElementById('add-widget-btn').addEventListener('click', () => {
      this.showWidgetModal();
    });
    
    // 모달 닫기 버튼 클릭
    document.getElementById('close-modal').addEventListener('click', () => {
      this.hideWidgetModal();
    });
    
    // 위젯 옵션 클릭
    const widgetOptions = document.querySelectorAll('.widget-option');
    widgetOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const widgetType = e.currentTarget.getAttribute('data-type');
        this.addWidget(widgetType);
        this.hideWidgetModal();
      });
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('widget-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('widget-modal')) {
        this.hideWidgetModal();
      }
    });
  },
  
  // 위젯 모달 표시
  showWidgetModal: function() {
    document.getElementById('widget-modal').classList.add('active');
  },
  
  // 위젯 모달 숨기기
  hideWidgetModal: function() {
    document.getElementById('widget-modal').classList.remove('active');
  },
  
  // 위젯 목록 가져오기
  fetchWidgets: async function() {
    try {
      const response = await fetch('/api/widget/widgets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.widgets = data.widgets || [];
        this.renderWidgets();
      } else {
        console.error('위젯 목록 조회 실패');
      }
    } catch (error) {
      console.error('위젯 목록 조회 오류:', error);
    }
  },
  
  // 위젯 추가
  addWidget: async function(widgetType) {
    try {
      const response = await fetch('/api/widget/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widget_type: widgetType,
          position_x: 10,
          position_y: 10,
          width: 300,
          height: 200,
          settings: {}
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.widgets.push(data.widget);
        this.renderWidget(data.widget);
      } else {
        console.error('위젯 추가 실패');
      }
    } catch (error) {
      console.error('위젯 추가 오류:', error);
    }
  },
  
  // 위젯 업데이트
  updateWidget: async function(widgetId, updates) {
    try {
      const response = await fetch(`/api/widget/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // 위젯 목록 업데이트
        const data = await response.json();
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
          this.widgets[index] = data.widget;
        }
      } else {
        console.error('위젯 업데이트 실패');
      }
    } catch (error) {
      console.error('위젯 업데이트 오류:', error);
    }
  },
  
  // 위젯 삭제
  deleteWidget: async function(widgetId) {
    try {
      const response = await fetch(`/api/widget/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 위젯 목록에서 제거
        this.widgets = this.widgets.filter(w => w.id !== widgetId);
        
        // DOM에서 제거
        const widgetElement = document.getElementById(`widget-${widgetId}`);
        if (widgetElement) {
          widgetElement.remove();
        }
      } else {
        console.error('위젯 삭제 실패');
      }
    } catch (error) {
      console.error('위젯 삭제 오류:', error);
    }
  },
  
  // 위젯 렌더링
  renderWidgets: function() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = '';
    
    this.widgets.forEach(widget => {
      this.renderWidget(widget);
    });
  },
  
  // 단일 위젯 렌더링
  renderWidget: function(widget) {
    const dashboard = document.getElementById('dashboard');
    
    // 위젯 요소 생성
    const widgetElement = document.createElement('div');
    widgetElement.id = `widget-${widget.id}`;
    widgetElement.className = `widget widget-${widget.widget_type}`;
    widgetElement.style.width = `${widget.width}px`;
    widgetElement.style.height = `${widget.height}px`;
    widgetElement.style.transform = `translate(${widget.position_x}px, ${widget.position_y}px)`;
    
    // 위젯 헤더
    const widgetHeader = document.createElement('div');
    widgetHeader.className = 'widget-header';
    
    const widgetTitle = document.createElement('div');
    widgetTitle.className = 'widget-title';
    widgetTitle.textContent = this.getWidgetTitle(widget.widget_type);
    
    const widgetActions = document.createElement('div');
    widgetActions.className = 'widget-actions';
    
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'widget-action-btn';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingsBtn.addEventListener('click', () => {
      Widgets.openSettings(widget);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'widget-action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => {
      this.deleteWidget(widget.id);
    });
    
    widgetActions.appendChild(settingsBtn);
    widgetActions.appendChild(deleteBtn);
    
    widgetHeader.appendChild(widgetTitle);
    widgetHeader.appendChild(widgetActions);
    
    // 위젯 컨텐츠
    const widgetContent = document.createElement('div');
    widgetContent.className = 'widget-content';
    
    // 위젯 타입에 따라 컨텐츠 렌더링
    Widgets.renderContent(widgetContent, widget);
    
    // 리사이즈 핸들
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    
    // 위젯 조립
    widgetElement.appendChild(widgetHeader);
    widgetElement.appendChild(widgetContent);
    widgetElement.appendChild(resizeHandle);
    
    // 대시보드에 추가
    dashboard.appendChild(widgetElement);
  },
  
  // 위젯 타입에 따른 제목 반환
  getWidgetTitle: function(widgetType) {
    const titles = {
      'weather': '날씨',
      'news': '뉴스',
      'crypto': '암호화폐',
      'image': '이미지'
    };
    
    return titles[widgetType] || '위젯';
  },
  
  // InteractJS 초기화 (드래그 및 리사이즈)
  initInteractJS: function() {
    // 드래그 가능한 요소 설정
    interact('.widget').draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      autoScroll: true,
      
      listeners: {
        move: this.dragMoveListener.bind(this),
        end: this.dragEndListener.bind(this)
      }
    })
    .resizable({
      edges: { right: true, bottom: true, left: false, top: false },
      
      listeners: {
        move: this.resizeMoveListener.bind(this),
        end: this.resizeEndListener.bind(this)
      },
      
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 200, height: 150 }
        })
      ],
      
      inertia: true
    });
  },
  
  // 드래그 이벤트 리스너
  dragMoveListener: function(event) {
    const target = event.target;
    
    // 현재 위치에 dx, dy 더하기
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
    // 요소 위치 업데이트
    target.style.transform = `translate(${x}px, ${y}px)`;
    
    // 위치 데이터 저장
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
  
  // 드래그 종료 이벤트 리스너
  dragEndListener: function(event) {
    const target = event.target;
    const widgetId = parseInt(target.id.replace('widget-', ''));
    
    // 위젯 위치 업데이트
    const x = parseFloat(target.getAttribute('data-x')) || 0;
    const y = parseFloat(target.getAttribute('data-y')) || 0;
    
    this.updateWidget(widgetId, {
      position_x: x,
      position_y: y
    });
  },
  
  // 리사이즈 이벤트 리스너
  resizeMoveListener: function(event) {
    const target = event.target;
    
    let x = (parseFloat(target.getAttribute('data-x')) || 0);
    let y = (parseFloat(target.getAttribute('data-y')) || 0);
    
    // 크기 업데이트
    target.style.width = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';
    
    // 위치 보정
    x += event.deltaRect.left;
    y += event.deltaRect.top;
    
    target.style.transform = `translate(${x}px, ${y}px)`;
    
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
  
  // 리사이즈 종료 이벤트 리스너
  resizeEndListener: function(event) {
    const target = event.target;
    const widgetId = parseInt(target.id.replace('widget-', ''));
    
    // 위젯 크기 업데이트
    this.updateWidget(widgetId, {
      width: parseInt(target.style.width),
      height: parseInt(target.style.height),
      position_x: parseFloat(target.getAttribute('data-x')) || 0,
      position_y: parseFloat(target.getAttribute('data-y')) || 0
    });
  }
};
