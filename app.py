from flask import Flask, render_template, jsonify
from flask_cors import CORS
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the dataset
dataset = pd.read_csv("D:/Na/VGU/Study/Phase 4/Business IT 2/Python/Python 2/MBA dataset.csv")

# Clean data: Remove rows with missing or invalid values
dataset = dataset.dropna(subset=['Undergraduate_Major', 'Desired_Post_MBA_Role', 'Years_of_Work_Experience'])

# Group the data by 'Undergraduate_Major', 'Desired_Post_MBA_Role', and 'Years_of_Work_Experience'
filtered_data = dataset.groupby(['Undergraduate_Major', 'Desired_Post_MBA_Role', 'Years_of_Work_Experience']).size().reset_index(name='Count')

def create_plot(data):
    fig = go.Figure()
    roles = data['Desired_Post_MBA_Role'].unique()
    for role in roles:
        role_data = data[data['Desired_Post_MBA_Role'] == role]
        fig.add_trace(go.Scatter(
            x=role_data['Years_of_Work_Experience'],
            y=role_data['Count'],
            mode='lines+markers',
            name=role,
            hovertemplate="Years of Work Experience: %{x}<br>Number of People: %{y}",
        ))

    fig.update_layout(
        title=f"Desired Post-MBA Roles for {data['Undergraduate_Major'].iloc[0]}",
        xaxis_title="Years of Work Experience",
        yaxis_title="Number of People",
        hovermode="closest",
        plot_bgcolor="white",
        updatemenus=[dict(
        type='buttons',
        x=0.1,
        y=0,
        buttons=[dict(label='Play',
                      method='animate',
                      args=[None, dict(frame=dict(duration=500, redraw=True), fromcurrent=True)])]
    )]
    )

    # Return the HTML for the graph
    graph_html = fig.to_html(full_html=False)
    return graph_html

@app.route('/')
def home():
    return render_template('index.html')  # Ensure this file exists in the templates folder

@app.route('/get_chart/<major>', methods=['GET'])
def get_chart(major):
    try:
        major_data = filtered_data[filtered_data['Undergraduate_Major'] == major]
        print(f"Data for {major}:")
        print(major_data)
    
    # If data is empty, return an error
        if major_data.empty:
            return jsonify({"error": "No data found for the selected major"}), 404
            
        graph_html = create_plot(major_data)
        return jsonify({'graph_html': graph_html})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Respond with a no-content status to suppress the 404

if __name__ == '__main__':
    app.run(debug=True)



