from flask import request, jsonify
import json
import utils.sqldb as sqldb
  
def scanners():
    scanners = []
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        rows = cur.execute('SELECT * FROM modality').fetchall()
        for row in rows:
            scanner = {}
            scanner["id"] = row["id"]
            scanner["name"] = row["name"]
            scanner["aetitle"] = row["aetitle"]
            scanners.append(scanner)
    except:
        scanners = []             

    return jsonify(scanners)

def addscanner():
    data = request.json
    scanner_name = data.get('arg_scanner_name')
    scanner_aetitle = data.get('arg_scanner_aetitle')
    if scanner_name and scanner_aetitle:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'INSERT INTO modality (name, aetitle) VALUES (?, ?)',
            (scanner_name, scanner_aetitle))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    else:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

def removescanner(id):
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'DELETE FROM modality WHERE id = ?', (id,))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 
    
def destinations():
    destinations = []
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        rows = cur.execute('SELECT * FROM dicomnodes').fetchall()
        for row in rows:
            destination = {}
            destination["id"] = row["id"]
            destination["name"] = row["name"]
            destination["aetitle"] = row["aetitle"]
            destination["port"] = row["port"]
            destinations.append(destination)
            db.close()
    except:
        destinations = []

    return jsonify(destinations)

def adddestination():
    data = request.json
    dest_name = data.get('arg_dest_name')
    dest_aetitle = data.get('arg_dest_aetitle')
    dest_port = int(data.get('arg_dest_port'))
    if dest_name and dest_aetitle and dest_port > 0:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'INSERT INTO dicomnodes (name, aetitle, port) VALUES (?, ?, ?)',
            (dest_name, dest_aetitle, dest_port))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    else:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 

def removedestination(id):
    try:
        db = sqldb.getDbConnection()
        cur = db.cursor()
        cur.execute(
            'DELETE FROM dicomnodes WHERE id = ?', (id,))
        db.commit()
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    except:
        return json.dumps({'fail':True}), 201, {'ContentType':'application/json'} 