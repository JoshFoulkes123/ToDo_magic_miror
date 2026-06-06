import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS
from flask_socketio import SocketIO
import MySQLdb
from config import *
import datetime
import requests
import time
from subprocess import call

app = Flask(__name__)
app.config['MYSQL_HOST'] = MYSQL_HOST
app.config['MYSQL_USER'] = MYSQL_USER
app.config['MYSQL_PASSWORD'] = MYSQL_PASSWORD
app.config['MYSQL_DB'] = MYSQL_DB

mysql = MySQL(app)
with app.app_context():
    try:
        # Accessing .connection attempts the connect
        cur = mysql.connection

        print("Connected successfully!")
    except Exception as e:
        print("Connection failed: " + str(e))

CORS(app)
# socketio = SocketIO(app)
#socketio.emit('database_updated', {'status': 'refresh_now'}, broadcast=True)

weather_return = {"latitude":52.52,"longitude":13.419998,"generationtime_ms":7.1572065353393555,"utc_offset_seconds":0,"timezone":"GMT","timezone_abbreviation":"GMT","elevation":38.0,"daily_units":{"time":"iso8601","temperature_2m_max":"°C","temperature_2m_min":"°C","sunset":"iso8601","rain_sum":"mm","showers_sum":"mm","precipitation_sum":"mm","precipitation_probability_max":"%","weather_code":"wmo code"},"daily":{"time":["2026-03-07","2026-03-08","2026-03-09","2026-03-10","2026-03-11","2026-03-12","2026-03-13"],"temperature_2m_max":[17.4,16.8,17.0,17.3,18.6,13.9,17.6],"temperature_2m_min":[2.8,5.9,3.5,3.1,3.2,5.8,3.5],"sunset":["2026-03-07T16:55","2026-03-08T16:57","2026-03-09T16:59","2026-03-10T17:01","2026-03-11T17:02","2026-03-12T17:04","2026-03-13T17:06"],"rain_sum":[0.00,0.00,0.00,0.00,0.00,0.00,0.00],"showers_sum":[0.00,0.00,0.00,0.00,0.00,0.00,0.00],"precipitation_sum":[0.00,0.00,0.00,0.00,0.00,0.00,0.00],"precipitation_probability_max":[0,3,0,3,8,18,18],"weather_code":[65,77,2,3,45,3,1]}}

