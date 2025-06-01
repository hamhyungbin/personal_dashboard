from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime
from flask_login import login_required, current_user

api_bp = Blueprint('api', __name__)

# OpenWeatherMap API 키 (실제 배포 시 환경 변수로 관리해야 함)
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_api_key')

# NewsAPI 키 (실제 배포 시 환경 변수로 관리해야 함)
NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'your_newsapi_key')

# 날씨 API 라우트
@api_bp.route('/weather', methods=['GET'])
@login_required
def get_weather():
    location = request.args.get('location', '서울')
    
    try:
        # 실제 API 키가 없으면 모의 데이터 사용
        if OPENWEATHER_API_KEY == 'your_openweather_api_key':
            return get_mock_weather(location)
            
        # OpenWeatherMap API 호출
        url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric&lang=kr"
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return get_mock_weather(location)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 뉴스 API 라우트
@api_bp.route('/news', methods=['GET'])
@login_required
def get_news():
    category = request.args.get('category', 'general')
    country = request.args.get('country', 'kr')
    
    try:
        # 실제 API 키가 없으면 모의 데이터 사용
        if NEWS_API_KEY == 'your_newsapi_key':
            return get_mock_news(category)
            
        # NewsAPI 호출
        url = f"https://newsapi.org/v2/top-headlines?country={country}&category={category}&apiKey={NEWS_API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return get_mock_news(category)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 암호화폐 API 라우트
@api_bp.route('/crypto', methods=['GET'])
@login_required
def get_crypto():
    coins_param = request.args.get('coins', 'bitcoin,ethereum,ripple')
    
    try:
        # CoinGecko API 호출 (무료, API 키 필요 없음)
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=krw&ids={coins_param}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h"
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return get_mock_crypto(coins_param)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 이미지 API 라우트 (Unsplash 대신 Pixabay 사용 - 무료)
@api_bp.route('/image', methods=['GET'])
@login_required
def get_image():
    query = request.args.get('query', 'nature')
    
    try:
        # Pixabay API 키가 없으면 모의 데이터 사용
        PIXABAY_API_KEY = os.getenv('PIXABAY_API_KEY', 'your_pixabay_api_key')
        if PIXABAY_API_KEY == 'your_pixabay_api_key':
            return get_mock_image(query)
            
        # Pixabay API 호출
        url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={query}&image_type=photo&per_page=3"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            # 이미지 URL만 추출
            images = [hit['largeImageURL'] for hit in data.get('hits', [])]
            return jsonify({'images': images})
        else:
            return get_mock_image(query)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 모의 날씨 데이터
def get_mock_weather(location):
    # 모의 날씨 데이터
    mock_data = {
        "coord": {"lon": 126.9778, "lat": 37.5683},
        "weather": [{"id": 800, "main": "Clear", "description": "맑음", "icon": "01d"}],
        "base": "stations",
        "main": {
            "temp": 22.5,
            "feels_like": 21.8,
            "temp_min": 20.1,
            "temp_max": 24.3,
            "pressure": 1015,
            "humidity": 65
        },
        "visibility": 10000,
        "wind": {"speed": 2.1, "deg": 280},
        "clouds": {"all": 0},
        "dt": int(datetime.now().timestamp()),
        "sys": {
            "type": 1,
            "id": 8105,
            "country": "KR",
            "sunrise": int((datetime.now().replace(hour=5, minute=30)).timestamp()),
            "sunset": int((datetime.now().replace(hour=19, minute=30)).timestamp())
        },
        "timezone": 32400,
        "id": 1835848,
        "name": location,
        "cod": 200
    }
    
    return jsonify(mock_data)

