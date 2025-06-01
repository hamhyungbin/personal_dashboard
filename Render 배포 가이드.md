# Render 배포 가이드

이 문서는 개인화 대시보드 애플리케이션을 Render에 배포하는 방법을 안내합니다.

## 사전 준비

1. [Render](https://render.com/) 계정 생성
2. GitHub 계정 (선택 사항: 소스 코드 관리를 위해)

## 배포 단계

### 1. 소스 코드 준비

GitHub에 프로젝트를 업로드하는 경우:

```bash
# 프로젝트 디렉토리로 이동
cd personal-dashboard

# Git 초기화 (이미 되어 있음)
# git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub 저장소에 푸시
git remote add origin https://github.com/your-username/personal-dashboard.git
git push -u origin main
```

### 2. Render 웹 서비스 설정

1. Render 대시보드에서 "New +" 버튼을 클릭하고 "Web Service" 선택
2. 배포 방법 선택:
   - GitHub 저장소를 연결하거나
   - "Upload Files" 옵션을 선택하여 프로젝트 파일을 직접 업로드

3. 다음 설정을 구성:
   - **Name**: personal-dashboard (또는 원하는 이름)
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd src && python main.py`

4. 환경 변수 설정 (필요한 경우):
   - `OPENWEATHER_API_KEY`: OpenWeatherMap API 키
   - `NEWS_API_KEY`: NewsAPI 키
   - `PIXABAY_API_KEY`: Pixabay API 키
   - `GOOGLE_CLIENT_ID`: Google OAuth 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿

### 3. 데이터베이스 설정

Render에서 MySQL 데이터베이스 설정:

1. Render 대시보드에서 "New +" 버튼을 클릭하고 "MySQL" 선택
2. 데이터베이스 이름, 사용자 이름, 비밀번호 설정
3. 생성된 데이터베이스 정보를 웹 서비스 환경 변수에 추가:
   - `DB_USERNAME`: 데이터베이스 사용자 이름
   - `DB_PASSWORD`: 데이터베이스 비밀번호
   - `DB_HOST`: 데이터베이스 호스트 주소
   - `DB_PORT`: 데이터베이스 포트 (기본값: 3306)
   - `DB_NAME`: 데이터베이스 이름

### 4. 배포 확인

1. 배포가 완료되면 Render에서 제공하는 URL로 접속하여 애플리케이션이 정상적으로 작동하는지 확인
2. 로그인, 위젯 추가, 설정 저장 등 주요 기능이 모두 정상 작동하는지 테스트

## 문제 해결

배포 중 문제가 발생하면 Render 대시보드의 로그를 확인하세요. 일반적인 문제:

1. **의존성 오류**: requirements.txt에 모든 필요한 패키지가 포함되어 있는지 확인
2. **데이터베이스 연결 오류**: 환경 변수가 올바르게 설정되었는지 확인
3. **API 키 오류**: 필요한 API 키가 환경 변수에 설정되었는지 확인

## 추가 리소스

- [Render Python 배포 문서](https://render.com/docs/deploy-flask)
- [Render 환경 변수 설정](https://render.com/docs/environment-variables)
- [Render 데이터베이스 문서](https://render.com/docs/databases)