weather_codes = {
    0: {"description": "Sunny", "image": "http://openweathermap.org/img/wn/01d@2x.png"},
    1: {"description": "Mainly Sunny", "image": "http://openweathermap.org/img/wn/01d@2x.png"},
    2: {"description": "Partly Cloudy", "image": "http://openweathermap.org/img/wn/02d@2x.png"},
    3: {"description": "Cloudy", "image": "http://openweathermap.org/img/wn/03d@2x.png"},
    45: {"description": "Foggy", "image": "http://openweathermap.org/img/wn/50d@2x.png"},
    48: {"description": "Rime Fog", "image": "http://openweathermap.org/img/wn/50d@2x.png"},
    51: {"description": "Light Drizzle", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    53: {"description": "Drizzle", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    55: {"description": "Heavy Drizzle", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    56: {"description": "Light Freezing Drizzle", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    57: {"description": "Freezing Drizzle", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    61: {"description": "Light Rain", "image": "http://openweathermap.org/img/wn/10d@2x.png"},
    63: {"description": "Rain", "image": "http://openweathermap.org/img/wn/10d@2x.png"},
    65: {"description": "Heavy Rain", "image": "http://openweathermap.org/img/wn/10d@2x.png"},
    66: {"description": "Light Freezing Rain", "image": "http://openweathermap.org/img/wn/10d@2x.png"},
    67: {"description": "Freezing Rain", "image": "http://openweathermap.org/img/wn/10d@2x.png"},
    71: {"description": "Light Snow", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    73: {"description": "Snow", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    75: {"description": "Heavy Snow", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    77: {"description": "Snow Grains", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    80: {"description": "Light Showers", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    81: {"description": "Showers", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    82: {"description": "Heavy Showers", "image": "http://openweathermap.org/img/wn/09d@2x.png"},
    85: {"description": "Light Snow Showers", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    86: {"description": "Snow Showers", "image": "http://openweathermap.org/img/wn/13d@2x.png"},
    95: {"description": "Thunderstorm", "image": "http://openweathermap.org/img/wn/11d@2x.png"},
    96: {"description": "Light Thunderstorms With Hail", "image": "http://openweathermap.org/img/wn/11d@2x.png"},
    99: {"description": "Thunderstorm With Hail", "image": "http://openweathermap.org/img/wn/11d@2x.png"},
}

# tasks= [
#     (0,"clean toilet","clean toilet description",datetime.datetime(2026, 2, 13),3),
#     (1,"clean sheets","clean sheets description",datetime.datetime(2026, 2, 16),2),
#     (2,"take out recycling","take out recycling description",datetime.datetime(2026, 3, 1),1),
#     (3,"clean fridge","clean fridge and freezer description",datetime.datetime(2026, 2, 20),4),
#     (4,"Clean Oven","clean oven description",datetime.datetime(2026, 12, 12),8)
# ]
tasks = []

Api_url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_max,temperature_2m_min,sunset,rain_sum,showers_sum,precipitation_sum,precipitation_probability_max,weather_code"

weather_time_prev = time.time()

def updateWeather():
    print("updating weather")
    r = requests.get(Api_url)
    global weather_return
    weather_return = r.json()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/all_tasks')
def all_tasks():
    return render_template('all_tasks.html')

@app.route('/mirror_dashboard')
def mirror_dashboard():
    return render_template('mirror_dashboard.html')

@app.route('/task_add')
def task_add():
    return render_template('task_add.html')

@app.route('/task_edit')
def task_edit():
    return render_template('task_edit.html')

@app.route('/weather', methods=['GET'])
def getWeather():
    updateWeather()
    global weather_time_prev
    if (time.time() - weather_time_prev) > 3600:
        updateWeather()
        weather_time_prev = time.time()

    print("retrieving weather")

    days = weather_return["daily"]["time"]
    sat_idx = 0
    sun_idx = 0
    for idx, i in enumerate(days):
        weekday = datetime.datetime.fromisoformat(i).weekday()
        if weekday == 5:
            sat_idx = idx
        if weekday == 6:
            sun_idx = idx
    
    sat_data = {"date":datetime.datetime.fromisoformat(weather_return["daily"]["time"][sat_idx]) ,"temperature_2m_max":weather_return["daily"]["temperature_2m_max"][sat_idx],"temperature_2m_min":weather_return["daily"]["temperature_2m_min"][sat_idx],"sunset":datetime.datetime.fromisoformat(weather_return["daily"]["sunset"][sat_idx]),"precipitation_probability_max":weather_return["daily"]["precipitation_probability_max"][sat_idx],"weather_code":weather_codes[weather_return["daily"]["weather_code"][sat_idx]]["description"],"image":weather_codes[weather_return["daily"]["weather_code"][sat_idx]]["image"]}
    sun_data = {"date":datetime.datetime.fromisoformat(weather_return["daily"]["time"][sun_idx]) ,"temperature_2m_max":weather_return["daily"]["temperature_2m_max"][sun_idx],"temperature_2m_min":weather_return["daily"]["temperature_2m_min"][sun_idx],"sunset":datetime.datetime.fromisoformat(weather_return["daily"]["sunset"][sun_idx]),"precipitation_probability_max":weather_return["daily"]["precipitation_probability_max"][sun_idx],"weather_code":weather_codes[weather_return["daily"]["weather_code"][sun_idx]]["description"],"image":weather_codes[weather_return["daily"]["weather_code"][sun_idx]]["image"]}
    weather_data = [sat_data,sun_data]
    return jsonify(weather_data)


@app.route('/test')
def test():
    cur = mysql.connection.cursor()
    cur.execute("SELECT DATABASE();")
    
    data = cur.fetchone()

    # cur.execute("SELECT * FROM Task_table")
    # data= cur.fetchall()

    print(data)
    print("test function ran")
    return jsonify({"connected_to": "white rabbit"})

@app.route('/turn_off')
def turn_off():
    print("powering down")
    # cur.close()
    # call("sudo shutdown -h ", shell=True)
    return jsonify({"power": "off"})


@app.route('/Task_table', methods=['POST'])
def add_user():
    global tasks
    data = request.json
    task_name = data['name']
    task_desc = data['task_desc']
    repeat_weeks = data['repeat']
    last_completed = datetime.datetime.fromisoformat(data['last_completed'])
    print(type(last_completed))
    print("user added with data: "+str(task_name)+"; "+str(task_desc)+"; "+str(repeat_weeks)+"; "+str(last_completed)+"; ")
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO Task_table (task_name, task_desc, last_completed, repeat_weeks) VALUES (%s, %s, %s , %s)", (task_name, task_desc, last_completed, repeat_weeks))
    mysql.connection.commit()

    print(mysql.connection.rowcount, "record inserted.")
    # new_id = max(tasks)[0]+1
    # tasks.append((new_id,task_name,task_desc,last_completed,repeat_weeks))
    print(tasks)
    return jsonify({'message': 'User added successfully'}), 201


@app.route('/Task_table', methods=['GET'])
def get_users():
    cur = mysql.connection.cursor()
    global tasks
    cur.execute("SELECT * FROM Task_table")
    tasks = cur.fetchall()
    results = []
    for user in tasks:
        results.append({'id': user[0], 'name': user[1], 'task_desc': user[2], 'last_completed': user[3], 'repeat': user[4]})
    print(len(tasks))
    return jsonify(results)


@app.route('/Task_table/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json
    task_name = data['name']
    task_desc = data['task_desc']
    repeat_weeks = data['repeat']
    last_completed = datetime.datetime.fromisoformat(data['last_completed'])
    cur = mysql.connection.cursor()
    cur.execute("UPDATE Task_table SET task_name=%s, task_desc=%s, last_completed=%s, repeat_weeks=%s WHERE id_task=%s", (task_name, task_desc, last_completed, repeat_weeks, str(id)))
    mysql.connection.commit()
    print("user updated with id: "+str(id))
    # task_idx = 0
    # for idx,task in enumerate(tasks):
    #     if task[0] == id:

    #         task_idx = idx
    # print(tasks[task_idx][1])
    # tasks.pop(task_idx)
    # new_task = (id, data["name"], data["task_desc"], datetime.datetime.fromisoformat(data['last_completed']), data["repeat"])
    # tasks.append(new_task)

    print(tasks)
    return jsonify({'message': 'User updated'})

@app.route('/Task_table/<int:id>', methods=['DELETE'])
def delete_user(id):
    cur = mysql.connection.cursor()

    print("user id to deltete: "+str(id))
    # task_idx = 0
    # for idx,task in enumerate(tasks):
    #     if task[0] == id:

    #         task_idx = idx

    cur.execute("DELETE FROM Task_table WHERE id_task = %s", (str(id)))
    mysql.connection.commit()
    print("task deleted with id: "+str(id))
    return jsonify({'message': 'User deleted'})

@app.route('/Task_table/<int:id>', methods=['PATCH'])
def edit_user(id):
    cur = mysql.connection.cursor()

    data = request.json
    print("Task completed with id: "+str(id))
    last_completed = datetime.datetime.fromisoformat(data['last_completed'])
    cur.execute("UPDATE Task_table SET last_completed=%s WHERE id_task=%s", (last_completed, str(id)))
    mysql.connection.commit()
    # task_idx = 0
    # for idx,task in enumerate(tasks):
    #     if task[0] == id:

    #         task_idx = idx    
    # old_task = tasks.pop(task_idx)
    # new_task = (id, old_task[1], old_task[2], datetime.datetime.fromisoformat(data['last_completed']),old_task[4])
    # tasks.append(new_task)
    # print(tasks)
    return jsonify({'message': 'task completed'})

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

if __name__ == "__main__":
    print("Falsk app started")
    app.run(host="0.0.0.0", port=5000, debug=True)