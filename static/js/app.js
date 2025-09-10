// Global chart instances for resize
let charts = {};

// Fetch all chart data from API
async function fetchChartData() {
    try {
        const response = await fetch('/api/charts');
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        // Fallback to hardcoded data
        return {
            sensorActivations: [12, 7, 15],
            sensorLabels: ["Sensor 1", "Sensor 2", "Sensor 3"],
            dwellTimes: [2.5, 3.1, 1.8],
            radarData: [80, 65, 90],
            radarLabels: ["Sensor 1", "Sensor 2", "Sensor 3"],
            weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            lowEvents: [[2,1,3,2,1,2,1], [1,2,1,2,2,1,2], [3,2,2,3,2,3,2]],
            mediumEvents: [[5,4,6,5,4,5,4], [4,5,4,5,5,4,5], [6,5,5,6,5,6,5]],
            highEvents: [[1,1,2,1,1,1,1], [2,2,1,2,2,2,2], [1,2,1,2,1,2,1]]
        };
    }
}

// Fetch logs from API
async function fetchLogs() {
    try {
        const response = await fetch('/api/logs');
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        // Fallback
        return [
            { area: 'Sensor 1', date: '2025-09-10', event: 'High activity detected' },
            { area: 'Sensor 2', date: '2025-09-10', event: 'Medium activity detected' },
            { area: 'Sensor 3', date: '2025-09-10', event: 'Low activity detected' }
        ];
    }
}

function renderDwellBarChart(data) {
    const chartDom = document.getElementById('dwellBarChart');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    charts.dwell = myChart;
    const option = {
        xAxis: { type: 'category', data: data.sensorLabels },
        yAxis: { type: 'value', name: 'Avg. Dwell Time (min)', min: 0, max: 5 },
        series: [{ data: data.dwellTimes, type: 'bar', itemStyle: { color: '#8DD3C7' } }],
        tooltip: { trigger: 'axis', formatter: params => `${params[0].name}: ${params[0].value} min` }
    };
    myChart.setOption(option);
}

function renderDigitalPieChart(data) {
    const chartDom = document.getElementById('digitalPieChart');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    charts.digitalPie = myChart;
    const total = data.sensorActivations.reduce((a, b) => a + b, 0);
    const option = {
        series: [{
            name: 'Activity',
            type: 'pie',
            radius: '60%',
            data: data.sensorLabels.map((label, i) => ({ value: data.sensorActivations[i], name: label })),
            label: {
                formatter: params => {
                    const percent = total ? Math.round((params.value / total) * 100) : 0;
                    return `${params.name}: ${percent}%`;
                }
            }
        }],
        tooltip: { trigger: 'item', formatter: params => {
            const total = data.sensorActivations.reduce((a, b) => a + b, 0);
            const percent = total ? Math.round((params.value / total) * 100) : 0;
            return `${params.name}: ${params.value} (${percent}%)`;
        } }
    };
    myChart.setOption(option);
}

function renderRadarChart(data) {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    charts.radar = myChart;
    const option = {
        radar: {
            indicator: data.sensorLabels.map(label => ({ name: label, max: 100 })),
            axisName: { textStyle: { color: '#333' } }
        },
        series: [{
            name: 'Performance',
            type: 'radar',
            data: [{ value: data.radarData, name: 'Sensors', areaStyle: { opacity: 0.1 } }]
        }]
    };
    myChart.setOption(option);
}

function renderAnalyticsBarChart(data) {
    const chartDom = document.getElementById('analyticsBarChart');
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);
    charts.analytics = myChart;
    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Low', 'Medium', 'High'] },
        xAxis: { type: 'category', data: data.weekDays },
        yAxis: { type: 'value', name: 'Event Level', min: 0, max: 10 },
        series: [
            {
                name: 'Low',
                type: 'line',
                smooth: true,
                data: data.weekDays.map((_, i) => data.lowEvents[0][i] + data.lowEvents[1][i] + data.lowEvents[2][i]),
                lineStyle: { color: '#8DD3C7', width: 2 },
                itemStyle: { color: '#8DD3C7' }
            },
            {
                name: 'Medium',
                type: 'line',
                smooth: true,
                data: data.weekDays.map((_, i) => data.mediumEvents[0][i] + data.mediumEvents[1][i] + data.mediumEvents[2][i]),
                lineStyle: { color: '#2563eb', width: 2 },
                itemStyle: { color: '#2563eb' }
            },
            {
                name: 'High',
                type: 'line',
                smooth: true,
                data: data.weekDays.map((_, i) => data.highEvents[0][i] + data.highEvents[1][i] + data.highEvents[2][i]),
                lineStyle: { color: '#FFB347', width: 2 },
                itemStyle: { color: '#FFB347' }
            }
        ]
    };
    myChart.setOption(option);
}

