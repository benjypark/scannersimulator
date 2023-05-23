from flask_socketio import SocketIO, emit
from pydicom import dcmread
from pydicom.uid import generate_uid
from pynetdicom import AE, StoragePresentationContexts

import os, time, random, string
from datetime import datetime, timedelta

from utils import sqldb

def runScheduler(socket):
    monitor = True
    queryInterval = 60 # 60 secs
    while monitor:
        for job in scheduledJobs():
            if matchesCriteria(job):
                sendStudies(int(job['id']))
        time.sleep(queryInterval)

def scheduledJobs():
    db = sqldb.getDbConnection()
    cur = db.cursor()
    scheduledJobs = cur.execute(
        'SELECT '
        '   id, '
        '   schedule_repeat_interval, '
        '   schedule_start_time, '
        '   schedule_day_of_week '
        'FROM jobs '
        'WHERE schedule_enabled = 1;').fetchall()
    return scheduledJobs

def matchesCriteria(job):
    currentDayOfWeek = 'wednesday'
    currentTime = '15:01' # TO-DO: datetime.now()

    scheduledRepeatInterval = job['schedule_repeat_interval']
    scheduledDayOfWeek = job['schedule_day_of_week']
    scheduledStartTime = job['schedule_start_time']

    # check day
    if scheduledRepeatInterval == 'weekly':
        if scheduledDayOfWeek != currentDayOfWeek:
            return False

    # check time
    if scheduledStartTime != currentTime:
        return False
    
    return True

def sendStudies(socket, job_id, startEvent, stopEvent):
    db = sqldb.getDbConnection()
    cur = db.cursor()
    job = cur.execute(
        'SELECT '
        ' j.id as id,'
        ' j.name as name,'
        ' j.status as status,'
        ' m.aetitle as modality_aetitle,'
        ' d.name as dicomnode_hostname,'
        ' d.aetitle as dicomnode_aetitle,'
        ' d.port as dicomnode_port, '
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
        'WHERE j.modality_id = m.id and j.dicomnode_id = d.id and j.id = ?;',
        (job_id,)).fetchone()
    sender_aetitle = job['modality_aetitle']
    dest_hostname = job['dicomnode_hostname']
    dest_aetitle = job['dicomnode_aetitle']
    dest_port = int(job['dicomnode_port'])
    option_replace_uid = int(job['option_replace_uid'])
    option_replace_phi = int(job['option_replace_phi'])
    option_study_interval = int(job['option_study_interval'])
    option_series_interval = int(job['option_series_interval'])
    schedule_loop = int(job['schedule_loop'])
    schedule_loop_hours = int(job['schedule_loop_hours'])
    schedule_enabled = job['schedule_enabled']
    schedule_repeat_interval = job['schedule_repeat_interval']
    schedule_start_time = job['schedule_start_time']
    schedule_day_of_week = job['schedule_day_of_week']
    
    studies_series = cur.execute(
        'SELECT study.patient_name || \'-\' || study_desc, study.id as studyId, series.id as seriesId, series.filepath '
        'FROM study, series, jobstudymap j '
        'WHERE j.study_id = study.id and series.study_id = study.id and j.job_id = ? '
        'ORDER BY studyId, seriesId;',
         (job_id,)
    ).fetchall()

    startDateTime = datetime.now()

    resume = True
    
    ae = AE(sender_aetitle)
    ae.requested_contexts = StoragePresentationContexts
    assoc = ae.associate(dest_hostname, dest_port, ae_title=dest_aetitle)
    if not assoc.is_established:
        resume = False
    else:
        assoc.release()

    while resume:
        uidMap = {}
        prevStudyId = ''
        maxIndex = len(studies_series) - 1
        for index, study_series_item in enumerate(studies_series):
            curStudyId = study_series_item[0]
            if ((prevStudyId != '') and (prevStudyId != curStudyId)):
                print('Now wait between studies')
                waitForNextSend(socket, job_id, option_study_interval * 60, stopEvent)
            prevStudyId = curStudyId
            if stopEvent.is_set():
                socket.emit("data",{'job_id': job_id, 'msg': "Job stopped", 'status': 3}, broadcast=True)
                resume = False
            else:
                if not startEvent.is_set():
                    socket.emit("data",{'job_id': job_id, 'msg': "Job paused", 'status': 2}, broadcast=True)
                startEvent.wait()
                nextStudyDesc = 'Last study & series' if index == maxIndex else studies_series[index][0]
                currStudyDesc = study_series_item[0]
                seriesPath = study_series_item[3]
                socket.emit("data",{'job_id': job_id, 'msg': "Sending study " + currStudyDesc, 'status': 1, 'next': nextStudyDesc}, broadcast=True)
                sendSeries(
                    sender_aetitle, 
                    dest_hostname,
                    dest_port,
                    dest_aetitle,
                    seriesPath, 
                    socket, 
                    job_id, 
                    option_replace_uid, 
                    option_replace_phi, 
                    uidMap, 
                    currStudyDesc, 
                    nextStudyDesc, 
                    stopEvent)
                
                elapsedSecondsSinceStart = (datetime.now() - startDateTime).total_seconds()
                continueLoop = elapsedSecondsSinceStart < (schedule_loop_hours * 3600)
                print('elapsed: ', elapsedSecondsSinceStart)
                print('loopHours: ', schedule_loop_hours * 3600)
                if schedule_loop and not continueLoop:
                    break
                else:
                    print('Now wait between series')
                    waitForNextSend(socket, job_id, option_series_interval * 60, stopEvent)
        elapsedSecondsSinceStart = (datetime.now() - startDateTime).total_seconds()
        continueLoop = elapsedSecondsSinceStart < (schedule_loop_hours * 3600)
        resume = schedule_loop & continueLoop & resume
    
    if not stopEvent.is_set():
        socket.emit("data",{'job_id': job_id, 'msg':'Finished', 'status': 4}, broadcast=True)

