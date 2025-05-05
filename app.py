from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/data.json")
def data():
    return send_from_directory("static", "data.json")

@app.route("/style.css")
def css():
    return send_from_directory("static", "style.css")

@app.route("/script.js")
def js():
    return send_from_directory("static", "script.js")

if __name__ == "__main__":
    app.run(debug=True)
