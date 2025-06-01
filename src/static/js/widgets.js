// 위젯 타입별 기능을 처리하는 모듈
const Widgets = {
  // 위젯 컨텐츠 렌더링
  renderContent: function(container, widget) {
    switch (widget.widget_type) {
      case 'weather':
        this.renderWeatherWidget(container, widget);
        break;
      case 'news':
        this.renderNewsWidget(container, widget);
        break;
      case 'crypto':
        this.renderCryptoWidget(container, widget);
        break;
      case 'image':
        this.renderImageWidget(container, widget);
        break;
      default:
        container.textContent = '지원되지 않는 위젯 타입입니다.';
    }
  },
  
  // 날씨 위젯 렌더링
  renderWeatherWidget: function(container, widget) {
    container.innerHTML = `
      <div class="weather-widget-content">
        <div class="weather-loading">날씨 정보를 불러오는 중...</div>
      </div>
    `;
    
    // 위젯 설정에서 위치 정보 가져오기
    const location = widget.settings?.location || '서울';
    
    // 날씨 API 호출
    this.fetchWeatherData(location)
      .then(data => {
        if (data) {
          container.innerHTML = this.createWeatherHTML(data, location);
        } else {
          container.innerHTML = `<div class="error-message">날씨 정보를 불러올 수 없습니다.</div>`;
        }
      })
      .catch(error => {
        console.error('날씨 데이터 조회 오류:', error);
        container.innerHTML = `<div class="error-message">날씨 정보를 불러올 수 없습니다.</div>`;
      });
  },
  
  // 뉴스 위젯 렌더링
  renderNewsWidget: function(container, widget) {
    container.innerHTML = `
      <div class="news-widget-content">
        <div class="news-loading">뉴스를 불러오는 중...</div>
      </div>
    `;
    
    // 위젯 설정에서 카테고리 정보 가져오기
    const category = widget.settings?.category || 'general';
    
    // 뉴스 API 호출
    this.fetchNewsData(category)
      .then(data => {
        if (data && data.articles) {
          container.innerHTML = this.createNewsHTML(data.articles);
        } else {
          container.innerHTML = `<div class="error-message">뉴스를 불러올 수 없습니다.</div>`;
        }
      })
      .catch(error => {
        console.error('뉴스 데이터 조회 오류:', error);
        container.innerHTML = `<div class="error-message">뉴스를 불러올 수 없습니다.</div>`;
      });
  },
  
  // 암호화폐 위젯 렌더링
  renderCryptoWidget: function(container, widget) {
    container.innerHTML = `
      <div class="crypto-widget-content">
        <div class="crypto-loading">암호화폐 정보를 불러오는 중...</div>
      </div>
    `;
    
    // 위젯 설정에서 코인 정보 가져오기
    const coins = widget.settings?.coins || ['BTC', 'ETH', 'XRP'];
    
    // 암호화폐 API 호출
    this.fetchCryptoData(coins)
      .then(data => {
        if (data) {
          container.innerHTML = this.createCryptoHTML(data);
        } else {
          container.innerHTML = `<div class="error-message">암호화폐 정보를 불러올 수 없습니다.</div>`;
        }
      })
      .catch(error => {
        console.error('암호화폐 데이터 조회 오류:', error);
        container.innerHTML = `<div class="error-message">암호화폐 정보를 불러올 수 없습니다.</div>`;
      });
  },
  
  // 이미지 위젯 렌더링
  renderImageWidget: function(container, widget) {
    // 위젯 설정에서 이미지 URL 가져오기
    const imageUrl = widget.settings?.imageUrl || 'https://source.unsplash.com/random/300x200';
    
    container.innerHTML = `
      <div class="image-widget-content">
        <img src="${imageUrl}" alt="위젯 이미지" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `;
  },
  
  // 날씨 데이터 가져오기
  fetchWeatherData: async function(location) {
    try {
      // OpenWeatherMap API 사용 (실제 구현 시 서버 측에서 API 키 관리 필요)
      const response = await fetch(`/api/widget/weather?location=${encodeURIComponent(location)}`);
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('날씨 API 오류:', error);
      return null;
    }
  },
  
  // 뉴스 데이터 가져오기
  fetchNewsData: async function(category) {
    try {
      // News API 사용 (실제 구현 시 서버 측에서 API 키 관리 필요)
      const response = await fetch(`/api/widget/news?category=${encodeURIComponent(category)}`);
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('뉴스 API 오류:', error);
      return null;
    }
  },
  
  // 암호화폐 데이터 가져오기
  fetchCryptoData: async function(coins) {
    try {
      // CoinGecko API 사용
      const coinsParam = coins.join(',');
      const response = await fetch(`/api/widget/crypto?coins=${encodeURIComponent(coinsParam)}`);
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('암호화폐 API 오류:', error);
      return null;
    }
  },
  
  // 날씨 HTML 생성
  createWeatherHTML: function(data, location) {
    const temp = Math.round(data.main.temp);
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    return `
      <div class="weather-info">
        <div class="weather-location">${location}</div>
        <div class="weather-main">
          <img src="${weatherIcon}" alt="${data.weather[0].description}" class="weather-icon">
          <div class="weather-temp">${temp}°C</div>
        </div>
        <div class="weather-description">${data.weather[0].description}</div>
        <div class="weather-details">
          <div class="weather-detail">
            <i class="fas fa-tint"></i> 습도: ${data.main.humidity}%
          </div>
          <div class="weather-detail">
            <i class="fas fa-wind"></i> 풍속: ${data.wind.speed}m/s
          </div>
        </div>
      </div>
    `;
  },
  
  // 뉴스 HTML 생성
  createNewsHTML: function(articles) {
    let html = '<div class="news-list">';
    
    // 최대 5개 기사만 표시
    const displayArticles = articles.slice(0, 5);
    
    displayArticles.forEach(article => {
      html += `
        <div class="news-item">
          <div class="news-title">
            <a href="${article.url}" target="_blank">${article.title}</a>
          </div>
          <div class="news-source">${article.source.name} · ${this.formatDate(article.publishedAt)}</div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  },
  
  // 암호화폐 HTML 생성
  createCryptoHTML: function(data) {
    let html = '<div class="crypto-list">';
    
    data.forEach(coin => {
      const priceChange = coin.price_change_percentage_24h;
      const priceChangeClass = priceChange >= 0 ? 'price-up' : 'price-down';
      const priceChangeIcon = priceChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';
      
      html += `
        <div class="crypto-item">
          <div class="crypto-info">
            <img src="${coin.image}" alt="${coin.name}" class="crypto-icon">
            <div class="crypto-name">${coin.name} (${coin.symbol.toUpperCase()})</div>
          </div>
          <div class="crypto-price">
            ₩${this.formatNumber(coin.current_price)}
            <span class="${priceChangeClass}">
              <i class="fas ${priceChangeIcon}"></i>
              ${Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  },
  
  // 위젯 설정 열기
  openSettings: function(widget) {
    // 위젯 타입에 따라 다른 설정 UI 표시
    switch (widget.widget_type) {
      case 'weather':
        this.openWeatherSettings(widget);
        break;
      case 'news':
        this.openNewsSettings(widget);
        break;
      case 'crypto':
        this.openCryptoSettings(widget);
        break;
      case 'image':
        this.openImageSettings(widget);
        break;
    }
  },
  
  // 날씨 위젯 설정 열기
  openWeatherSettings: function(widget) {
    const location = widget.settings?.location || '서울';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">날씨 위젯 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="weather-location">위치</label>
            <input type="text" id="weather-location" class="form-control" value="${location}">
          </div>
          <button id="save-weather-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-weather-settings').addEventListener('click', () => {
      const newLocation = document.getElementById('weather-location').value;
      
      // 위젯 설정 업데이트
      Dashboard.updateWidget(widget.id, {
        settings: {
          ...widget.settings,
          location: newLocation
        }
      });
      
      // 위젯 다시 렌더링
      const widgetContent = document.querySelector(`#widget-${widget.id} .widget-content`);
      this.renderWeatherWidget(widgetContent, {
        ...widget,
        settings: {
          ...widget.settings,
          location: newLocation
        }
      });
      
      modal.remove();
    });
  },
  
  // 뉴스 위젯 설정 열기
  openNewsSettings: function(widget) {
    const category = widget.settings?.category || 'general';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">뉴스 위젯 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="news-category">카테고리</label>
            <select id="news-category" class="form-control">
              <option value="general" ${category === 'general' ? 'selected' : ''}>일반</option>
              <option value="business" ${category === 'business' ? 'selected' : ''}>비즈니스</option>
              <option value="technology" ${category === 'technology' ? 'selected' : ''}>기술</option>
              <option value="entertainment" ${category === 'entertainment' ? 'selected' : ''}>엔터테인먼트</option>
              <option value="sports" ${category === 'sports' ? 'selected' : ''}>스포츠</option>
              <option value="science" ${category === 'science' ? 'selected' : ''}>과학</option>
              <option value="health" ${category === 'health' ? 'selected' : ''}>건강</option>
            </select>
          </div>
          <button id="save-news-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-news-settings').addEventListener('click', () => {
      const newCategory = document.getElementById('news-category').value;
      
      // 위젯 설정 업데이트
      Dashboard.updateWidget(widget.id, {
        settings: {
          ...widget.settings,
          category: newCategory
        }
      });
      
      // 위젯 다시 렌더링
      const widgetContent = document.querySelector(`#widget-${widget.id} .widget-content`);
      this.renderNewsWidget(widgetContent, {
        ...widget,
        settings: {
          ...widget.settings,
          category: newCategory
        }
      });
      
      modal.remove();
    });
  },
  
  // 암호화폐 위젯 설정 열기
  openCryptoSettings: function(widget) {
    const coins = widget.settings?.coins || ['BTC', 'ETH', 'XRP'];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">암호화폐 위젯 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>표시할 코인</label>
            <div class="crypto-options">
              <div class="form-check">
                <input type="checkbox" id="crypto-btc" class="form-check-input" ${coins.includes('BTC') ? 'checked' : ''}>
                <label for="crypto-btc" class="form-check-label">비트코인 (BTC)</label>
              </div>
              <div class="form-check">
                <input type="checkbox" id="crypto-eth" class="form-check-input" ${coins.includes('ETH') ? 'checked' : ''}>
                <label for="crypto-eth" class="form-check-label">이더리움 (ETH)</label>
              </div>
              <div class="form-check">
                <input type="checkbox" id="crypto-xrp" class="form-check-input" ${coins.includes('XRP') ? 'checked' : ''}>
                <label for="crypto-xrp" class="form-check-label">리플 (XRP)</label>
              </div>
              <div class="form-check">
                <input type="checkbox" id="crypto-sol" class="form-check-input" ${coins.includes('SOL') ? 'checked' : ''}>
                <label for="crypto-sol" class="form-check-label">솔라나 (SOL)</label>
              </div>
              <div class="form-check">
                <input type="checkbox" id="crypto-ada" class="form-check-input" ${coins.includes('ADA') ? 'checked' : ''}>
                <label for="crypto-ada" class="form-check-label">카르다노 (ADA)</label>
              </div>
            </div>
          </div>
          <button id="save-crypto-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-crypto-settings').addEventListener('click', () => {
      const newCoins = [];
      if (document.getElementById('crypto-btc').checked) newCoins.push('BTC');
      if (document.getElementById('crypto-eth').checked) newCoins.push('ETH');
      if (document.getElementById('crypto-xrp').checked) newCoins.push('XRP');
      if (document.getElementById('crypto-sol').checked) newCoins.push('SOL');
      if (document.getElementById('crypto-ada').checked) newCoins.push('ADA');
      
      // 최소 1개 이상 선택되어야 함
      if (newCoins.length === 0) {
        alert('최소 1개 이상의 코인을 선택해주세요.');
        return;
      }
      
      // 위젯 설정 업데이트
      Dashboard.updateWidget(widget.id, {
        settings: {
          ...widget.settings,
          coins: newCoins
        }
      });
      
      // 위젯 다시 렌더링
      const widgetContent = document.querySelector(`#widget-${widget.id} .widget-content`);
      this.renderCryptoWidget(widgetContent, {
        ...widget,
        settings: {
          ...widget.settings,
          coins: newCoins
        }
      });
      
      modal.remove();
    });
  },
  
  // 이미지 위젯 설정 열기
  openImageSettings: function(widget) {
    const imageUrl = widget.settings?.imageUrl || 'https://source.unsplash.com/random/300x200';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">이미지 위젯 설정</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="image-url">이미지 URL</label>
            <input type="text" id="image-url" class="form-control" value="${imageUrl}">
          </div>
          <div class="form-group">
            <label>또는 카테고리 선택</label>
            <div class="image-categories">
              <button class="btn btn-outline image-category" data-category="nature">자연</button>
              <button class="btn btn-outline image-category" data-category="city">도시</button>
              <button class="btn btn-outline image-category" data-category="animals">동물</button>
              <button class="btn btn-outline image-category" data-category="food">음식</button>
            </div>
          </div>
          <button id="save-image-settings" class="btn btn-primary">저장</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 닫기 버튼 이벤트
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    // 카테고리 버튼 이벤트
    const categoryButtons = modal.querySelectorAll('.image-category');
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        document.getElementById('image-url').value = `https://source.unsplash.com/featured/?${category}`;
      });
    });
    
    // 저장 버튼 이벤트
    modal.querySelector('#save-image-settings').addEventListener('click', () => {
      const newImageUrl = document.getElementById('image-url').value;
      
      // 위젯 설정 업데이트
      Dashboard.updateWidget(widget.id, {
        settings: {
          ...widget.settings,
          imageUrl: newImageUrl
        }
      });
      
      // 위젯 다시 렌더링
      const widgetContent = document.querySelector(`#widget-${widget.id} .widget-content`);
      this.renderImageWidget(widgetContent, {
        ...widget,
        settings: {
          ...widget.settings,
          imageUrl: newImageUrl
        }
      });
      
      modal.remove();
    });
  },
  
  // 날짜 포맷팅
  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // 숫자 포맷팅 (천 단위 콤마)
  formatNumber: function(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};
