import sqlite3

with open('db/schema.sql', 'r') as sql_file:
    sql_script = sql_file.read()

db = sqlite3.connect('db/virtualscanner.sqlite')
cursor = db.cursor()
cursor.executescript(sql_script)
db.commit()
db.close()