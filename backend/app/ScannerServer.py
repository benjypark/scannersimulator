from flask import Flask, request,jsonify, make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import sqlite3

from threading import Thread
from dicom import storagescp, storagescu

def getDbConnection():
    conn = sqlite3.connect('db/virtualscanner.sqlitedb')
    conn.row_factory = sqlite3.Row
    return conn

def initStorageSCP(socket):
    listenStoreSCPThread = Thread(target=storagescp.listenStoreSCP, args=(socket,))
    listenStoreSCPThread.setDaemon(True)
    listenStoreSCPThread.start()

def initStorageSCU(socket):
    storageSCUThread = Thread(target=storagescu.sendDICOM, args=(socket,))
    storageSCUThread.start()
    print('New thread created: ', storageSCUThread.ident)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
#db = getDbConnection()

initStorageSCP(socketio)

# @app.route('/')
# def index():
#     conn = get_db_connection()
#     posts = conn.execute('SELECT * FROM posts').fetchall()
#     conn.close()
#     return render_template('index.html', posts=posts)

@app.route("/push", methods=['POST'])
def push():
    taskId = request.data
    print("REQUESTED: push - ", taskId)
    initStorageSCU(socketio)
    return "Success", 201

@app.route("/http-call")
def http_call():
    """return JSON with string data as the value"""
    print("REQUESTED: http-call")
    data = {'data':'Just plain old json data from http'}
    return jsonify(data)

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")
    emit("connect",{"data":f"id: {request.sid} is connected"})

@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    print("user disconnected")
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)