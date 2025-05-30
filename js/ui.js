/**
 * UI处理模块
 * 负责DOM操作和界面更新
 */
const UI = {
    // DOM元素缓存
    elements: {
        app: document.getElementById('app'),
        cityInput: document.getElementById('city-input'),
        locationBtn: document.getElementById('location-btn'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        searchSuggestions: document.getElementById('search-suggestions'),
        cityHistory: document.getElementById('city-history'),
        celsiusBtn: document.getElementById('celsius'),
        fahrenheitBtn: document.getElementById('fahrenheit'),
        cityName: document.getElementById('city-name'),
        currentDate: document.getElementById('current-date'),
        currentTemp: document.getElementById('current-temp'),
        weatherIcon: document.getElementById('weather-icon'),
        weatherDesc: document.getElementById('weather-desc'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('wind-speed'),
        pressure: document.getElementById('pressure'),
        feelsLike: document.getElementById('feels-like'),
        aqiValue: document.getElementById('aqi-value'),
        aqiFill: document.getElementById('aqi-fill'),
        aqiLabel: document.getElementById('aqi-label'),
        weatherAlert: document.getElementById('weather-alert'),
        hourlyList: document.getElementById('hourly-list'),
        dailyList: document.getElementById('daily-list'),
        hourlyChart: document.getElementById('hourly-chart'),
        clothingIndex: document.getElementById('clothing-index'),
        uvIndex: document.getElementById('uv-index'),
        sportIndex: document.getElementById('sport-index'),
        carWashIndex: document.getElementById('car-wash-index'),
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('error-message'),
        errorText: document.getElementById('error-text'),
        retryBtn: document.getElementById('retry-btn'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabPanes: document.querySelectorAll('.tab-pane')
    },
    
    // 当前应用状态
    state: {
        unit: 'C',
        cityName: '',
        weatherData: null,
        isLoading: false,
        pendingCityName: false
    },
    
    /**
     * 初始化UI
     */
    init() {
        this.bindEvents();
        this.loadPreferences();
    },
    
    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        // 城市输入框事件
        this.elements.cityInput.addEventListener('input', Utils.debounce(this.handleCityInput.bind(this), 300));
        this.elements.cityInput.addEventListener('keypress', this.handleCityInputKeypress.bind(this));
        this.elements.cityInput.addEventListener('focus', this.handleCityInputFocus.bind(this));
        this.elements.cityInput.addEventListener('blur', this.handleCityInputBlur.bind(this));
        
        // 点击文档其他区域隐藏搜索建议
        document.addEventListener('click', (e) => {
            if (!this.elements.searchSuggestions.contains(e.target) && 
                e.target !== this.elements.cityInput) {
                this.elements.searchSuggestions.classList.remove('active');
            }
        });
        
        // 定位按钮事件
        this.elements.locationBtn.addEventListener('click', this.handleLocationClick.bind(this));
        
        // 清除历史记录按钮事件
        this.elements.clearHistoryBtn.addEventListener('click', this.handleClearHistoryClick.bind(this));
        
        // 温度单位切换事件
        this.elements.celsiusBtn.addEventListener('click', () => this.setTemperatureUnit('C'));
        this.elements.fahrenheitBtn.addEventListener('click', () => this.setTemperatureUnit('F'));
        
        // 标签页切换事件
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', this.handleTabClick.bind(this));
        });
        
        // 重试按钮事件
        this.elements.retryBtn.addEventListener('click', this.handleRetryClick.bind(this));
    },
    
    /**
     * 加载用户偏好设置
     */
    loadPreferences() {
        // 加载温度单位偏好
        const unitPreference = Utils.storage.get(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE, 'C');
        this.setTemperatureUnit(unitPreference, false);
        
        // 加载上次查询的城市
        const lastCity = Utils.storage.get(CONFIG.STORAGE_KEYS.LAST_CITY, '');
        if (lastCity) {
            try {
                // 尝试解析为JSON对象
                let cityData;
                if (typeof lastCity === 'string' && lastCity.startsWith('{')) {
                    cityData = JSON.parse(lastCity);
                    this.loadWeatherData(cityData.adcode || cityData.name);
                } else {
                    // 兼容旧格式
                    this.loadWeatherData(lastCity);
                }
            } catch (e) {
                console.error('解析上次城市数据失败:', e);
                // 如果解析失败，使用原始值
                this.loadWeatherData(lastCity);
            }
        } else {
            // 如果没有上次查询的城市，尝试获取当前位置
            this.handleLocationClick();
        }
        
        // 加载历史城市
        this.loadCityHistory();
    },
    
    /**
     * 处理城市输入事件
     * @param {Event} event - 输入事件对象
     */
    async handleCityInput(event) {
        const query = event.target.value.trim();
        
        if (query.length < 2) {
            this.elements.searchSuggestions.innerHTML = '';
            this.elements.searchSuggestions.classList.remove('active');
            return;
        }
        
        try {
            const suggestions = await WeatherAPI.searchCitySuggestions(query);
            this.renderCitySuggestions(suggestions);
        } catch (error) {
            console.error('搜索建议失败:', error);
        }
    },
    
    /**
     * 处理城市输入框按键事件
     * @param {KeyboardEvent} event - 键盘事件对象
     */
    handleCityInputKeypress(event) {
        if (event.key === 'Enter') {
            const cityName = this.elements.cityInput.value.trim();
            if (cityName) {
                this.loadWeatherData(cityName);
                this.elements.searchSuggestions.classList.remove('active');
            }
        }
    },
    
    /**
     * 处理定位按钮点击事件
     */
    async handleLocationClick() {
        this.showLoading();
        
        try {
            const data = await WeatherAPI.getWeatherByCurrentLocation();
            this.updateWeatherUI(data);
            this.saveCityToHistory(data.city.name, data.city.adcode);
            this.elements.cityInput.value = data.city.name;
            Utils.storage.set(CONFIG.STORAGE_KEYS.LAST_CITY, JSON.stringify({
                name: data.city.name,
                adcode: data.city.adcode
            }));
            this.state.cityName = data.city.name;
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    },
    
    /**
     * 处理标签页点击事件
     * @param {Event} event - 点击事件对象
     */
    handleTabClick(event) {
        const tabName = event.target.dataset.tab;
        
        // 更新标签按钮状态
        this.elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // 更新标签内容状态
        this.elements.tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-forecast` || pane.id === `${tabName}-index`);
        });
    },
    
    /**
     * 处理重试按钮点击事件
     */
    handleRetryClick() {
        this.elements.errorMessage.classList.remove('active');
        
        if (this.state.cityName) {
            this.loadWeatherData(this.state.cityName);
        } else {
            this.handleLocationClick();
        }
    },
    
    /**
     * 处理城市建议点击事件
     * @param {string} cityName - 城市名称
     * @param {number} lat - 纬度
     * @param {number} lon - 经度
     * @param {string} adcode - 城市行政区划代码
     */
    handleCitySuggestionClick(cityName, lat, lon, adcode) {
        this.elements.cityInput.value = cityName;
        this.elements.searchSuggestions.classList.remove('active');
        this.loadWeatherData(adcode || cityName);
    },
    
    /**
     * 处理历史城市点击事件
     * @param {string} cityName - 城市名称
     * @param {string} adcode - 城市行政区划代码
     */
    handleHistoryCityClick(cityName, adcode) {
        this.elements.cityInput.value = cityName;
        this.loadWeatherData(adcode || cityName);
    },
    
    /**
     * 加载天气数据
     * @param {string} cityNameOrAdcode - 城市名称或行政区划代码
     */
    async loadWeatherData(cityNameOrAdcode) {
        this.showLoading();
        
        try {
            const data = await WeatherAPI.getFullWeatherData(cityNameOrAdcode);
            this.updateWeatherUI(data);
            this.saveCityToHistory(data.city.name, data.city.adcode);
            Utils.storage.set(CONFIG.STORAGE_KEYS.LAST_CITY, JSON.stringify({
                name: data.city.name,
                adcode: data.city.adcode
            }));
            this.state.cityName = data.city.name;
        } catch (error) {
            this.showError(`无法获取"${cityNameOrAdcode}"的天气数据: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    },
    
    /**
     * 更新天气UI
     * @param {Object} data - 天气数据
     */
    updateWeatherUI(data) {
        this.state.weatherData = data;
        
        const { weather, city, airQuality } = data;
        const current = weather.current;
        const isDay = Utils.isDayTime(weather.current.sunrise, weather.current.sunset);
        
        // 更新页面主题
        document.body.className = Utils.getThemeClassByWeather(current.weather[0].main, isDay);
        
        // 确保城市名称正确显示，不显示为编码
        let displayCityName = city.name;
        if (!displayCityName || typeof displayCityName !== 'string' || /^\d+$/.test(displayCityName)) {
            // 如果城市名称为空或为纯数字，尝试从adcode获取城市名称
            this.fetchCityNameByAdcode(city.adcode);
            
            // 临时显示adcode或"未知城市"
            displayCityName = city.adcode ? `${city.adcode}` : "未知城市";
            
            // 记录需要更新城市名的状态
            this.state.pendingCityName = true;
        }
        
        // 更新基本天气信息
        this.elements.cityName.textContent = displayCityName;
        this.elements.currentDate.textContent = `${Utils.formatDate(current.dt * 1000, 'YYYY年MM月DD日')} ${Utils.getDayOfWeek(current.dt * 1000)}`;
        
        const temp = this.state.unit === 'C' ? current.temp : Utils.celsiusToFahrenheit(current.temp);
        this.elements.currentTemp.textContent = Utils.formatTemperature(temp, this.state.unit);
        
        // 更新天气图标
        this.elements.weatherIcon.innerHTML = getWeatherIcon(current.weather[0].icon);
        
        // 更新天气描述
        this.elements.weatherDesc.textContent = current.weather[0].description;
        
        // 更新详细信息
        this.elements.humidity.textContent = `${current.humidity}%`;
        this.elements.windSpeed.textContent = `${current.wind_speed.toFixed(1)} m/s ${Utils.getWindDirection(current.wind_deg)}`;
        this.elements.pressure.textContent = `${current.pressure} hPa`;
        
        const feelsLike = this.state.unit === 'C' ? current.feels_like : Utils.celsiusToFahrenheit(current.feels_like);
        this.elements.feelsLike.textContent = Utils.formatTemperature(feelsLike, this.state.unit);
        
        // 更新空气质量 - 高德API实际没有提供空气质量数据
        const airQualityElement = document.getElementById('air-quality');
        airQualityElement.style.display = 'none'; // 默认隐藏空气质量部分
        
        // 仅当有空气质量数据时才显示
        if (airQuality && airQuality.list && airQuality.list.length > 0) {
            airQualityElement.style.display = 'block';
            const aqi = airQuality.list[0].main.aqi;
            const aqiInfo = CONFIG.AQI_LEVELS.find(level => aqi <= level.max);
            
            this.elements.aqiValue.textContent = aqi;
            this.elements.aqiLabel.textContent = aqiInfo.label;
            this.elements.aqiFill.style.width = `${(aqi / 5) * 100}%`;
            this.elements.aqiFill.style.background = aqiInfo.color;
        }
        
        // 更新天气警报
        this.updateWeatherAlerts(weather.alerts);
        
        // 更新小时预报
        this.updateHourlyForecast(weather.hourly);
        
        // 更新每日预报
        this.updateDailyForecast(weather.daily);
        
        // 更新生活指数
        this.updateLifeIndices(weather);
    },
    
    /**
     * 更新天气警报
     * @param {Array} alerts - 警报数据
     */
    updateWeatherAlerts(alerts) {
        if (!alerts || alerts.length === 0) {
            this.elements.weatherAlert.classList.remove('active');
            this.elements.weatherAlert.innerHTML = '';
            return;
        }
        
        let alertHtml = '';
        
        alerts.forEach(alert => {
            alertHtml += `
                <div class="alert-item">
                    <div class="alert-title">⚠️ ${alert.event}</div>
                    <div class="alert-content">${alert.description}</div>
                </div>
            `;
        });
        
        this.elements.weatherAlert.innerHTML = alertHtml;
        this.elements.weatherAlert.classList.add('active');
    },
    
    /**
     * 更新小时预报
     * @param {Array} hourlyData - 小时预报数据
     */
    updateHourlyForecast(hourlyData) {
        if (!hourlyData || hourlyData.length === 0) return;
        
        const hourlyCount = Math.min(hourlyData.length, CONFIG.HOURLY_FORECAST_COUNT);
        let hourlyHtml = '';
        
        for (let i = 0; i < hourlyCount; i++) {
            const hourData = hourlyData[i];
            const time = i === 0 ? '现在' : Utils.formatTime(hourData.dt * 1000);
            const temp = this.state.unit === 'C' ? hourData.temp : Utils.celsiusToFahrenheit(hourData.temp);
            
            hourlyHtml += `
                <div class="hourly-item">
                    <div class="hourly-time">${time}</div>
                    <div class="hourly-icon">${getWeatherIcon(hourData.weather[0].icon)}</div>
                    <div class="hourly-temp">${Utils.formatTemperature(temp, this.state.unit)}</div>
                </div>
            `;
        }
        
        this.elements.hourlyList.innerHTML = hourlyHtml;
        
        // 更新小时温度图表
        const hourlyChartData = hourlyData.slice(0, hourlyCount).map(hour => {
            return {
                time: Utils.formatTime(hour.dt * 1000),
                temp: this.state.unit === 'C' ? hour.temp : Utils.celsiusToFahrenheit(hour.temp)
            };
        });
        
        WeatherChart.drawHourlyChart(this.elements.hourlyChart, hourlyChartData, this.state.unit);
    },
    
    /**
     * 更新每日预报
     * @param {Array} dailyData - 每日预报数据
     */
    updateDailyForecast(dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        const dailyCount = Math.min(dailyData.length, CONFIG.DAILY_FORECAST_COUNT);
        let dailyHtml = '';
        
        for (let i = 0; i < dailyCount; i++) {
            const dayData = dailyData[i];
            const date = new Date(dayData.dt * 1000);
            const dayName = i === 0 ? '今天' : Utils.getDayOfWeek(date, true);
            const dateStr = Utils.formatDate(date, 'MM/DD');
            
            const maxTemp = this.state.unit === 'C' ? dayData.temp.max : Utils.celsiusToFahrenheit(dayData.temp.max);
            const minTemp = this.state.unit === 'C' ? dayData.temp.min : Utils.celsiusToFahrenheit(dayData.temp.min);
            
            dailyHtml += `
                <div class="daily-item">
                    <div class="daily-date">
                        <div class="daily-day">${dayName}</div>
                        <div class="daily-date-num">${dateStr}</div>
                    </div>
                    <div class="daily-icon">${getWeatherIcon(dayData.weather[0].icon)}</div>
                    <div class="daily-temp">
                        <div class="daily-high">
                            <div class="daily-high-value">${Utils.formatTemperature(maxTemp, this.state.unit)}</div>
                            <div class="daily-high-label">高</div>
                        </div>
                        <div class="daily-low">
                            <div class="daily-low-value">${Utils.formatTemperature(minTemp, this.state.unit)}</div>
                            <div class="daily-low-label">低</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.elements.dailyList.innerHTML = dailyHtml;
    },
    
    /**
     * 更新生活指数
     * @param {Object} weatherData - 天气数据
     */
    updateLifeIndices(weatherData) {
        if (!weatherData || !weatherData.current) return;
        
        const current = weatherData.current;
        const daily = weatherData.daily[0];
        
        // 穿衣指数
        const clothingIndex = CONFIG.CLOTHING_INDEX.getIndex(current.feels_like);
        this.elements.clothingIndex.querySelector('.index-value').textContent = clothingIndex.level;
        this.elements.clothingIndex.setAttribute('title', clothingIndex.suggestion);
        
        // 紫外线指数
        const uvIndex = daily.uvi;
        const uvInfo = CONFIG.LIFE_INDEX.UV[Math.round(uvIndex)] || CONFIG.LIFE_INDEX.UV[11];
        this.elements.uvIndex.querySelector('.index-value').textContent = `${uvIndex} (${uvInfo.level})`;
        this.elements.uvIndex.setAttribute('title', uvInfo.suggestion);
        
        // 运动指数
        const sportIndex = CONFIG.SPORT_INDEX.getIndex(
            current.weather[0].main,
            current.temp,
            current.wind_speed
        );
        this.elements.sportIndex.querySelector('.index-value').textContent = sportIndex.level;
        this.elements.sportIndex.setAttribute('title', sportIndex.suggestion);
        
        // 洗车指数
        const carWashIndex = CONFIG.CAR_WASH_INDEX.getIndex(
            current.weather[0].main,
            daily.pop
        );
        this.elements.carWashIndex.querySelector('.index-value').textContent = carWashIndex.level;
        this.elements.carWashIndex.setAttribute('title', carWashIndex.suggestion);
    },
    
    /**
     * 渲染城市搜索建议
     * @param {Array} suggestions - 建议数据
     */
    renderCitySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            this.elements.searchSuggestions.classList.remove('active');
            return;
        }
        
        let suggestionsHtml = '';
        
        suggestions.forEach(city => {
            // 保持完整的城市名称，包括"市"后缀
            const displayName = city.name;
            
            // 构建位置信息
            let locationInfo = '';
            
            // 直辖市特殊处理
            const directCities = ['北京市', '上海市', '天津市', '重庆市', '香港特别行政区', '澳门特别行政区'];
            const isDirect = city.city && directCities.some(dc => city.city.includes(dc.replace(/市$|特别行政区$/, '')));
            
            if (isDirect) {
                // 直辖市只显示城市名
                locationInfo = '';
            } else if (city.level && (city.level.includes('区') || city.level.includes('县'))) {
                // 区县级：显示所属市和省，保留"市"和"省"后缀
                if (city.city && !city.name.includes(city.city)) {
                    if (city.province) {
                        locationInfo = `<span class="province">${city.city}，${city.province}</span>`;
                    } else {
                        locationInfo = `<span class="province">${city.city}</span>`;
                    }
                } else if (city.province) {
                    // 如果没有市信息，显示完整省名
                    locationInfo = `<span class="province">${city.province}</span>`;
                }
            } else if (city.level && city.level.includes('市')) {
                // 市级：显示所属省，保留完整省名
                if (city.province && !city.name.includes(city.province)) {
                    locationInfo = `<span class="province">${city.province}</span>`;
                }
            } else {
                // 其他情况：如果有省信息就显示完整省名
                if (city.province) {
                    locationInfo = `<span class="province">${city.province}</span>`;
                }
            }
            
            suggestionsHtml += `
                <div class="suggestion-item" data-city="${displayName}" data-lat="${city.lat}" data-lon="${city.lon}" data-adcode="${city.adcode}">
                    <span class="city-name">${displayName}</span>
                    ${locationInfo}
                </div>
            `;
        });
        
        this.elements.searchSuggestions.innerHTML = suggestionsHtml;
        this.elements.searchSuggestions.classList.add('active');
        
        // 添加点击事件
        const suggestionItems = this.elements.searchSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const cityName = item.dataset.city;
                const lat = item.dataset.lat;
                const lon = item.dataset.lon;
                const adcode = item.dataset.adcode;
                this.handleCitySuggestionClick(cityName, lat, lon, adcode);
            });
        });
    },
    
    /**
     * 加载城市历史记录
     */
    loadCityHistory() {
        const historyCities = Utils.storage.get(CONFIG.STORAGE_KEYS.HISTORY_CITIES, []);
        
        let historyHtml = '';
        
        if (historyCities.length === 0) {
            // 显示空状态提示
            this.elements.cityHistory.innerHTML = '<div class="history-empty">暂无历史记录</div>';
            return;
        }
        
        // 记录正在加载的城市数量
        let loadingCount = 0;
        const maxLoadingCount = 2; // 限制同时加载的城市数量
        
        historyCities.forEach(city => {
            // 兼容旧版本的历史记录
            const cityName = typeof city === 'object' ? city.name : city;
            const adcode = typeof city === 'object' ? city.adcode : city;
            
            // 确保城市名称不为空，避免显示编码
            if (cityName && typeof cityName === 'string' && !(/^\d+$/).test(cityName)) {
                // 处理长地区名称，提高显示效果
                let displayName = cityName;
                
                // 简化自治区、自治州等长名称
                if (displayName.includes('自治区') || displayName.includes('自治州')) {
                    // 保留主要名称部分
                    const nameParts = displayName.split('自治');
                    if (nameParts.length > 0) {
                        displayName = nameParts[0];
                    }
                }
                
                // 对特别长的名称进行截断
                if (displayName.length > 8) {
                    displayName = displayName.substring(0, 7) + '...';
                }
                
                historyHtml += `<div class="history-item" data-city="${cityName}" data-adcode="${adcode}" title="${cityName}">${displayName}</div>`;
            } else {
                // 如果城市名称为空或纯数字，尝试获取真实城市名称（下次加载时会显示正确）
                if (loadingCount < maxLoadingCount) {
                    this.fetchCityNameByAdcode(adcode);
                    loadingCount++;
                }
                historyHtml += `<div class="history-item" data-city="加载中..." data-adcode="${adcode}">加载中...</div>`;
            }
        });
        
        this.elements.cityHistory.innerHTML = historyHtml;
        
        // 添加点击事件
        const historyItems = this.elements.cityHistory.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const cityName = item.dataset.city;
                const adcode = item.dataset.adcode;
                this.elements.cityInput.value = cityName !== "加载中..." ? cityName : "";
                this.loadWeatherData(adcode || cityName);
            });
        });
    },
    
    /**
     * 通过行政区划代码获取真实城市名称
     * @param {string} adcode - 城市行政区划代码
     */
    async fetchCityNameByAdcode(adcode) {
        if (!adcode) return;
        
        try {
            const data = await WeatherAPI.getFullWeatherData(adcode);
            if (data && data.city && data.city.name) {
                const cityName = data.city.name;
                
                // 更新页面主城市名称（如果当前显示的是编码）
                if (this.state.pendingCityName && this.elements.cityName.textContent === adcode) {
                    this.elements.cityName.textContent = cityName;
                    this.state.pendingCityName = false;
                }
                
                // 更新历史记录中的城市名称
                let historyCities = Utils.storage.get(CONFIG.STORAGE_KEYS.HISTORY_CITIES, []);
                historyCities = historyCities.map(city => {
                    // 如果是对象且adcode匹配
                    if (typeof city === 'object' && city.adcode === adcode) {
                        return {
                            ...city,
                            name: cityName
                        };
                    }
                    // 如果是字符串且等于adcode
                    if (typeof city === 'string' && city === adcode) {
                        return {
                            name: cityName,
                            adcode: adcode
                        };
                    }
                    return city;
                });
                
                // 保存更新后的历史记录
                Utils.storage.set(CONFIG.STORAGE_KEYS.HISTORY_CITIES, historyCities);
                
                // 重新加载历史记录
                this.loadCityHistory();
            }
        } catch (error) {
            console.error('获取城市名称失败:', error);
        }
    },
    
    /**
     * 保存城市到历史记录
     * @param {string} cityName - 城市名称
     * @param {string} adcode - 城市行政区划代码
     */
    saveCityToHistory(cityName, adcode) {
        let historyCities = Utils.storage.get(CONFIG.STORAGE_KEYS.HISTORY_CITIES, []);
        
        // 如果已存在，先移除
        historyCities = historyCities.filter(city => 
            typeof city === 'object' ? city.name !== cityName : city !== cityName
        );
        
        // 添加到开头
        historyCities.unshift({
            name: cityName,
            adcode: adcode
        });
        
        // 限制数量
        historyCities = historyCities.slice(0, CONFIG.MAX_HISTORY_CITIES);
        
        // 保存到本地存储
        Utils.storage.set(CONFIG.STORAGE_KEYS.HISTORY_CITIES, historyCities);
        
        // 更新UI
        this.loadCityHistory();
    },
    
    /**
     * 设置温度单位
     * @param {string} unit - 温度单位 (C 或 F)
     * @param {boolean} updateUI - 是否更新UI
     */
    setTemperatureUnit(unit, updateUI = true) {
        if (unit !== 'C' && unit !== 'F') return;
        
        this.state.unit = unit;
        
        // 更新按钮状态
        this.elements.celsiusBtn.classList.toggle('active', unit === 'C');
        this.elements.fahrenheitBtn.classList.toggle('active', unit === 'F');
        
        // 保存到本地存储
        Utils.storage.set(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE, unit);
        
        // 如果需要，更新UI
        if (updateUI && this.state.weatherData) {
            this.updateWeatherUI(this.state.weatherData);
        }
    },
    
    /**
     * 显示加载状态
     */
    showLoading() {
        this.state.isLoading = true;
        this.elements.loading.classList.remove('hidden');
    },
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.state.isLoading = false;
        this.elements.loading.classList.add('hidden');
    },
    
    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.add('active');
    },
    
    /**
     * 处理清除历史记录按钮点击事件
     */
    handleClearHistoryClick() {
        // 清除本地存储中的历史记录
        Utils.storage.set(CONFIG.STORAGE_KEYS.HISTORY_CITIES, []);
        
        // 清空历史记录UI
        this.elements.cityHistory.innerHTML = '';
        
        // 显示提示消息
        this.showToast('历史记录已清空');
    },
    
    /**
     * 显示提示消息
     * @param {string} message - 提示消息
     * @param {number} duration - 显示时长(毫秒)
     */
    showToast(message, duration = 2000) {
        // 检查是否已有toast元素
        let toast = document.getElementById('toast-message');
        
        if (!toast) {
            // 创建toast元素
            toast = document.createElement('div');
            toast.id = 'toast-message';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // 设置消息并显示
        toast.textContent = message;
        toast.classList.add('show');
        
        // 设置自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },
    
    /**
     * 处理城市输入框获取焦点事件
     */
    handleCityInputFocus() {
        // 当输入框获取焦点时，清空输入框（可选，也可以保留内容）
        // this.elements.cityInput.value = '';
        
        // 添加一个特殊的类，可以用于样式调整
        this.elements.cityInput.classList.add('focused');
    },
    
    /**
     * 处理城市输入框失去焦点事件
     */
    handleCityInputBlur() {
        // 延迟一会儿隐藏建议，以便用户可以点击建议项
        setTimeout(() => {
            this.elements.searchSuggestions.classList.remove('active');
            this.elements.cityInput.classList.remove('focused');
        }, 200);
    }
}; 