/**
 * 主应用入口
 * 负责初始化和启动天气应用
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化UI模块
    UI.init();
    
    // 设置窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
        if (UI.state.weatherData) {
            const hourlyData = UI.state.weatherData.weather.hourly;
            const hourlyCount = Math.min(hourlyData.length, CONFIG.HOURLY_FORECAST_COUNT);
            
            const hourlyChartData = hourlyData.slice(0, hourlyCount).map(hour => {
                return {
                    time: Utils.formatTime(hour.dt * 1000),
                    temp: UI.state.unit === 'C' ? hour.temp : Utils.celsiusToFahrenheit(hour.temp)
                };
            });
            
            WeatherChart.drawHourlyChart(UI.elements.hourlyChart, hourlyChartData, UI.state.unit);
        }
    });
    
    // 设置下拉刷新
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        
        // 检测是否为下拉刷新手势（向下拖动超过50px）
        if (touchEndY - touchStartY > 50 && window.scrollY === 0) {
            // 刷新当前城市天气
            if (UI.state.cityName && !UI.state.isLoading) {
                UI.loadWeatherData(UI.state.cityName);
            }
        }
    }, { passive: true });
    
    // 设置定时刷新
    setInterval(() => {
        if (UI.state.cityName && !UI.state.isLoading && document.visibilityState === 'visible') {
            UI.loadWeatherData(UI.state.cityName);
        }
    }, CONFIG.AUTO_REFRESH_INTERVAL);
}); 