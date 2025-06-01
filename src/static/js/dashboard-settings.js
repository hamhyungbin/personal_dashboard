// 대시보드 설정 및 사용자 설정 관리 모듈
const DashboardSettings = {
  // 대시보드 설정 저장
  saveDashboardSettings: async function() {
    try {
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
      
      const response = await fetch('/api/widget/dashboard/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        console.log('대시보드 설정이 저장되었습니다.');
        return true;
      } else {
        console.error('대시보드 설정 저장 실패');
        return false;
      }
    } catch (error) {
      console.error('대시보드 설정 저장 오류:', error);
      return false;
    }
  },
  
  // 대시보드 설정 불러오기
  loadDashboardSettings: async function() {
    try {
      const response = await fetch('/api/widget/dashboard/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.settings;
      } else {
        console.error('대시보드 설정 불러오기 실패');
        return null;
      }
    } catch (error) {
      console.error('대시보드 설정 불러오기 오류:', error);
      return null;
    }
  },
  
  // 대시보드 테마 설정
  setDashboardTheme: function(theme) {
    const dashboard = document.getElementById('dashboard');
    const body = document.body;
    
    // 기존 테마 클래스 제거
    body.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green');
    
    // 새 테마 클래스 추가
    body.classList.add(`theme-${theme}`);
    
    // 테마 설정 저장
    localStorage.setItem('dashboard-theme', theme);
  },
  
  // 대시보드 테마 불러오기
  loadDashboardTheme: function() {
    const theme = localStorage.getItem('dashboard-theme') || 'light';
    this.setDashboardTheme(theme);
    return theme;
  },
  
  // 대시보드 설정 UI 열기
  openDashboardSettings: function() {
    const currentTheme = localStorage.getItem('dashboard-theme') || 'light';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">대시보드 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>테마</label>
            <div class="theme-options">
              <div class="theme-option ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
                <div class="theme-preview theme-light"></div>
                <span>라이트</span>
              </div>
              <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
                <div class="theme-preview theme-dark"></div>
                <span>다크</span>
              </div>
              <div class="theme-option ${currentTheme === 'blue' ? 'active' : ''}" data-theme="blue">
                <div class="theme-preview theme-blue"></div>
                <span>블루</span>
              </div>
              <div class="theme-option ${currentTheme === 'green' ? 'active' : ''}" data-theme="green">
                <div class="theme-preview theme-green"></div>
                <span>그린</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>데이터 관리</label>
            <div class="settings-actions">
              <button id="export-settings" class="btn btn-outline">설정 내보내기</button>
              <div class="file-upload-wrapper">
                <button id="import-settings-btn" class="btn btn-outline">설정 가져오기</button>
                <input type="file" id="import-settings" accept=".json" style="display: none;">
              </div>
              <button id="reset-dashboard" class="btn btn-outline btn-danger">대시보드 초기화</button>
            </div>
          </div>
          
          <button id="save-dashboard-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 테마 옵션 클릭 이벤트
    const themeOptions = modal.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        // 기존 선택 제거
        themeOptions.forEach(opt => opt.classList.remove('active'));
        
        // 새 선택 추가
        option.classList.add('active');
      });
    });
    
    // 설정 내보내기 버튼 이벤트
    modal.querySelector('#export-settings').addEventListener('click', () => {
      WidgetSettings.exportWidgetSettings();
    });
    
    // 설정 가져오기 버튼 이벤트
    modal.querySelector('#import-settings-btn').addEventListener('click', () => {
      document.getElementById('import-settings').click();
    });
    
    // 파일 선택 이벤트
    modal.querySelector('#import-settings').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        WidgetSettings.importWidgetSettings(e.target.files[0]);
        modal.remove();
      }
    });
    
    // 대시보드 초기화 버튼 이벤트
    modal.querySelector('#reset-dashboard').addEventListener('click', () => {
      if (confirm('정말로 대시보드를 초기화하시겠습니까? 모든 위젯과 설정이 삭제됩니다.')) {
        // 기존 위젯 모두 삭제
        const deletePromises = Dashboard.widgets.map(widget => 
          Dashboard.deleteWidget(widget.id)
        );
        
        Promise.all(deletePromises)
          .then(() => {
            alert('대시보드가 초기화되었습니다.');
            modal.remove();
          })
          .catch(error => {
            console.error('대시보드 초기화 오류:', error);
            alert('대시보드 초기화 중 오류가 발생했습니다.');
          });
      }
    });
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-dashboard-settings').addEventListener('click', () => {
      // 선택된 테마 가져오기
      const selectedTheme = modal.querySelector('.theme-option.active').getAttribute('data-theme');
      
      // 테마 적용
      this.setDashboardTheme(selectedTheme);
      
      // 대시보드 설정 저장
      this.saveDashboardSettings()
        .then(success => {
          if (success) {
            alert('설정이 저장되었습니다.');
          } else {
            alert('설정 저장에 실패했습니다.');
          }
        });
      
      modal.remove();
    });
  },
  
  // 자동 저장 설정
  setupAutoSave: function() {
    // 30초마다 대시보드 설정 자동 저장
    setInterval(() => {
      this.saveDashboardSettings();
    }, 30000);
  },
  
  // 초기화
  init: function() {
    // 테마 불러오기
    this.loadDashboardTheme();
    
    // 자동 저장 설정
    this.setupAutoSave();
    
    // 대시보드 설정 버튼 이벤트 등록
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'dashboard-settings-btn';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingsBtn.addEventListener('click', () => {
      this.openDashboardSettings();
    });
    
    document.querySelector('.header').appendChild(settingsBtn);
  }
};