# 모의 뉴스 데이터
def get_mock_news(category):
    # 카테고리별 모의 뉴스 데이터
    categories = {
        'general': '일반',
        'business': '비즈니스',
        'technology': '기술',
        'entertainment': '엔터테인먼트',
        'sports': '스포츠',
        'science': '과학',
        'health': '건강'
    }
    
    # 모의 뉴스 데이터
    mock_data = {
        "status": "ok",
        "totalResults": 5,
        "articles": [
            {
                "source": {"id": "sample-news", "name": "샘플 뉴스"},
                "author": "기자 이름",
                "title": f"{categories.get(category, '일반')} 분야의 주요 뉴스 1",
                "description": "이것은 샘플 뉴스 설명입니다.",
                "url": "https://example.com/news/1",
                "urlToImage": "https://via.placeholder.com/300x200?text=News+Image",
                "publishedAt": datetime.now().isoformat(),
                "content": "뉴스 내용입니다..."
            },
            {
                "source": {"id": "sample-news", "name": "샘플 뉴스"},
                "author": "기자 이름",
                "title": f"{categories.get(category, '일반')} 분야의 주요 뉴스 2",
                "description": "이것은 샘플 뉴스 설명입니다.",
                "url": "https://example.com/news/2",
                "urlToImage": "https://via.placeholder.com/300x200?text=News+Image",
                "publishedAt": datetime.now().isoformat(),
                "content": "뉴스 내용입니다..."
            },
            {
                "source": {"id": "sample-news", "name": "샘플 뉴스"},
                "author": "기자 이름",
                "title": f"{categories.get(category, '일반')} 분야의 주요 뉴스 3",
                "description": "이것은 샘플 뉴스 설명입니다.",
                "url": "https://example.com/news/3",
                "urlToImage": "https://via.placeholder.com/300x200?text=News+Image",
                "publishedAt": datetime.now().isoformat(),
                "content": "뉴스 내용입니다..."
            },
            {
                "source": {"id": "sample-news", "name": "샘플 뉴스"},
                "author": "기자 이름",
                "title": f"{categories.get(category, '일반')} 분야의 주요 뉴스 4",
                "description": "이것은 샘플 뉴스 설명입니다.",
                "url": "https://example.com/news/4",
                "urlToImage": "https://via.placeholder.com/300x200?text=News+Image",
                "publishedAt": datetime.now().isoformat(),
                "content": "뉴스 내용입니다..."
            },
            {
                "source": {"id": "sample-news", "name": "샘플 뉴스"},
                "author": "기자 이름",
                "title": f"{categories.get(category, '일반')} 분야의 주요 뉴스 5",
                "description": "이것은 샘플 뉴스 설명입니다.",
                "url": "https://example.com/news/5",
                "urlToImage": "https://via.placeholder.com/300x200?text=News+Image",
                "publishedAt": datetime.now().isoformat(),
                "content": "뉴스 내용입니다..."
            }
        ]
    }
    
    return jsonify(mock_data)

# 모의 암호화폐 데이터
def get_mock_crypto(coins_param):
    coins = coins_param.split(',')
    
    # 코인별 모의 데이터
    coin_data = {
        'bitcoin': {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
            "current_price": 38500000,
            "market_cap": 750000000000000,
            "market_cap_rank": 1,
            "price_change_percentage_24h": 2.5,
            "last_updated": datetime.now().isoformat()
        },
        'ethereum': {
            "id": "ethereum",
            "symbol": "eth",
            "name": "Ethereum",
            "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
            "current_price": 2500000,
            "market_cap": 300000000000000,
            "market_cap_rank": 2,
            "price_change_percentage_24h": 1.8,
            "last_updated": datetime.now().isoformat()
        },
        'ripple': {
            "id": "ripple",
            "symbol": "xrp",
            "name": "XRP",
            "image": "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
            "current_price": 700,
            "market_cap": 35000000000000,
            "market_cap_rank": 5,
            "price_change_percentage_24h": -0.5,
            "last_updated": datetime.now().isoformat()
        },
        'solana': {
            "id": "solana",
            "symbol": "sol",
            "name": "Solana",
            "image": "https://assets.coingecko.com/coins/images/4128/large/solana.png",
            "current_price": 120000,
            "market_cap": 50000000000000,
            "market_cap_rank": 4,
            "price_change_percentage_24h": 3.2,
            "last_updated": datetime.now().isoformat()
        },
        'cardano': {
            "id": "cardano",
            "symbol": "ada",
            "name": "Cardano",
            "image": "https://assets.coingecko.com/coins/images/975/large/cardano.png",
            "current_price": 500,
            "market_cap": 18000000000000,
            "market_cap_rank": 8,
            "price_change_percentage_24h": 0.7,
            "last_updated": datetime.now().isoformat()
        }
    }
    
    # 요청된 코인 데이터만 반환
    result = []
    for coin in coins:
        if coin in coin_data:
            result.append(coin_data[coin])
    
    return jsonify(result)

# 모의 이미지 데이터
def get_mock_image(query):
    # 카테고리별 모의 이미지 URL
    categories = {
        'nature': [
            "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg",
            "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg",
            "https://images.pexels.com/photos/1287142/pexels-photo-1287142.jpeg"
        ],
        'city': [
            "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg",
            "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg",
            "https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg"
        ],
        'animals': [
            "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg",
            "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
            "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"
        ],
        'food': [
            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
            "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
            "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
        ]
    }
    
    # 기본 이미지 (요청한 카테고리가 없을 경우)
    default_images = [
        "https://images.pexels.com/photos/1287142/pexels-photo-1287142.jpeg",
        "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
    ]
    
    images = categories.get(query.lower(), default_images)
    
    return jsonify({'images': images})
