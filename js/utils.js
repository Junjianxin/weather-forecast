/**
 * 工具函数集合
 */
const Utils = {
    /**
     * 格式化日期为指定格式
     * @param {Date|number} date - 日期对象或时间戳
     * @param {string} format - 格式化模板
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const hour = d.getHours();
        const minute = d.getMinutes();
        const second = d.getSeconds();
        
        const pad = (num) => (num < 10 ? '0' + num : num);
        
        return format
            .replace('YYYY', year)
            .replace('MM', pad(month))
            .replace('DD', pad(day))
            .replace('HH', pad(hour))
            .replace('mm', pad(minute))
            .replace('ss', pad(second));
    },
    
    /**
     * 获取星期几
     * @param {Date|number} date - 日期对象或时间戳
     * @param {boolean} short - 是否返回短格式
     * @returns {string} 星期几字符串
     */
    getDayOfWeek(date, short = false) {
        const d = new Date(date);
        const days = short ? 
            ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] : 
            ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return days[d.getDay()];
    },
    
    /**
     * 格式化温度数值
     * @param {number} temp - 温度值
     * @param {string} unit - 单位 (C 或 F)
     * @returns {string} 格式化后的温度字符串
     */
    formatTemperature(temp, unit = 'C') {
        if (isNaN(temp)) return '--';
        
        const tempNum = Math.round(temp);
        return `${tempNum}°${unit}`;
    },
    
    /**
     * 摄氏度转华氏度
     * @param {number} celsius - 摄氏度温度
     * @returns {number} 华氏度温度
     */
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    },
    
    /**
     * 华氏度转摄氏度
     * @param {number} fahrenheit - 华氏度温度
     * @returns {number} 摄氏度温度
     */
    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    },
    
    /**
     * 格式化时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化后的时间字符串 (HH:mm)
     */
    formatTime(timestamp) {
        return this.formatDate(timestamp, 'HH:mm');
    },
    
    /**
     * 获取当前位置
     * @returns {Promise<{lat: number, lon: number}>} 包含经纬度的Promise
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('您的浏览器不支持地理位置功能'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = '获取位置信息失败';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = '用户拒绝了位置请求';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = '位置信息不可用';
                            break;
                        case error.TIMEOUT:
                            errorMessage = '获取位置请求超时';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                { timeout: 10000 }
            );
        });
    },
    
    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    },
    
    /**
     * 本地存储操作
     */
    storage: {
        /**
         * 保存数据到本地存储
         * @param {string} key - 存储键
         * @param {any} value - 要存储的值
         */
        set(key, value) {
            try {
                const serializedValue = JSON.stringify(value);
                localStorage.setItem(key, serializedValue);
            } catch (e) {
                console.error('保存到本地存储失败:', e);
            }
        },
        
        /**
         * 从本地存储获取数据
         * @param {string} key - 存储键
         * @param {any} defaultValue - 默认值
         * @returns {any} 存储的值或默认值
         */
        get(key, defaultValue = null) {
            try {
                const serializedValue = localStorage.getItem(key);
                if (serializedValue === null) {
                    return defaultValue;
                }
                return JSON.parse(serializedValue);
            } catch (e) {
                console.error('从本地存储获取失败:', e);
                return defaultValue;
            }
        },
        
        /**
         * 从本地存储删除数据
         * @param {string} key - 存储键
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('从本地存储删除失败:', e);
            }
        }
    },
    
    /**
     * 获取风向描述
     * @param {number} deg - 风向角度
     * @returns {string} 风向描述
     */
    getWindDirection(deg) {
        if (deg === undefined || deg === null) return '';
        
        const directions = [
            '北风', '东北风', '东风', '东南风', 
            '南风', '西南风', '西风', '西北风'
        ];
        
        // 将360度平均分为8个方向
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    },
    
    /**
     * 根据当前时间判断是白天还是夜晚
     * @param {number} sunrise - 日出时间戳
     * @param {number} sunset - 日落时间戳
     * @returns {boolean} 是否为白天
     */
    isDayTime(sunrise, sunset) {
        const now = Date.now() / 1000; // 转换为秒
        return now >= sunrise && now < sunset;
    },
    
    /**
     * 对搜索关键词进行简单净化
     * @param {string} keyword - 搜索关键词
     * @returns {string} 净化后的关键词
     */
    sanitizeSearchKeyword(keyword) {
        if (!keyword) return '';
        
        // 移除特殊字符并限制长度
        return keyword
            .trim()
            .replace(/[^\p{L}\p{N}\s]/gu, '')
            .substring(0, 50);
    },
    
    /**
     * 根据天气类型获取背景主题类名
     * @param {string} weatherType - 天气类型
     * @param {boolean} isDay - 是否为白天
     * @returns {string} 主题类名
     */
    getThemeClassByWeather(weatherType, isDay) {
        if (!weatherType) return '';
        
        const type = weatherType.toLowerCase();
        
        if (type.includes('clear') || type.includes('sun')) {
            return isDay ? 'theme-sunny' : 'theme-night';
        }
        
        if (type.includes('rain') || type.includes('drizzle') || 
            type.includes('thunderstorm') || type.includes('snow')) {
            return 'theme-rainy';
        }
        
        if (!isDay) {
            return 'theme-night';
        }
        
        return '';
    }
}; 