def sendSeries(
        sender_aetitle, 
        dest_hostname,
        dest_port,
        dest_aetitle,
        seriesPath, 
        socket, 
        job_id, 
        option_replace_uid, 
        option_replace_phi, 
        uidMap,
        currStudyDesc, 
        nextStudyDesc, 
        stopEvent):
     
    ae = AE(sender_aetitle)
    ae.requested_contexts = StoragePresentationContexts
    assoc = ae.associate(dest_hostname, dest_port, ae_title=dest_aetitle)
    if assoc.is_established:
        for images in os.listdir(seriesPath):
            if stopEvent.is_set():
                break
            imagePath = os.path.join(seriesPath, images)
            ds = dcmread(imagePath)
            if option_replace_uid:
                replaceUid(uidMap, ds['StudyInstanceUID'])
                replaceUid(uidMap, ds['SeriesInstanceUID'])
                replaceUid(uidMap, ds['SOPInstanceUID'])
            if option_replace_phi:
                replacePhi(uidMap, ds['PatientName'])
                # replacePhi(uidMap, ds['PatientID'])
                # replacePhi(uidMap, ds['OtherPatientID'])
            status = assoc.send_c_store(ds)
            if status:
                msg = 'C-STORE success: 0x{0:04x}'.format(status.Status)
                # socket.emit("data",{'job_id': job_id, 'msg': "Sending study " + currStudyDesc, 'status': 1, 'next': nextStudyDesc}, broadcast=True)
            else:
                msg = 'C-STORE failed: 0x{0:04x}'.format(status.Status)
                # socket.emit("data",{'job_id': job_id, 'msg': msg, 'status': 0 }, broadcast=True)
    else:
        socket.emit("data",{'job_id': job_id, 'msg': "Association rejected, aborted or never connected", 'status': 0 }, broadcast=True)               

    # Release the association
    assoc.release()

def replaceUid(uidMap, uidElement):
    if uidElement.value in uidMap:
        uidElement.value = uidMap[uidElement.value]
    else:
        newUid = generate_uid()
        uidMap[uidElement.value] = newUid
        uidElement.value = newUid

# not yet tested. 2023-06-10
def replacePhi(phiMap, phiElement):
    if phiElement.value in phiMap:
        phiElement.value = phiMap[phiElement.value]
    else:
        newPhi = ''.join(random.choices(string.ascii_uppercase, k=16))
        phiMap[phiElement.value] = newPhi
        phiElement.value = newPhi

def waitForNextSend(socket, job_id, intervalSeconds, stopEvent):
    for remaining in range(intervalSeconds, 0, -1):
        if stopEvent.is_set():
            break
        socket.emit("data",{'job_id': job_id, 'msg':'Waiting %d out of %d seconds...' % (remaining, intervalSeconds), 'status': 1}, broadcast=True)
        time.sleep(1)
