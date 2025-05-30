/**
 * API服务模块
 * 处理所有与高德地图API的交互
 */
const WeatherAPI = {
    /**
     * 搜索城市
     * @param {string} query - 搜索关键词
     * @returns {Promise<Array>} 包含城市建议的Promise
     */
    async searchCity(query) {
        if (!query || typeof query !== 'string' || query.length < 2) return [];
        
        try {
            // 预定义的直辖市和特别行政区的特殊处理
            const directCities = {
                '北京': { adcode: '110000', city: '北京市', province: '北京市', level: '市', location: '116.407394,39.904211' },
                '上海': { adcode: '310000', city: '上海市', province: '上海市', level: '市', location: '121.473667,31.230525' },
                '天津': { adcode: '120000', city: '天津市', province: '天津市', level: '市', location: '117.190186,39.125595' },
                '重庆': { adcode: '500000', city: '重庆市', province: '重庆市', level: '市', location: '106.504959,29.533155' },
                '香港': { adcode: '810000', city: '香港特别行政区', province: '香港特别行政区', level: '特别行政区', location: '114.173355,22.320047' },
                '澳门': { adcode: '820000', city: '澳门特别行政区', province: '澳门特别行政区', level: '特别行政区', location: '113.549088,22.198952' }
            };
            
            // 预定义的常见城市
            const commonCities = {
                '广州': { adcode: '440100', city: '广州市', province: '广东省', level: '市', location: '113.280637,23.125178' },
                '深圳': { adcode: '440300', city: '深圳市', province: '广东省', level: '市', location: '114.085947,22.547' },
                '杭州': { adcode: '330100', city: '杭州市', province: '浙江省', level: '市', location: '120.153576,30.287459' },
                '南京': { adcode: '320100', city: '南京市', province: '江苏省', level: '市', location: '118.767413,32.041544' },
                '成都': { adcode: '510100', city: '成都市', province: '四川省', level: '市', location: '104.065735,30.659462' },
                '武汉': { adcode: '420100', city: '武汉市', province: '湖北省', level: '市', location: '114.298572,30.584355' },
                '西安': { adcode: '610100', city: '西安市', province: '陕西省', level: '市', location: '108.948024,34.263161' },
                '苏州': { adcode: '320500', city: '苏州市', province: '江苏省', level: '市', location: '120.619585,31.299379' },
                '长沙': { adcode: '430100', city: '长沙市', province: '湖南省', level: '市', location: '112.982279,28.19409' },
                '沈阳': { adcode: '210100', city: '沈阳市', province: '辽宁省', level: '市', location: '123.429096,41.796767' },
                '青岛': { adcode: '370200', city: '青岛市', province: '山东省', level: '市', location: '120.355173,36.082982' },
                '郑州': { adcode: '410100', city: '郑州市', province: '河南省', level: '市', location: '113.665412,34.757975' },
                '大连': { adcode: '210200', city: '大连市', province: '辽宁省', level: '市', location: '121.618622,38.91459' },
                '宁波': { adcode: '330200', city: '宁波市', province: '浙江省', level: '市', location: '121.549792,29.868388' },
                '厦门': { adcode: '350200', city: '厦门市', province: '福建省', level: '市', location: '118.11022,24.490474' },
                '福州': { adcode: '350100', city: '福州市', province: '福建省', level: '市', location: '119.306239,26.075302' },
                '济南': { adcode: '370100', city: '济南市', province: '山东省', level: '市', location: '117.000923,36.675807' },
                '哈尔滨': { adcode: '230100', city: '哈尔滨市', province: '黑龙江省', level: '市', location: '126.642464,45.756967' },
                '长春': { adcode: '220100', city: '长春市', province: '吉林省', level: '市', location: '125.3245,43.886841' }
            };
            
            // 合并城市列表
            const predefinedCities = { ...directCities, ...commonCities };
            
            // 检查直辖市和常见城市的精确匹配
            for (const [key, value] of Object.entries(predefinedCities)) {
                if (query === key || query === key + '市' || query === value.city) {
                    return [value];
                }
            }
            
            // 检查部分匹配的常见城市
            const partialMatches = [];
            for (const [key, value] of Object.entries(predefinedCities)) {
                if (key.includes(query) || query.includes(key) || 
                    value.city.includes(query) || query.includes(value.city)) {
                    partialMatches.push(value);
                }
            }
            
            // 如果有部分匹配的预定义城市，优先返回这些
            if (partialMatches.length > 0) {
                // 对匹配结果进行排序，完全匹配的排在前面
                partialMatches.sort((a, b) => {
                    const aExactMatch = a.city === query || a.city.replace('市', '') === query;
                    const bExactMatch = b.city === query || b.city.replace('市', '') === query;
                    
                    if (aExactMatch && !bExactMatch) return -1;
                    if (!aExactMatch && bExactMatch) return 1;
                    
                    // 如果都是部分匹配，则按匹配度（包含字符的百分比）排序
                    const aMatchRatio = Math.max(
                        query.length / a.city.length,
                        a.city.length / query.length
                    );
                    const bMatchRatio = Math.max(
                        query.length / b.city.length,
                        b.city.length / query.length
                    );
                    
                    return bMatchRatio - aMatchRatio;
                });
                
                return partialMatches.slice(0, 8);
            }
            
            const sanitizedQuery = Utils.sanitizeSearchKeyword(query);
            const url = `${CONFIG.BASE_URL}${CONFIG.GEO_ENDPOINT}?key=${CONFIG.API_KEY}&address=${encodeURIComponent(sanitizedQuery)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`城市搜索API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
                // 再次检查是否包含直辖市或特别行政区的部分匹配
                const matchedCities = [];
                for (const [key, value] of Object.entries(predefinedCities)) {
                    if (key.includes(query) || query.includes(key)) {
                        matchedCities.push(value);
                    }
                }
                if (matchedCities.length > 0) {
                    return matchedCities;
                }
                return [];
            }
            
            // 过滤和优化搜索结果
            const filteredResults = data.geocodes.filter(item => {
                // 优先处理市级和区县级结果
                if (item.level) {
                    // 包含直辖市或特别行政区的结果优先
                    if (item.city && Object.keys(directCities).some(city => item.city.includes(city))) {
                        return true;
                    }
                    
                    // 保留市区县级结果，过滤掉省级和其他不具体的结果
                    return (
                        item.level.includes('市') || 
                        item.level.includes('区') || 
                        item.level.includes('县') || 
                        (item.city && item.city.length > 0)
                    );
                }
                return false;
            });
            
            // 对结果进行排序：城市 > 区县 > 其他
            filteredResults.sort((a, b) => {
                // 直辖市最优先
                const aIsDirect = a.city && Object.keys(directCities).some(city => a.city.includes(city));
                const bIsDirect = b.city && Object.keys(directCities).some(city => b.city.includes(city));
                
                if (aIsDirect && !bIsDirect) return -1;
                if (!aIsDirect && bIsDirect) return 1;
                
                // 其次是地级市
                const aIsCity = a.level && a.level.includes('市');
                const bIsCity = b.level && b.level.includes('市');
                
                if (aIsCity && !bIsCity) return -1;
                if (!aIsCity && bIsCity) return 1;
                
                // 最后是区县
                const aIsDistrict = a.level && (a.level.includes('区') || a.level.includes('县'));
                const bIsDistrict = b.level && (b.level.includes('区') || b.level.includes('县'));
                
                if (aIsDistrict && !bIsDistrict) return -1;
                if (!aIsDistrict && bIsDistrict) return 1;
                
                return 0;
            });
            
            return filteredResults.slice(0, 8); // 限制结果数量，避免过多搜索结果
        } catch (error) {
            console.error('城市搜索失败:', error);
            return [];
        }
    },
    
    /**
     * 获取天气数据
     * @param {string} cityAdcode - 城市行政区划代码
     * @returns {Promise<Object>} 包含天气数据的Promise
     */
    async getWeather(cityAdcode) {
        try {
            const url = `${CONFIG.BASE_URL}${CONFIG.WEATHER_ENDPOINT}?key=${CONFIG.API_KEY}&city=${cityAdcode}&extensions=all`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`天气API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status !== '1' || !data.forecasts || data.forecasts.length === 0) {
                throw new Error('无天气数据');
            }
            
            return data.forecasts[0];
        } catch (error) {
            console.error('获取天气预报失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取实时天气
     * @param {string} cityAdcode - 城市行政区划代码
     * @returns {Promise<Object>} 包含实时天气数据的Promise
     */
    async getLiveWeather(cityAdcode) {
        try {
            const url = `${CONFIG.BASE_URL}${CONFIG.WEATHER_ENDPOINT}?key=${CONFIG.API_KEY}&city=${cityAdcode}&extensions=base`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`实时天气API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status !== '1' || !data.lives || data.lives.length === 0) {
                throw new Error('无实时天气数据');
            }
            
            return data.lives[0];
        } catch (error) {
            console.error('获取实时天气失败:', error);
            throw error;
        }
    },
    
    /**
     * 根据IP获取城市信息
     * @returns {Promise<Object>} 包含IP定位城市信息的Promise
     */
    async getLocationByIP() {
        try {
            const url = `${CONFIG.BASE_URL}${CONFIG.IP_ENDPOINT}?key=${CONFIG.API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`IP定位API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status !== '1') {
                throw new Error('IP定位失败');
            }
            
            return {
                adcode: data.adcode,
                city: data.city,
                province: data.province
            };
        } catch (error) {
            console.error('IP定位失败:', error);
            throw error;
        }
    },
    
    /**
     * 根据经纬度获取城市信息
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @returns {Promise<Object>} 包含城市信息的Promise
     */
    async getCityByLocation(lat, lng) {
        try {
            const url = `${CONFIG.BASE_URL}${CONFIG.REGEOCODING_ENDPOINT}?key=${CONFIG.API_KEY}&location=${lng},${lat}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`逆地理编码API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status !== '1' || !data.regeocode || !data.regeocode.addressComponent) {
                throw new Error('逆地理编码失败');
            }
            
            const addressComponent = data.regeocode.addressComponent;
            return {
                adcode: addressComponent.adcode,
                city: addressComponent.city || addressComponent.district,
                province: addressComponent.province
            };
        } catch (error) {
            console.error('获取城市信息失败:', error);
            throw error;
        }
    },
    
    /**
     * 格式化高德天气数据为应用所需格式
     * @param {Object} liveData - 实时天气数据
     * @param {Object} forecastData - 天气预报数据
     * @param {string} cityName - 城市名称
     * @param {string} adcode - 城市行政区划代码
     * @returns {Object} 格式化后的天气数据
     */
    formatWeatherData(liveData, forecastData, cityName, adcode) {
        if (!liveData || !forecastData || !forecastData.casts || forecastData.casts.length === 0) {
            throw new Error('无效的天气数据');
        }
        
        // 当前是否为白天 (8:00-18:00)
        const now = new Date();
        const hour = now.getHours();
        const isDay = hour >= 8 && hour < 18;
        
        // 提取实时天气数据
        const current = {
            dt: Math.floor(Date.now() / 1000),
            sunrise: '06:00', // 高德API没有提供日出日落信息，使用默认值
            sunset: '18:00',
            temp: parseFloat(liveData.temperature),
            feels_like: parseFloat(liveData.temperature), // 高德API没有提供体感温度，使用实际温度代替
            pressure: 1013, // 高德API没有提供气压数据，使用标准大气压
            humidity: parseFloat(liveData.humidity),
            wind_speed: this.convertWindSpeed(liveData.windpower), // 将风力等级转换为风速
            wind_deg: this.convertWindDirectionToDegrees(liveData.winddirection),
            weather: [{
                id: 0,
                main: liveData.weather,
                description: liveData.weather,
                icon: CONFIG.getWeatherIconCode(liveData.weather, isDay)
            }]
        };
        
        // 提取预报数据
        const daily = forecastData.casts.map(cast => {
            const date = new Date(cast.date);
            return {
                dt: Math.floor(date.getTime() / 1000),
                temp: {
                    max: parseFloat(cast.daytemp),
                    min: parseFloat(cast.nighttemp)
                },
                weather: [{
                    id: 0,
                    main: cast.dayweather,
                    description: cast.dayweather,
                    icon: CONFIG.getWeatherIconCode(cast.dayweather, true)
                }],
                pop: 0, // 高德API没有提供降水概率
                uvi: 5 // 高德API没有提供UV指数，使用中等值代替
            };
        });
        
        // 创建模拟的小时预报数据 (由于高德API没有提供小时预报)
        const hourly = this.generateHourlyForecast(daily, current);
        
        // 构建最终数据结构
        return {
            city: {
                name: cityName,
                adcode: adcode,
                lat: 0, // 高德API没有提供经纬度
                lon: 0,
                country: "中国"
            },
            weather: {
                current,
                hourly,
                daily,
                alerts: []
            },
            airQuality: null, // 高德API没有提供空气质量数据
            indices: [] // 高德API没有提供生活指数
        };
    },
    
    /**
     * 将风力等级转换为风速（米/秒）
     * @param {string} windpower - 风力等级字符串
     * @returns {number} 风速（米/秒）
     */
    convertWindSpeed(windpower) {
        // 去除可能的非数字字符，如"≤3"转为"3"
        const cleanPower = windpower.replace(/[^\d.]/g, '');
        
        // 风力等级对照表（单位：米/秒）
        const windSpeedMap = {
            '0': 0.0,      // 无风
            '1': 0.5,      // 1级微风
            '2': 2.0,      // 2级微风
            '3': 3.5,      // 3级微风
            '4': 5.5,      // 4级和风
            '5': 8.0,      // 5级和风
            '6': 10.5,     // 6级和风
            '7': 13.5,     // 7级强风
            '8': 16.5,     // 8级强风
            '9': 20.0,     // 9级大风
            '10': 23.5,    // 10级大风
            '11': 27.5,    // 11级暴风
            '12': 32.0     // 12级及以上台风
        };
        
        // 如果是有效的风力等级，返回对应的风速，否则返回默认值
        if (cleanPower && windSpeedMap[cleanPower]) {
            return windSpeedMap[cleanPower];
        }
        
        // 如果是数字但没有对应映射，尝试直接解析
        if (!isNaN(cleanPower) && cleanPower !== '') {
            const power = parseInt(cleanPower);
            if (power >= 0 && power <= 12) {
                return windSpeedMap[power] || 0;
            }
        }
        
        // 默认返回0风速
        return 0;
    },
    
    /**
     * 根据风向字符串转换为角度
     * @param {string} direction - 风向字符串
     * @returns {number} 风向角度
     */
    convertWindDirectionToDegrees(direction) {
        const directions = {
            '北': 0,
            '东北': 45,
            '东': 90,
            '东南': 135,
            '南': 180,
            '西南': 225,
            '西': 270,
            '西北': 315
        };
        
        for (const [key, value] of Object.entries(directions)) {
            if (direction.includes(key)) {
                return value;
            }
        }
        
        return 0; // 默认为北风
    },
    
    /**
     * 生成模拟的小时预报数据
     * @param {Array} dailyForecast - 每日预报数据
     * @param {Object} current - 当前天气数据
     * @returns {Array} 小时预报数据
     */
    generateHourlyForecast(dailyForecast, current) {
        const hourly = [];
        const now = new Date();
        const currentHour = now.getHours();
        const today = dailyForecast[0];
        const tomorrow = dailyForecast[1];
        
        // 生成24小时的预报数据
        for (let i = 0; i < CONFIG.HOURLY_FORECAST_COUNT; i++) {
            const forecastHour = (currentHour + i) % 24;
            const dayOffset = Math.floor((currentHour + i) / 24);
            const forecastDate = new Date(now);
            forecastDate.setHours(forecastHour, 0, 0, 0);
            forecastDate.setDate(forecastDate.getDate() + dayOffset);
            
            const forecast = dayOffset === 0 ? today : tomorrow;
            const isNight = forecastHour < 6 || forecastHour >= 18;
            
            // 在白天和夜间之间平滑过渡温度
            let temp;
            if (i === 0) {
                temp = current.temp;
            } else if (isNight) {
                temp = parseFloat(forecast.temp.min);
            } else {
                temp = parseFloat(forecast.temp.max);
            }
            
            // 在实时温度和预报温度之间平滑过渡
            if (i < 6) {
                const weight = i / 6;
                const targetTemp = isNight ? forecast.temp.min : forecast.temp.max;
                temp = current.temp * (1 - weight) + parseFloat(targetTemp) * weight;
            }
            
            // 根据时间决定天气图标
            const weather = isNight ? forecast.weather[0].main : forecast.weather[0].main;
            
            hourly.push({
                dt: Math.floor(forecastDate.getTime() / 1000),
                temp: Math.round(temp * 10) / 10,
                weather: [{
                    id: 0,
                    main: weather,
                    description: weather,
                    icon: CONFIG.getWeatherIconCode(weather, !isNight)
                }]
            });
        }
        
        return hourly;
    },
    
    /**
     * 搜索城市建议
     * @param {string} query - 搜索关键词
     * @returns {Promise<Array>} 包含城市建议的Promise
     */
    async searchCitySuggestions(query) {
        const cities = await this.searchCity(query);
        return cities.map(city => {
            // 确定最合适的城市名称显示
            let name = '';
            // 完整的行政区划信息（用于显示）
            let displayInfo = {
                province: '',  // 省级
                city: '',      // 市级
                district: '',  // 区/县级
                fullName: ''   // 完整名称（用于显示）
            };
            
            // 直辖市和特别行政区特殊处理
            const directCities = ['北京市', '上海市', '天津市', '重庆市', '香港特别行政区', '澳门特别行政区'];
            
            // 设置省级信息
            if (city.province) {
                displayInfo.province = city.province;
            }
            
            // 设置市级信息
            if (city.city) {
                displayInfo.city = city.city;
            }
            
            // 设置区/县级信息
            if (city.district) {
                displayInfo.district = city.district;
            }
            
            // 确定主要显示名称
            if (city.district && city.district !== city.city) {
                // 县/区级行政区
                name = city.district;
                // 构建完整显示名称（县+市+省）
                if (city.city && !directCities.includes(city.city)) {
                    displayInfo.fullName = `${city.district}`;
                }
            } else if (city.city) {
                // 市级行政区
                name = city.city;
                // 对于直辖市，去掉"市"字
                if (directCities.includes(city.city)) {
                    name = city.city.replace(/市$|特别行政区$/, '');
                }
            } else if (city.district) {
                // 备用：如果没有市但有区/县
                name = city.district;
            } else if (city.address && typeof city.address === 'string') {
                // 实在没有，尝试从地址中提取
                const addressParts = city.address.split(',');
                if (addressParts.length > 1 && addressParts[0].includes('省')) {
                    name = addressParts[1];
                } else {
                    name = addressParts[0];
                }
            } else {
                name = '未知地区';
            }
            
            // 确保所有字段都有合法值
            const location = city.location && typeof city.location === 'string' ? city.location.split(',') : ['0', '0'];
            
            // 构建结果对象
            return {
                name: name,                      // 主要显示名称
                adcode: city.adcode || '',
                citycode: city.citycode || '',
                lat: parseFloat(location[1] || 0),
                lon: parseFloat(location[0] || 0),
                level: city.level || '',
                province: displayInfo.province,  // 省级信息
                city: displayInfo.city,          // 市级信息
                district: displayInfo.district,  // 区/县级信息
                fullName: displayInfo.fullName   // 完整显示名称
            };
        });
    },
    
    /**
     * 根据城市名称或行政区划代码获取完整天气数据
     * @param {string} cityNameOrAdcode - 城市名称或行政区划代码
     * @returns {Promise<Object>} 包含天气数据的Promise
     */
    async getFullWeatherData(cityNameOrAdcode) {
        try {
            let adcode = cityNameOrAdcode;
            let cityName = cityNameOrAdcode;
            
            // 常见城市名称直接映射到adcode
            const commonCities = {
                '北京': '110000',
                '上海': '310000',
                '广州': '440100',
                '深圳': '440300',
                '杭州': '330100',
                '南京': '320100',
                '成都': '510100',
                '重庆': '500000',
                '武汉': '420100',
                '西安': '610100',
                '天津': '120000',
                '苏州': '320500',
                '长沙': '430100',
                '沈阳': '210100',
                '青岛': '370200',
                '郑州': '410100',
                '大连': '210200',
                '宁波': '330200',
                '厦门': '350200',
                '福州': '350100',
                '济南': '370100',
                '哈尔滨': '230100',
                '长春': '220100',
            };
            
            // 检查是否是常见城市名称
            if (cityNameOrAdcode && typeof cityNameOrAdcode === 'string') {
                // 去掉可能包含的"市"字
                const cleanName = cityNameOrAdcode.replace(/市$/, '');
                if (commonCities[cleanName]) {
                    adcode = commonCities[cleanName];
                    cityName = cleanName;
                }
                // 如果不是直接匹配的常见城市，尝试模糊匹配
                else if (isNaN(cityNameOrAdcode)) {
                    const cities = await this.searchCity(cityNameOrAdcode);
                    if (!cities || cities.length === 0) {
                        throw new Error(`找不到城市: ${cityNameOrAdcode}`);
                    }
                    adcode = cities[0].adcode;
                    
                    // 优先使用district名称，如果没有则使用city名称
                    if (cities[0].district && cities[0].district !== cities[0].city) {
                        cityName = cities[0].district;
                    } else if (cities[0].city) {
                        cityName = cities[0].city;
                    } else {
                        cityName = cities[0].address ? cities[0].address.split(',')[0] : cityNameOrAdcode;
                    }
                } 
                // 如果是纯数字（可能是adcode），尝试通过API获取真实城市名称
                else if (/^\d+$/.test(cityNameOrAdcode)) {
                    try {
                        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.REGEOCODING_ENDPOINT}?key=${CONFIG.API_KEY}&extensions=base&output=json&address=${cityNameOrAdcode}`);
                        const data = await response.json();
                        if (data.status === '1' && data.regeocode && data.regeocode.formatted_address) {
                            cityName = data.regeocode.formatted_address.split('省').pop().split('市')[0];
                            if (!cityName || cityName === adcode) {
                                cityName = data.regeocode.formatted_address;
                            }
                        }
                    } catch (error) {
                        console.warn('获取城市名称失败，将使用adcode:', error);
                    }
                }
            }
            
            // 并行获取实时天气和预报数据
            const [liveData, forecastData] = await Promise.all([
                this.getLiveWeather(adcode),
                this.getWeather(adcode)
            ]);
            
            // 从实时天气数据中获取城市名称
            if (liveData && liveData.city && typeof liveData.city === 'string') {
                // 直辖市特殊处理，移除"市"字
                if (['北京市', '上海市', '天津市', '重庆市'].includes(liveData.city)) {
                    cityName = liveData.city.replace('市', '');
                } else {
                    cityName = liveData.city;
                }
            }
            
            // 格式化数据
            return this.formatWeatherData(liveData, forecastData, cityName, adcode);
        } catch (error) {
            console.error('获取完整天气数据失败:', error);
            throw error;
        }
    },
    
    /**
     * 使用当前位置获取天气数据
     * @returns {Promise<Object>} 包含天气数据的Promise
     */
    async getWeatherByCurrentLocation() {
        try {
            // 尝试使用地理位置API获取位置
            try {
                const { lat, lon } = await Utils.getCurrentPosition();
                const cityInfo = await this.getCityByLocation(lat, lon);
                return await this.getFullWeatherData(cityInfo.adcode);
            } catch (geoError) {
                console.warn('获取地理位置失败，使用IP定位:', geoError);
                
                // 如果地理位置API失败，回退到IP定位
                const ipLocation = await this.getLocationByIP();
                return await this.getFullWeatherData(ipLocation.adcode);
            }
        } catch (error) {
            console.error('获取当前位置天气失败:', error);
            throw error;
        }
    }
}; 