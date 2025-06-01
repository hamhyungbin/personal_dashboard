// 인증 관련 기능을 처리하는 모듈
const Auth = {
  // 현재 로그인한 사용자 정보
  currentUser: null,
  
  // 초기화 함수
  init: function() {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 사용자 정보 가져오기
      this.fetchCurrentUser();
    } else {
      // 토큰이 없으면 로그인 화면 표시
      this.showLoginForm();
    }
    
    // 이벤트 리스너 등록
    this.registerEventListeners();
  },
  
  // 이벤트 리스너 등록
  registerEventListeners: function() {
    // 로그인 폼 제출
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });
    
    // 회원가입 폼 제출
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.register();
    });
    
    // 로그인 폼 보기
    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });
    
    // 회원가입 폼 보기
    document.getElementById('show-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });
    
    // 구글 로그인
    document.getElementById('google-login').addEventListener('click', () => {
      window.location.href = '/api/user/login/google';
    });
    
    // 로그아웃
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });
  },
  
  // 로그인 폼 표시
  showLoginForm: function() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'none';
  },
  
  // 회원가입 폼 표시
  showRegisterForm: function() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
  },
  
  // 대시보드 표시
  showDashboard: function() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    
    // 대시보드 초기화
    Dashboard.init();
  },
  
  // 로그인 처리
  login: async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('auth-container').style.display = 'none';
      
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 로그인 성공
        this.currentUser = data.user;
        localStorage.setItem('token', 'logged_in'); // 실제 토큰 구현 필요
        this.updateUserInfo();
        this.showDashboard();
      } else {
        // 로그인 실패
        alert(data.error || '로그인에 실패했습니다.');
        this.showLoginForm();
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
      this.showLoginForm();
    }
  },
  
  // 회원가입 처리
  register: async function() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('register-container').style.display = 'none';
      
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 회원가입 성공
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        this.showLoginForm();
      } else {
        // 회원가입 실패
        alert(data.error || '회원가입에 실패했습니다.');
        this.showRegisterForm();
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
      this.showRegisterForm();
    }
  },
  
  // 현재 사용자 정보 가져오기
  fetchCurrentUser: async function() {
    try {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        this.updateUserInfo();
        this.showDashboard();
      } else {
        // 인증 실패
        localStorage.removeItem('token');
        this.showLoginForm();
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      localStorage.removeItem('token');
      this.showLoginForm();
    }
  },
  
  // 로그아웃 처리
  logout: async function() {
    try {
      await fetch('/api/user/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // 로컬 스토리지 토큰 삭제
      localStorage.removeItem('token');
      this.currentUser = null;
      this.showLoginForm();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  },
  
  // 사용자 정보 업데이트
  updateUserInfo: function() {
    if (this.currentUser) {
      document.getElementById('username').textContent = this.currentUser.username;
      document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}`;
    }
  }
};