function renderLogs(logs) {
    const logsTableBody = document.getElementById('logsTableBody');
    if (!logsTableBody) return;
    logsTableBody.innerHTML = logs.map(log => `<tr><td>${log.area}</td><td>${log.date}</td><td>${log.event}</td></tr>`).join('');
}

function updatePeak(data) {
    const total = data.sensorActivations.reduce((a, b) => a + b, 0);
    const percentages = data.sensorActivations.map(v => total ? (v / total) * 100 : 0);
    const maxIndex = percentages.indexOf(Math.max(...percentages));
    const peakElem = document.querySelector('.sidebar .grid .bg-gray-50:nth-child(2) span.text-lg');
    if (peakElem) {
        peakElem.textContent = `${data.sensorLabels[maxIndex]} (${Math.round(percentages[maxIndex])}%)`;
    }
}

// Range slider
function initRangeSlider() {
    const rangeSlider = document.getElementById('rangeSlider');
    const rangeValue = document.getElementById('rangeValue');
    if (rangeSlider && rangeValue) {
        rangeSlider.addEventListener('input', () => {
            rangeValue.textContent = rangeSlider.value;
        });
    }
}

// Frequency selector
function selectFrequency(button) {
    document.querySelectorAll('[onclick="selectFrequency(this)"]').forEach(btn => {
        btn.className = 'px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50';
    });
    button.className = 'px-3 py-2 text-sm border border-primary bg-primary/10 text-primary rounded-lg';
}

// Config save/reset
function initConfig() {
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', () => {
            // TODO: Send to /api/config
            alert('Configuration saved successfully!');
        });
    }
    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', () => {
            document.getElementById('rangeSlider').value = 5;
            document.getElementById('rangeValue').textContent = '5';
            document.querySelectorAll('[onclick="selectFrequency(this)"]').forEach((btn, index) => {
                if (index === 1) {
                    btn.className = 'px-3 py-2 text-sm border border-primary bg-primary/10 text-primary rounded-lg';
                } else {
                    btn.className = 'px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50';
                }
            });
            document.querySelector('input[type="number"][value="20"]').value = 20;
            document.querySelector('input[type="number"][value="50"]').value = 50;
        });
    }
}

// Logs modal
function initLogs(logs) {
    const logsBtn = document.getElementById('logsBtn');
    const logsModal = document.getElementById('logsModal');
    const closeModal = document.getElementById('closeModal');
    if (logsBtn && logsModal && closeModal) {
        logsBtn.onclick = () => {
            renderLogs(logs);
            logsModal.style.display = 'flex';
        };
        closeModal.onclick = () => { logsModal.style.display = 'none'; };
        logsModal.onclick = (e) => {
            if (e.target === logsModal) logsModal.style.display = 'none';
        };
    }

    // Search functionality (basic, filter client-side for now)
    const searchLogsBtn = document.getElementById('searchLogsBtn');
    const showAllLogsBtn = document.getElementById('showAllLogsBtn');
    const logDateSearch = document.getElementById('logDateSearch');
    if (searchLogsBtn && logDateSearch) {
        searchLogsBtn.onclick = () => {
            const date = logDateSearch.value;
            const filtered = logs.filter(log => log.date === date);
            renderLogs(filtered.length ? filtered : logs);
        };
    }
    if (showAllLogsBtn) {
        showAllLogsBtn.onclick = () => {
            renderLogs(logs);
        };
    }
}

// Resize handler
function initResize() {
    window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => chart?.resize());
    });
}

// Main init
document.addEventListener('DOMContentLoaded', async () => {
    const chartData = await fetchChartData();
    const logs = await fetchLogs();

    renderDwellBarChart(chartData);
    renderDigitalPieChart(chartData);
    renderRadarChart(chartData);
    renderAnalyticsBarChart(chartData);
    updatePeak(chartData);
    initLogs(logs);
    initRangeSlider();
    initConfig();
    initResize();

    // Select default frequency
    const freqButtons = document.querySelectorAll('[onclick="selectFrequency(this)"]');
    if (freqButtons[1]) selectFrequency(freqButtons[1]);
});