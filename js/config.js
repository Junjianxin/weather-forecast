/**
 * 天气预报应用配置
 */
const CONFIG = {
    // API设置 - 高德地图天气API
    API_KEY: 'xxxxxx', // 高德地图Web服务API密钥
    
    // 不再使用模拟数据
    USE_MOCK_DATA: false,
    
    // API端点 - 高德地图API
    BASE_URL: 'https://restapi.amap.com/v3',
    WEATHER_ENDPOINT: '/weather/weatherInfo',
    GEO_ENDPOINT: '/geocode/geo',
    REGEOCODING_ENDPOINT: '/geocode/regeo',
    IP_ENDPOINT: '/ip',
    
    // 本地存储键
    STORAGE_KEYS: {
        HISTORY_CITIES: 'weather_history_cities',
        LAST_CITY: 'weather_last_city',
        UNIT_PREFERENCE: 'weather_unit_preference'
    },
    
    // 应用设置
    MAX_HISTORY_CITIES: 8, // 最大历史城市数量
    HOURLY_FORECAST_COUNT: 24, // 小时预报显示数量
    DAILY_FORECAST_COUNT: 7, // 每日预报显示数量
    AUTO_REFRESH_INTERVAL: 30 * 60 * 1000, // 自动刷新间隔 (30分钟)
    
    // AQI（空气质量指数）等级
    AQI_LEVELS: [
        { max: 50, label: '优', color: '#4CAF50' },
        { max: 100, label: '良', color: '#8BC34A' },
        { max: 150, label: '轻度污染', color: '#FFEB3B' },
        { max: 200, label: '中度污染', color: '#FF9800' },
        { max: 300, label: '重度污染', color: '#FF5722' },
        { max: Infinity, label: '严重污染', color: '#9C27B0' }
    ],
    
    // 生活指数映射
    LIFE_INDEX: {
        UV: {
            0: { level: '最弱', suggestion: '无需防晒' },
            1: { level: '弱', suggestion: '涂抹SPF15防晒霜' },
            2: { level: '弱', suggestion: '涂抹SPF15防晒霜' },
            3: { level: '中等', suggestion: '涂抹SPF30防晒霜，戴帽子' },
            4: { level: '中等', suggestion: '涂抹SPF30防晒霜，戴帽子' },
            5: { level: '强', suggestion: '涂抹SPF50防晒霜，避免长时间户外活动' },
            6: { level: '强', suggestion: '涂抹SPF50防晒霜，避免长时间户外活动' },
            7: { level: '很强', suggestion: '涂抹SPF50+防晒霜，尽量避免户外活动' },
            8: { level: '很强', suggestion: '涂抹SPF50+防晒霜，尽量避免户外活动' },
            9: { level: '极强', suggestion: '避免户外活动' },
            10: { level: '极强', suggestion: '避免户外活动' },
            11: { level: '极强', suggestion: '避免户外活动' }
        }
    },
    
    // 天气图标映射 (从高德天气到我们自定义的图标)
    WEATHER_ICON_MAP: {
        '晴': { day: 'CLEAR_DAY', night: 'CLEAR_NIGHT' },
        '多云': { day: 'PARTLY_CLOUDY_DAY', night: 'PARTLY_CLOUDY_NIGHT' },
        '阴': { day: 'CLOUDY', night: 'CLOUDY' },
        '小雨': { day: 'RAIN', night: 'RAIN' },
        '中雨': { day: 'RAIN', night: 'RAIN' },
        '大雨': { day: 'RAIN', night: 'RAIN' },
        '暴雨': { day: 'RAIN', night: 'RAIN' },
        '雷阵雨': { day: 'THUNDERSTORM', night: 'THUNDERSTORM' },
        '雷电': { day: 'THUNDERSTORM', night: 'THUNDERSTORM' },
        '阵雨': { day: 'RAIN_DAY', night: 'RAIN_NIGHT' },
        '小雪': { day: 'SNOW', night: 'SNOW' },
        '中雪': { day: 'SNOW', night: 'SNOW' },
        '大雪': { day: 'SNOW', night: 'SNOW' },
        '暴雪': { day: 'SNOW', night: 'SNOW' },
        '阵雪': { day: 'SNOW', night: 'SNOW' },
        '雨夹雪': { day: 'SNOW', night: 'SNOW' },
        '雾': { day: 'FOG', night: 'FOG' },
        '霾': { day: 'FOG', night: 'FOG' },
        '沙尘暴': { day: 'FOG', night: 'FOG' },
        '浮尘': { day: 'FOG', night: 'FOG' },
        '扬沙': { day: 'FOG', night: 'FOG' },
        '强沙尘暴': { day: 'FOG', night: 'FOG' },
        '热': { day: 'CLOUDY', night: 'CLOUDY' },
        '冷': { day: 'CLOUDY', night: 'CLOUDY' },
        '未知': { day: 'CLOUDY', night: 'CLOUDY' }
    },
    
    // 根据天气情况和时间获取对应的图标
    getWeatherIconCode: (weather, isDay) => {
        const mapping = CONFIG.WEATHER_ICON_MAP[weather];
        if (!mapping) return isDay ? 'CLOUDY' : 'CLOUDY'; // 默认图标
        return isDay ? mapping.day : mapping.night;
    },
    
    // 穿衣指数计算
    CLOTHING_INDEX: {
        // 根据体感温度提供穿衣建议
        getIndex: (feelsLike) => {
            if (feelsLike >= 30) return { level: '炎热', suggestion: '轻薄透气的短袖短裤，防晒措施必不可少' };
            if (feelsLike >= 25) return { level: '热', suggestion: '短袖短裤，薄外套可选' };
            if (feelsLike >= 20) return { level: '温暖', suggestion: '短袖长裤或长袖短裤' };
            if (feelsLike >= 15) return { level: '舒适', suggestion: '长袖衬衫，薄长裤或薄夹克' };
            if (feelsLike >= 10) return { level: '凉爽', suggestion: '长袖衬衫加薄毛衣，薄夹克' };
            if (feelsLike >= 5) return { level: '微冷', suggestion: '毛衣，夹克或轻薄羽绒服' };
            if (feelsLike >= 0) return { level: '冷', suggestion: '毛衣，厚外套，围巾' };
            if (feelsLike >= -5) return { level: '寒冷', suggestion: '厚羽绒服，厚围巾，手套' };
            if (feelsLike >= -10) return { level: '极冷', suggestion: '厚羽绒服，冬帽，手套，厚围巾' };
            return { level: '极寒', suggestion: '多层保暖衣物，尽量减少户外活动' };
        }
    },
    
    // 运动指数计算
    SPORT_INDEX: {
        // 根据天气状况，温度，风速提供运动建议
        getIndex: (condition, temp, windSpeed) => {
            // 不适合运动的天气条件
            const badWeatherTexts = ['雨', '雪', '雷', '暴', '冰雹', '雾', '霾', '沙尘'];
            
            // 检查天气状况文本
            const hasBadWeather = badWeatherTexts.some(text => condition.includes(text));
            
            if (hasBadWeather) {
                return { level: '不宜', suggestion: '当前天气不适合户外运动' };
            }
            
            if (temp >= 35) {
                return { level: '不宜', suggestion: '温度过高，避免户外运动' };
            }
            
            if (temp <= 0) {
                return { level: '不宜', suggestion: '温度过低，避免户外运动' };
            }
            
            if (windSpeed >= 10) {
                return { level: '较不宜', suggestion: '风速较大，户外运动请注意安全' };
            }
            
            if (condition.includes('雾') || condition.includes('霾')) {
                return { level: '较不宜', suggestion: '能见度较低，户外运动请注意安全' };
            }
            
            if (temp >= 28 && temp < 35) {
                return { level: '较不宜', suggestion: '温度较高，建议清晨或傍晚运动，补充水分' };
            }
            
            if (temp > 0 && temp <= 5) {
                return { level: '较不宜', suggestion: '温度较低，建议室内运动或做好保暖' };
            }
            
            return { level: '适宜', suggestion: '天气适宜运动，注意补充水分' };
        }
    },
    
    // 洗车指数计算
    CAR_WASH_INDEX: {
        // 根据天气状况和降水概率提供洗车建议
        getIndex: (condition) => {
            const rainTexts = ['雨', '雪', '雷', '暴', '冰雹'];
            const dustTexts = ['尘', '沙', '霾'];
            
            const hasRain = rainTexts.some(text => condition.includes(text));
            const hasDust = dustTexts.some(text => condition.includes(text));
            
            if (hasRain) {
                return { level: '不宜', suggestion: '有降水，不建议洗车' };
            }
            
            if (hasDust) {
                return { level: '不宜', suggestion: '天气多尘，洗车后易脏' };
            }
            
            if (condition.includes('多云')) {
                return { level: '较不宜', suggestion: '天气多变，建议观察天气变化' };
            }
            
            return { level: '适宜', suggestion: '天气适宜洗车，较少灰尘和降水' };
        }
    }
}; 