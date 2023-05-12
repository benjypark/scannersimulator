from flask_socketio import SocketIO, emit
from pydicom import dcmread
from pynetdicom import AE, StoragePresentationContexts
import time

def sendDICOM(socket):
    time.sleep(5)
    ae = AE("RANDOM_SENDER")
    ae.requested_contexts = StoragePresentationContexts
    assoc = ae.associate('10.1.42.101', 1004, ae_title='BENCVI')
    if assoc.is_established:
        ds = dcmread('study/series0001-Body/img0001--2.dcm')
        status = assoc.send_c_store(ds)
        if status:
            # If the storage request succeeded this will be 0x0000
            print('C-STORE request status: 0x{0:04x}'.format(status.Status))
            socket.emit("data",{'data':ds.SOPInstanceUID, 'id':ds.SOPInstanceUID}, broadcast=True)
        else:
            print('Connection timed out, was aborted or received invalid response')
            socket.emit("data",{'data':'fail', 'id':ds.SOPInstanceUID}, broadcast=True)

        # Release the association
        assoc.release()
    else:
        print('Association rejected, aborted or never connected')
        socket.emit("data",{'data':'Association rejected, aborted or never connected', 'id':1}, broadcast=True)