from pynetdicom import AE, evt, VerificationPresentationContexts, AllStoragePresentationContexts, debug_logger
from flask_socketio import SocketIO, emit
import datetime, os

from utils import sqldb

def init(socket, statusFunc, aetitle, port):
    
    # C-ECHO handler
    def handleCEcho(event):
        assoc = event.assoc
        socket.emit("data",{'msg':'Received C-ECHO from ' + assoc.requestor.ae_title, 'uid':''}, broadcast=True)
        return 0x0000

    # C-STORE handler
    def handleCStore(event):
        assoc = event.assoc
        ds = event.dataset
        ds.file_meta = event.file_meta        

        socket.emit("data",{'msg': "Received C-STORE from " + assoc.requestor.ae_title, 'uid':ds.SOPInstanceUID}, broadcast=True)
        
        studyPath = os.path.join(os.getcwd(), 'Studies', ds.StudyInstanceUID)
        seriesPath = os.path.join(studyPath, ds.SeriesInstanceUID)
        saveFile = os.path.join(seriesPath, ds.SOPInstanceUID)

        # skip if image exists
        if os.path.exists(saveFile):
            return 0x0000

        if not os.path.exists(seriesPath):
            os.makedirs(seriesPath)

        ds.save_as(saveFile, write_like_original=False)
        fileSize = os.stat(saveFile).st_size / (1024 * 1024) # MB

        db = sqldb.getDbConnection()
        cur = db.cursor()
        study = cur.execute('SELECT * FROM study WHERE study_uid = ?', (ds.StudyInstanceUID,)).fetchone()
        if study is None:
            cur.execute(
                'INSERT INTO study (study_uid, study_desc, study_date, patient_name, modality, filepath) VALUES (?, ?, ?, ?, ?, ?)',
                (ds.StudyInstanceUID, ds.StudyDescription, ds.StudyDate, ds.PatientName.family_comma_given(), ds.Modality, studyPath))
            study = cur.execute('SELECT * FROM study WHERE study_uid = ?', (ds.StudyInstanceUID,)).fetchone()
        else:
            cur.execute(
                'UPDATE study '
                'SET updated = ? '
                'WHERE study_uid = ?',
                (datetime.datetime.now(), ds.StudyInstanceUID))

        series = cur.execute('SELECT * FROM series WHERE series_uid = ?', (ds.SeriesInstanceUID,)).fetchone()
        if series is None:
            cur.execute(
                'INSERT INTO series (study_id, series_uid, series_desc, series_date, modality, filepath, filesize) '
                'VALUES (?, ?, ?, ?, ?, ?, ?)',
                (int(study["id"]), ds.SeriesInstanceUID, ds.SeriesDescription, ds.SeriesDate, ds.Modality, seriesPath, fileSize))
        else:
            fileSize = float(series["filesize"]) + fileSize
            cur.execute(
                'UPDATE series '
                'SET updated = ?, filesize = ?'
                'WHERE id = ?',
                (datetime.datetime.now(), fileSize, series["id"]))
        
        db.commit()
            
        return 0x0000

    handlers = [
        (evt.EVT_C_STORE, handleCStore), 
        (evt.EVT_C_ECHO, handleCEcho)]

    ae = AE(ae_title=aetitle)
    ae.supported_contexts = AllStoragePresentationContexts + VerificationPresentationContexts
    ae.start_server(("0.0.0.0", port), evt_handlers=handlers)
    statusFunc(False)