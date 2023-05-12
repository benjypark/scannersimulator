from pynetdicom import AE, evt, AllStoragePresentationContexts, debug_logger
from flask_socketio import SocketIO, emit
import datetime, os
import sqlite3

def getDbConnection():
    conn = sqlite3.connect('db/virtualscanner.sqlite')
    conn.row_factory = sqlite3.Row
    return conn


def listenStoreSCP(socket):
    # Implement a handler for evt.EVT_C_STORE
    def handle_store(event):
        """Handle a C-STORE request event."""
        # Decode the C-STORE request's *Data Set* parameter to a pydicom Dataset
        ds = event.dataset

        # Add the File Meta Information
        ds.file_meta = event.file_meta

        savePath = 'Studies/'+ ds.StudyInstanceUID + '/'

        if not os.path.exists(savePath):
            os.makedirs(savePath)

        # Save the dataset using the SOP Instance UID as the filename
        ds.save_as(savePath + ds.SOPInstanceUID, write_like_original=False)
        print('Saved as ' + savePath +  ds.SOPInstanceUID)

        db = getDbConnection()

        study = db.execute('SELECT * FROM study WHERE study_uid = ?', (ds.StudyInstanceUID,)).fetchone()
        print('Queried '+ ds.StudyInstanceUID)
        if study is None:
            print('INSERT INTO study : '+ ds.StudyInstanceUID)
            db.execute(
                'INSERT INTO study '
                '(study_uid, study_desc, study_date, patient_id, patient_name, modality, filepath) '
                ' VALUES '
                '(?, ?, ?, ?, ?, ?, ?)',
                (ds.StudyInstanceUID,
                ds.StudyDescription,
                ds.StudyDate,
                ds.PatientID,
                ds.PatientName,
                ds.Modality,
                savePath))    
        else:
            print('UPDATE study : '+ ds.StudyInstanceUID)
            db.execute(
                'UPDATE study '
                'SET updated = ? WHERE study_uid = ?',
                (datetime.datetime.now(), ds.StudyInstanceUID))
        db.commit()
        
        socket.emit("data",{'data':ds.SOPInstanceUID, 'id':ds.SOPInstanceUID}, broadcast=True)

        # Return a 'Success' status
        return 0x0000

    handlers = [(evt.EVT_C_STORE, handle_store)]

    # Initialise the Application Entity
    ae = AE(ae_title='BEN')

    # Support presentation contexts for all storage SOP Classes
    ae.supported_contexts = AllStoragePresentationContexts

    # Start listening for incoming association requests
    ae.start_server(("127.0.0.1", 11112), evt_handlers=handlers)