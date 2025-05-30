/**
 * 天气图表模块
 * 使用Canvas绘制温度变化曲线图
 */
const WeatherChart = {
    /**
     * 绘制小时温度折线图
     * @param {HTMLCanvasElement} canvas - Canvas元素
     * @param {Array} data - 图表数据，每项包含time和temp属性
     * @param {string} unit - 温度单位
     */
    drawHourlyChart(canvas, data, unit = 'C') {
        if (!canvas || !data || data.length === 0) return;
        
        // 获取Canvas上下文
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 设置Canvas尺寸
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        // 清除Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 定义图表区域
        const padding = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 40
        };
        
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        // 计算温度范围
        const temps = data.map(item => item.temp);
        let minTemp = Math.min(...temps);
        let maxTemp = Math.max(...temps);
        
        // 扩展温度范围以使图表更美观
        const tempPadding = Math.max(2, Math.ceil((maxTemp - minTemp) / 10));
        minTemp = Math.floor(minTemp - tempPadding);
        maxTemp = Math.ceil(maxTemp + tempPadding);
        
        // 计算温度到Y坐标的转换函数
        const tempToY = (temp) => {
            return padding.top + chartHeight - ((temp - minTemp) / (maxTemp - minTemp)) * chartHeight;
        };
        
        // 绘制坐标轴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        // 绘制Y轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.stroke();
        
        // 绘制X轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();
        
        // 绘制温度刻度
        const tempStep = Math.max(1, Math.ceil((maxTemp - minTemp) / 5));
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let temp = Math.ceil(minTemp / tempStep) * tempStep; temp <= maxTemp; temp += tempStep) {
            const y = tempToY(temp);
            
            ctx.beginPath();
            ctx.moveTo(padding.left - 5, y);
            ctx.lineTo(padding.left, y);
            ctx.stroke();
            
            ctx.fillText(`${temp}°${unit}`, padding.left - 10, y);
            
            // 绘制网格线
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 绘制时间刻度
        const timeStep = Math.max(1, Math.floor(data.length / 6));
        const timeToX = (index) => {
            return padding.left + (index / (data.length - 1)) * chartWidth;
        };
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        for (let i = 0; i < data.length; i += timeStep) {
            const x = timeToX(i);
            
            ctx.beginPath();
            ctx.moveTo(x, padding.top + chartHeight);
            ctx.lineTo(x, padding.top + chartHeight + 5);
            ctx.stroke();
            
            ctx.fillText(data[i].time, x, padding.top + chartHeight + 10);
        }
        
        // 绘制温度曲线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(timeToX(0), tempToY(data[0].temp));
        
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(timeToX(i), tempToY(data[i].temp));
        }
        
        ctx.stroke();
        
        // 绘制温度点
        ctx.fillStyle = 'white';
        
        for (let i = 0; i < data.length; i++) {
            const x = timeToX(i);
            const y = tempToY(data[i].temp);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制面积填充
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(timeToX(0), tempToY(data[0].temp));
        
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(timeToX(i), tempToY(data[i].temp));
        }
        
        ctx.lineTo(timeToX(data.length - 1), padding.top + chartHeight);
        ctx.lineTo(timeToX(0), padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();
    }
}; 