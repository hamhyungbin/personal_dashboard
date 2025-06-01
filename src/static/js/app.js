// 애플리케이션 초기화 및 실행
document.addEventListener('DOMContentLoaded', function() {
  // 인증 모듈 초기화
  Auth.init();
  
  // 애플리케이션 상태 관리
  window.appState = {
    isAuthenticated: false,
    currentUser: null
  };
  
  // URL 파라미터 확인 (소셜 로그인 콜백 처리)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('auth') && urlParams.get('auth') === 'success') {
    // 소셜 로그인 성공 후 리다이렉트된 경우
    Auth.fetchCurrentUser();
    
    // URL 파라미터 제거
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
