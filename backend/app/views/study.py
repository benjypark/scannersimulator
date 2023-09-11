from flask import jsonify, request
import os, json, shutil
import utils.sqldb as sqldb

def studies():
    studies = []
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        rows = cur.execute(
            'SELECT study.id as id, '
            ' study_desc, '
            ' study_date, '
            ' patient_name, '
            ' study.modality as modality, '
            ' sum(series.filesize) as filesize '
            'FROM study '
            'JOIN series ON study.id = series.study_id '
            'GROUP BY study.id').fetchall()
        for row in rows:
            study = {}
            study["id"] = row["id"]
            study["study_desc"] = row["study_desc"]
            study["study_date"] = row["study_date"]
            study["patient_name"] = row["patient_name"]
            study["modality"] = row["modality"]
            study["filesize"] = row["filesize"]
            studies.append(study)
    except:
        studies = []

    if not studies:
        return {}
    else:
        return jsonify(studies)

def removestudies():
    try:
        ids = request.json.get('selectedStudyIds', [])

        db = sqldb.getDbConnection()
        cur = db.cursor()

        # Remove files
        cur.execute("SELECT filepath FROM study WHERE id IN ({})".format(','.join('?' for _ in ids)), ids)
        filepaths = cur.fetchall()
        filepaths = [str(row[0]) for row in filepaths]
        for filepath in filepaths:
            if os.path.exists(filepath):
                print('deleting ', filepath)
                shutil.rmtree(filepath)

        # Remove DB entries
        cur.execute("DELETE FROM series WHERE study_id IN ({})".format(','.join('?' for _ in ids)), ids)
        cur.execute("DELETE FROM study WHERE id IN ({})".format(','.join('?' for _ in ids)), ids)
        db.commit()

        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 