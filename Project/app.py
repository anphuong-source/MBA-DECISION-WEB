from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_chart_data/<chart_type>')
def get_chart_data(chart_type):
    df = pd.read_csv('MBA.csv')
    bins = [1.0, 2.5, 5.0, 7.5, 10.0]
    labels = ['1 - 2.5', '2.5 - 5.0', '5.0 - 7.5', '7.5 - 10.0']

    networking = pd.cut(df['Networking_Importance'], bins=bins, labels=labels, include_lowest=True)
    entrepreneurial = pd.cut(df['Entrepreneurial_Interest'], bins=bins, labels=labels, include_lowest=True)

    if chart_type == 'networking':
        data = networking.value_counts(normalize=True).sort_index() * 100
        colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']
        title = 'Networking Importance'
    elif chart_type == 'entrepreneurial':
        data = entrepreneurial.value_counts(normalize=True).sort_index() * 100
        colors = ['#a6d854', '#ffd92f', '#e5c494', '#b3b3b3']
        title = 'Entrepreneurial Interest'
    else:
        return jsonify({'error': 'Invalid chart type'}), 400

    return jsonify({
        'labels': list(data.index),
        'values': list(data.values),
        'colors': colors,
        'title': title
    })

if __name__ == '__main__':
    print("Flask server running at http://127.0.0.1:5000")
    app.run(debug=True)