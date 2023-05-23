import sqlite3

def getDbConnection():
    conn = sqlite3.connect('db/virtualscanner.sqlite')
    conn.row_factory = sqlite3.Row
    return conn