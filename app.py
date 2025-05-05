from flask import Flask, request, render_template, jsonify
import csv
import os
from gemini_helper import query_gemini
from roi_calculator import calculate_roi

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.form.to_dict()
    data['Annual_Salary_Before_MBA'] = float(data['Annual_Salary_Before_MBA'])
    data['Expected_PostMBA_Salary'] = float(data['Expected_PostMBA_Salary'])

    gemini_result = query_gemini(data)
    roi = calculate_roi(gemini_result.get('predicted_salary', 0), data['Annual_Salary_Before_MBA'], 120000, 5)

    entry = {
        **data,
        **gemini_result,
        'ROI': roi,
        'MBA_Cost': 120000
    }

    os.makedirs("data", exist_ok=True)
    with open('data/MBA_dataset.csv', 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=entry.keys())
        if f.tell() == 0:
            writer.writeheader()
        writer.writerow(entry)

    return jsonify({
        **gemini_result,
        'roi': roi
    })

if __name__ == '__main__':
    app.run(debug=True)