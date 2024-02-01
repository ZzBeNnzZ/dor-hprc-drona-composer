from flask import Flask, render_template, redirect
from flask_cors import CORS
from views.job_composer import job_composer
import yaml
import os
import sqlite3
import re

app = Flask(__name__)

# DEVELOPMENT
CORS(app)
# env = os.environ["RACK_ENV"]
env = 'production'

def load_config(config_file='config.yml'):
    with open(config_file, 'r') as file:
        config_data = yaml.safe_load(file)
    return config_data


config = load_config()['development'] if env == 'development' else load_config()['production']
app.config.update(config)
app.config['user'] = os.environ['USER']


app.register_blueprint(job_composer, url_prefix="/jobs/composer")

@app.route("/")
def index():
    environments = get_directories("./environments")
    return render_template("index.html", environments=environments)

def get_directories(path):
    return [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]


@app.route("/config")
def config():
    return app.config["cluster_name"]
        

if __name__ == "__main__":
	app.run(debug=True)
