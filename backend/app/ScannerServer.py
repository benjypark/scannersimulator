from flask import Flask, request, jsonify, make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from threading import Thread, Event

from dicom import scp, scu
from utils import config, sqldb
import views.setting
import views.study
import views.modality

import json

def dicomScpServiceStatus(success):
    print("dicomScpServiceStatus success=%s" % (str(success)))

def initDicomScpServices(socket):
    settings = config.getDicomScpSettings()
    dicomScpThread = Thread(
        target=scp.init, 
        args=(socket,dicomScpServiceStatus,settings[0],settings[1]))
    dicomScpThread.setDaemon(True)
    dicomScpThread.start()

def initStorageSCU(socket, job_id):
    startEvent = Event()
    stopEvent = Event()
    storageSCUThread = Thread(
        target=scu.sendStudies, 
        args=(socket,job_id,startEvent,stopEvent,))
    storageSCUThread.start()
    StorageScuThreads[job_id] = {
        'thread': storageSCUThread,
        'start': startEvent,
        'stop': stopEvent,
    }
    startEvent.set()

def initSchedulerThread(socket):
    schedulerThread = Thread(
        target=scu.runScheduler, 
        args=(socket,))
    schedulerThread.setDaemon(True)
    schedulerThread.start()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
StorageScuThreads = {}

initDicomScpServices(socketio)
initSchedulerThread(socketio)

app.add_url_rule('/api/scpsettings', methods=['GET'], view_func=views.setting.scpsettings)
app.add_url_rule('/api/studies', methods=['GET'], view_func=views.study.studies)
app.add_url_rule('/api/removestudies', methods=['POST'], view_func=views.study.removestudies)
app.add_url_rule('/api/scanners', methods=['GET'], view_func=views.modality.scanners)
app.add_url_rule('/api/addscanner', methods=['POST'], view_func=views.modality.addscanner)
app.add_url_rule('/api/removescanner/<int:id>', methods=['POST'], view_func=views.modality.removescanner)
app.add_url_rule('/api/destinations', methods=['GET'], view_func=views.modality.destinations)
app.add_url_rule('/api/adddestination', methods=['POST'], view_func=views.modality.adddestination)
app.add_url_rule('/api/removedestination/<int:id>', methods=['POST'], view_func=views.modality.removedestination)

# @app.route('/')
# def index():
#     return render_template('index.html')

@app.route("/api/addjob", methods=['POST'])
def addjob():
    data = request.json    
    scanner_id = data.get('arg_scanner_id')['selectedScannerId']
    destination_id = data.get('arg_destination_id')['selectedDestinationId']
    study_ids_array = data.get('arg_study_ids')['selectedStudyIds']
    job_name = data.get('arg_options')['jobName']
    option_replace_uid = int(data.get('arg_options')['replaceUid'])
    option_replace_phi = int(data.get('arg_options')['replacePhi'])
    option_study_interval = int(data.get('arg_options')['studyInterval'])
    option_series_interval = int(data.get('arg_options')['seriesInterval'])
    schedule_loop = int(data.get('arg_schedule')['loop'])
    schedule_loop_hours = int(data.get('arg_schedule')['loopHours'])
    schedule_enabled = int(data.get('arg_schedule')['scheduleEnabled'])
    schedule_repeat_interval = data.get('arg_schedule')['repeatInterval']
    schedule_start_time = data.get('arg_schedule')['startTime']
    schedule_day_of_week = data.get('arg_schedule')['dayOfWeek']

    if not job_name:
        job_name = 'Job'

    print('scannerid: ', scanner_id, ', destid: ', destination_id, ', study_ids: ', study_ids_array)
    
    if scanner_id > 0 and destination_id > 0 and study_ids_array:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'INSERT INTO jobs ('
            'name, '
            'status, '
            'modality_id, '
            'dicomnode_id, '
            'option_replace_uid, '
            'option_replace_phi, '
            'option_study_interval, '
            'option_series_interval, '
            'schedule_loop, '
            'schedule_loop_hours, '
            'schedule_enabled, '
            'schedule_repeat_interval, '
            'schedule_start_time, '
            'schedule_day_of_week '
            ') VALUES '
            '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (
            job_name, 
            0, 
            scanner_id, 
            destination_id, 
            option_replace_uid, 
            option_replace_phi, 
            option_study_interval, 
            option_series_interval,
            schedule_loop, 
            schedule_loop_hours, 
            schedule_enabled, 
            schedule_repeat_interval, 
            schedule_start_time, 
            schedule_day_of_week
            ))
        id = cur.lastrowid
        for study_id in study_ids_array:
            cur.execute(
                'INSERT INTO jobstudymap '
                '(job_id, study_id, status) '
                'VALUES '
                '(?, ?, ?)',
                (id, study_id, 0))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    else:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

