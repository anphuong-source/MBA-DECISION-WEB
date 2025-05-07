from flask import Flask, render_template
import pandas as pd

app = Flask(__name__)

# Load and process the MBA dataset
def process_data():
    data = pd.read_csv('MBA.csv')  

    # Group by Reason_for_MBA and Gender, and count occurrences
    grouped = data.groupby(['Reason_for_MBA', 'Gender']).size().unstack(fill_value=0)

    # Calculate percentages for each gender per reason
    reasons = ['Entrepreneurship', 'Career Growth', 'Skill Enhancement', 'Networking']
    gender_percentages = {}

    for reason in reasons:
        total = grouped.loc[reason].sum()
        if total == 0:
            continue
        percentages = {
            'Male': (grouped.loc[reason, 'Male'] / total * 100) if 'Male' in grouped.loc[reason].index else 0,
            'Female': (grouped.loc[reason, 'Female'] / total * 100) if 'Female' in grouped.loc[reason].index else 0,
            'Other': (grouped.loc[reason, 'Other'] / total * 100) if 'Other' in grouped.loc[reason].index else 0
        }
        gender_percentages[reason] = {
            'Male': round(percentages['Male'], 1),
            'Female': round(percentages['Female'], 1),
            'Other': round(percentages['Other'], 1)
        }

    return gender_percentages

@app.route('/')
def index():
    gender_percentages = process_data()
    return render_template('index.html', gender_percentages=gender_percentages)


if __name__ == '__main__':
    app.run(debug=True)