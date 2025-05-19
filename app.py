from flask import Flask, render_template, jsonify
from flask_cors import CORS
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the dataset
dataset = pd.read_csv("D:/Na/VGU/Study/Phase 4/Business IT 2/Python/Python 2/Majors/MBA dataset.csv")

# Clean data: Remove rows with missing or invalid values
dataset = dataset.dropna(subset=['Undergraduate_Major', 'Desired_Post_MBA_Role', 'Years_of_Work_Experience'])

# Group the data by 'Undergraduate_Major', 'Desired_Post_MBA_Role', and 'Years_of_Work_Experience'
filtered_data = dataset.groupby(['Undergraduate_Major', 'Desired_Post_MBA_Role', 'Years_of_Work_Experience']).size().reset_index(name='Count')

def create_plot(data):
    import plotly.graph_objects as go
    import pandas as pd

    years = sorted(data['Years_of_Work_Experience'].unique())
    roles = data['Desired_Post_MBA_Role'].unique()

    frames = []
    fig_data = []

    # Define a color mapping for each role using the provided color palette
    role_colors = {
        'Startup Founder': '#e0d4be',  # Light beige
        'Marketing Director': '#c66e21',  # Warm orange
        'Finance Manager': '#635f39',  # Olive green
        'Executive': '#d66d68',  # Muted pink
        'Consultant': '#8e5d2a',  # Brown
    }

    # Initial frame (first year)
    first_year = years[0]
    for role in roles:
        role_data = data[(data['Desired_Post_MBA_Role'] == role) & (data['Years_of_Work_Experience'] == first_year)]
        y_val = role_data['Count'].values[0] if not role_data.empty else 0
        fig_data.append(go.Scatter(
            x=[first_year],
            y=[y_val],
            stackgroup='one',
            name=role,
            mode='lines',
            line=dict(color=role_colors.get(role, '#000000')),
            hovertemplate=
                "Years of Work Experience: %{x}<br>" +
                "Number of People: %{y}<br>" +
                "Desired Role: %{fullData.name}<extra></extra>"
        ))

    # Generate frames for animation
    for year in years:
        frame_data = []
        for role in roles:
            y_vals = []
            for yr in years:
                if yr <= year:
                    val = data[(data['Desired_Post_MBA_Role'] == role) & (data['Years_of_Work_Experience'] == yr)]['Count']
                    y_vals.append(val.values[0] if not val.empty else 0)
                else:
                    y_vals.append(None)
            frame_data.append(go.Scatter(
                x=years,
                y=y_vals,
                stackgroup='one',
                name=role,
                mode='lines',
                line=dict(color=role_colors.get(role, '#000000')),
                hovertemplate=
                    "Years of Work Experience: %{x}<br>" +
                    "Number of People: %{y}<br>" +
                    "Desired Role: %{fullData.name}<extra></extra>"
            ))
        frames.append(go.Frame(data=frame_data, name=str(year)))

    fig = go.Figure(
        data=fig_data,
        frames=frames,
        layout=go.Layout(
            updatemenus=[{
                "buttons": [
                    {"args": [None, {"frame": {"duration": 500}, "fromcurrent": True}],
                     "label": "Play", "method": "animate"},
                    {"args": [[None], {"frame": {"duration": 0}, "mode": "immediate", "transition": {"duration": 0}}],
                     "label": "Pause", "method": "animate"}
                ],
                "direction": "left",
                "pad": {"r": 10, "t": 87},
                "showactive": False,
                "type": "buttons",
                "x": 0.1,
                "xanchor": "right",
                "y": 0,
                "yanchor": "top"
            }],
            sliders=[{
                "steps": [
                    {"args": [[str(year)], {"frame": {"duration": 500, "redraw": True},
                                            "mode": "immediate",
                                            "transition": {"duration": 0}}],
                     "label": str(year), "method": "animate"} for year in years
                ],
                "transition": {"duration": 0},
                "x": 0.1,
                "y": -0.2,
                "currentvalue": {"font": {"size": 16}, "prefix": "Year: ", "visible": True},
                "len": 0.9
            }],
            title=dict(
        text=f"Desired Post-MBA Roles for {data['Undergraduate_Major'].iloc[0]}",
        font=dict(family="Montserrat, sans-serif", weight="bold", size=20, color="#aa3b19"),
        x=0.5,  # Center the title
        xanchor="center"  # Ensure it stays centered
        ),
            plot_bgcolor='#f4ebdb',
            paper_bgcolor='#f4ebdb',
            xaxis=dict(title="Years of Work Experience", title_font=dict(family="Montserrat, sans-serif", size=14, weight="bold", color="black")),
            yaxis=dict(title="Number of People", title_font=dict(family="Montserrat, sans-serif", size=14, weight="bold", color="black")),
            font=dict(family="Montserrat, sans-serif", size=10, color="black"),
            hoverlabel=dict(font_size=12, font_family="Montserrat, sans-serif"),
            legend=dict(font=dict(family="Montserrat, sans-serif", size=12, color="black"))
        )
    )

    config = {
        'displayModeBar': False, # This will hide all modebar buttons
        # 'modeBarButtonsToRemove': ['zoom2d', 'pan2d', 'select2d', 'lasso2d'], # Example of removing specific buttons
        # 'displaylogo': False # Also hides the Plotly logo
    }

    return fig.to_html(full_html=False, config=config) # Pass the config here

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
        app.logger.error(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({"error": str(e)}), 500

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Respond with a no-content status to suppress the 404

if __name__ == '__main__':
    app.run(debug=True)