@app.route("/api/jobs", methods=["GET"])
def jobs():
    jobs = []
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        rows = cur.execute(
            'SELECT '
            ' j.id as id,'
            ' j.name as name,'
            ' j.status as status,'
            ' m.aetitle as modality_aetitle,'
            ' d.aetitle as dicomnode_aetitle,'
            ' j.option_replace_uid as option_replace_uid, '
            ' j.option_replace_phi as option_replace_phi, '
            ' j.option_study_interval as option_study_interval, '
            ' j.option_series_interval as option_series_interval, '
            ' j.schedule_loop as schedule_loop, '
            ' j.schedule_loop_hours as schedule_loop_hours, '
            ' j.schedule_enabled as schedule_enabled, '
            ' j.schedule_repeat_interval as schedule_repeat_interval, '
            ' j.schedule_start_time as schedule_start_time, '
            ' j.schedule_day_of_week as schedule_day_of_week '
            'FROM jobs j, modality m, dicomnodes d '
            'WHERE j.modality_id = m.id and j.dicomnode_id = d.id;').fetchall()
        for row in rows:
            job = {}
            job["id"] = row["id"]
            job["name"] = row["name"]
            job["status"] = row["status"]
            job["modality_aetitle"] = row["modality_aetitle"]
            job["dicomnode_aetitle"] = row["dicomnode_aetitle"]
            job["option_replace_uid"] = row["option_replace_uid"]
            job["option_replace_phi"] = row["option_replace_phi"]
            job["option_study_interval"] = row["option_study_interval"]
            job["option_series_interval"] = row["option_series_interval"]
            job["schedule_loop"] = row["schedule_loop"]
            job["schedule_loop_hours"] = row["schedule_loop_hours"]
            job["schedule_enabled"] = row["schedule_enabled"]
            job["schedule_repeat_interval"] = row["schedule_repeat_interval"]
            job["schedule_start_time"] = row["schedule_start_time"]
            job["schedule_day_of_week"] = row["schedule_day_of_week"]
            jobs.append(job)
    except:
        jobs = []

    return jsonify(jobs)

@app.route('/api/removejob/<int:id>', methods=['DELETE'])
def removejob(id):
    try:
        if id in StorageScuThreads:
            startEvent = StorageScuThreads[id].get('start')
            startEvent.clear()
            stopEvent = StorageScuThreads[id].get('stop')
            stopEvent.set()

        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute('DELETE FROM jobs WHERE id = ?', (id,))
        cur.execute('DELETE FROM jobstudymap WHERE job_id = ?', (id,))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

@app.route('/api/startjob/<int:id>', methods=['POST'])
def startjob(id):
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'UPDATE jobs SET status = ? WHERE id = ?', (1, id,))
        db.commit()
        
        if id in StorageScuThreads:
            thread = StorageScuThreads[id].get('thread')
            if thread.is_alive():
                startEvent = StorageScuThreads[id].get('start')
                startEvent.set()
            else:
                StorageScuThreads.pop(id)
                initStorageSCU(socketio, id)    
        else:
            initStorageSCU(socketio, id)
            
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

@app.route('/api/pausejob/<int:id>', methods=['POST'])
def pausejob(id):
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'UPDATE jobs SET status = ? WHERE id = ?', (0, id,))
        db.commit()
        
        if id in StorageScuThreads:
            thread = StorageScuThreads[id].get('thread')
            if thread.is_alive():
                startEvent = StorageScuThreads[id].get('start')
                startEvent.clear() # unset
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 
    
@app.route('/api/stopjob/<int:id>', methods=['POST'])
def stopjob(id):
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'UPDATE jobs SET status = ? WHERE id = ?', (0, id,))
        db.commit()
        
        if id in StorageScuThreads:
            startEvent = StorageScuThreads[id].get('start')
            startEvent.clear()
            stopEvent = StorageScuThreads[id].get('stop')
            stopEvent.set()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

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