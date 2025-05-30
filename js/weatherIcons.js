/**
 * 天气SVG图标集
 * 每个图标都是一个返回SVG字符串的函数
 */
const WEATHER_ICONS = {
    // 晴天
    CLEAR_DAY: (color = '#FFB800') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="20" fill="${color}" />
            <g stroke="${color}" stroke-width="3" stroke-linecap="round">
                <line x1="50" y1="20" x2="50" y2="10" />
                <line x1="50" y1="90" x2="50" y2="80" />
                <line x1="20" y1="50" x2="10" y2="50" />
                <line x1="90" y1="50" x2="80" y2="50" />
                <line x1="30" y1="30" x2="22" y2="22" />
                <line x1="78" y1="78" x2="70" y2="70" />
                <line x1="30" y1="70" x2="22" y2="78" />
                <line x1="78" y1="22" x2="70" y2="30" />
            </g>
        </svg>
    `,
    
    // 夜晚
    CLEAR_NIGHT: (color = '#E0E0E0') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,20 A30,30 0 1,0 70,80 A30,30 0 0,1 40,20 Z" fill="${color}" />
            <circle cx="70" cy="25" r="2" fill="#fff" />
            <circle cx="75" cy="35" r="1" fill="#fff" />
            <circle cx="65" cy="45" r="1.5" fill="#fff" />
        </svg>
    `,
    
    // 多云白天
    PARTLY_CLOUDY_DAY: (sunColor = '#FFB800', cloudColor = '#E0E0E0') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="35" r="12" fill="${sunColor}" />
            <g stroke="${sunColor}" stroke-width="2" stroke-linecap="round">
                <line x1="35" y1="18" x2="35" y2="13" />
                <line x1="35" y1="57" x2="35" y2="52" />
                <line x1="18" y1="35" x2="13" y2="35" />
                <line x1="52" y1="35" x2="47" y2="35" />
                <line x1="23" y1="23" x2="19" y2="19" />
                <line x1="51" y1="51" x2="47" y2="47" />
                <line x1="23" y1="47" x2="19" y2="51" />
                <line x1="51" y1="19" x2="47" y2="23" />
            </g>
            <path d="M28,65 Q28,55 38,55 Q43,45 53,45 Q68,45 68,60 Q78,60 78,70 Q78,80 68,80 L28,80 Q18,80 18,70 Q18,60 28,65 Z" fill="${cloudColor}" />
        </svg>
    `,
    
    // 多云夜晚
    PARTLY_CLOUDY_NIGHT: (moonColor = '#E0E0E0', cloudColor = '#CACACA') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,20 A20,20 0 1,0 50,50 A20,20 0 0,1 30,20 Z" fill="${moonColor}" />
            <path d="M28,65 Q28,55 38,55 Q43,45 53,45 Q68,45 68,60 Q78,60 78,70 Q78,80 68,80 L28,80 Q18,80 18,70 Q18,60 28,65 Z" fill="${cloudColor}" />
        </svg>
    `,
    
    // 阴天
    CLOUDY: (color = '#CACACA') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,60 Q25,50 35,50 Q40,40 50,40 Q65,40 65,55 Q75,55 75,65 Q75,75 65,75 L25,75 Q15,75 15,65 Q15,55 25,60 Z" fill="${color}" />
        </svg>
    `,
    
    // 雨
    RAIN: (cloudColor = '#CACACA', rainColor = '#29B6F6') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,50 Q25,40 35,40 Q40,30 50,30 Q65,30 65,45 Q75,45 75,55 Q75,65 65,65 L25,65 Q15,65 15,55 Q15,45 25,50 Z" fill="${cloudColor}" />
            <line x1="30" y1="70" x2="26" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="40" y1="70" x2="36" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="50" y1="70" x2="46" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="60" y1="70" x2="56" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="70" y1="70" x2="66" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
        </svg>
    `,
    
    // 白天雨
    RAIN_DAY: (sunColor = '#FFB800', cloudColor = '#CACACA', rainColor = '#29B6F6') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="10" fill="${sunColor}" />
            <g stroke="${sunColor}" stroke-width="2" stroke-linecap="round">
                <line x1="30" y1="15" x2="30" y2="10" />
                <line x1="15" y1="30" x2="10" y2="30" />
                <line x1="20" y1="20" x2="16" y2="16" />
            </g>
            <path d="M25,50 Q25,40 35,40 Q40,30 50,30 Q65,30 65,45 Q75,45 75,55 Q75,65 65,65 L25,65 Q15,65 15,55 Q15,45 25,50 Z" fill="${cloudColor}" />
            <line x1="30" y1="70" x2="26" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="40" y1="70" x2="36" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="50" y1="70" x2="46" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="60" y1="70" x2="56" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="70" y1="70" x2="66" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
        </svg>
    `,
    
    // 夜晚雨
    RAIN_NIGHT: (moonColor = '#E0E0E0', cloudColor = '#CACACA', rainColor = '#29B6F6') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,20 A15,15 0 1,0 40,40 A15,15 0 0,1 25,20 Z" fill="${moonColor}" />
            <path d="M25,50 Q25,40 35,40 Q40,30 50,30 Q65,30 65,45 Q75,45 75,55 Q75,65 65,65 L25,65 Q15,65 15,55 Q15,45 25,50 Z" fill="${cloudColor}" />
            <line x1="30" y1="70" x2="26" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="40" y1="70" x2="36" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="50" y1="70" x2="46" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="60" y1="70" x2="56" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
            <line x1="70" y1="70" x2="66" y2="85" stroke="${rainColor}" stroke-width="3" stroke-linecap="round" />
        </svg>
    `,
    
    // 雷暴
    THUNDERSTORM: (cloudColor = '#777777', lightningColor = '#FFEB3B') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,50 Q25,40 35,40 Q40,30 50,30 Q65,30 65,45 Q75,45 75,55 Q75,65 65,65 L25,65 Q15,65 15,55 Q15,45 25,50 Z" fill="${cloudColor}" />
            <path d="M45,65 L55,65 L50,75 L60,75 L40,90 L45,78 L35,78 Z" fill="${lightningColor}" />
            <line x1="30" y1="70" x2="26" y2="80" stroke="#29B6F6" stroke-width="2" stroke-linecap="round" />
            <line x1="70" y1="70" x2="66" y2="80" stroke="#29B6F6" stroke-width="2" stroke-linecap="round" />
        </svg>
    `,
    
    // 雪
    SNOW: (cloudColor = '#CACACA', snowColor = '#E0E0E0') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,50 Q25,40 35,40 Q40,30 50,30 Q65,30 65,45 Q75,45 75,55 Q75,65 65,65 L25,65 Q15,65 15,55 Q15,45 25,50 Z" fill="${cloudColor}" />
            <circle cx="30" cy="75" r="3" fill="${snowColor}" />
            <circle cx="40" cy="80" r="3" fill="${snowColor}" />
            <circle cx="50" cy="75" r="3" fill="${snowColor}" />
            <circle cx="60" cy="80" r="3" fill="${snowColor}" />
            <circle cx="70" cy="75" r="3" fill="${snowColor}" />
            <circle cx="35" cy="85" r="3" fill="${snowColor}" />
            <circle cx="45" cy="90" r="3" fill="${snowColor}" />
            <circle cx="55" cy="85" r="3" fill="${snowColor}" />
            <circle cx="65" cy="90" r="3" fill="${snowColor}" />
        </svg>
    `,
    
    // 雾
    FOG: (color = '#CACACA') => `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,40 Q25,30 35,30 Q40,20 50,20 Q65,20 65,35 Q75,35 75,45 Q75,55 65,55 L25,55 Q15,55 15,45 Q15,35 25,40 Z" fill="${color}" />
            <line x1="20" y1="65" x2="80" y2="65" stroke="${color}" stroke-width="3" stroke-linecap="round" />
            <line x1="25" y1="75" x2="75" y2="75" stroke="${color}" stroke-width="3" stroke-linecap="round" />
            <line x1="30" y1="85" x2="70" y2="85" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        </svg>
    `
};

/**
 * 根据天气代码获取相应的SVG图标
 * @param {string} iconCode - OpenWeatherMap图标代码
 * @returns {string} SVG图标字符串
 */
function getWeatherIcon(iconCode) {
    const iconName = CONFIG.WEATHER_ICON_MAP[iconCode] || 'CLOUDY';
    return WEATHER_ICONS[iconName]();
} 