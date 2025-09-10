from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/charts')
def get_charts():
    return jsonify({
        'sensorActivations': [12, 7, 15],
        'sensorLabels': ["Sensor 1", "Sensor 2", "Sensor 3"],
        'dwellTimes': [2.5, 3.1, 1.8],
        'performanceData': [80, 65, 90],
        'weekDays': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        'lowEvents': [[2,1,3,2,1,2,1], [1,2,1,2,2,1,2], [3,2,2,3,2,3,2]],
        'mediumEvents': [[5,4,6,5,4,5,4], [4,5,4,5,5,4,5], [6,5,5,6,5,6,5]],
        'highEvents': [[1,1,2,1,1,1,1], [2,2,1,2,2,2,2], [1,2,1,2,1,2,1]]
    })

@app.route('/api/logs')
def get_logs():
    return jsonify([
        {'area': 'Sensor 1', 'date': '2025-09-10', 'event': 'High activity detected'},
        {'area': 'Sensor 2', 'date': '2025-09-10', 'event': 'Medium activity detected'},
        {'area': 'Sensor 3', 'date': '2025-09-10', 'event': 'Low activity detected'}
    ])

if __name__ == '__main__':
    app.run(debug=True)