DROP TABLE IF EXISTS study;
CREATE TABLE study (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_uid TEXT,
    study_desc TEXT,
    study_date TEXT,
    patient_name TEXT,
    modality TEXT,
    filepath TEXT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS series;
CREATE TABLE series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_id INTEGER,
  series_uid TEXT,
  series_desc TEXT,
  series_date TEXT,
  modality TEXT,
  filepath TEXT,
  filesize INTEGER,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS modality;
CREATE TABLE modality (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  aetitle TEXT
);

DROP TABLE IF EXISTS dicomnodes;
CREATE TABLE dicomnodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  aetitle TEXT,
  port INTEGER
);

DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  status INTEGER,
  modality_id INTEGER,
  dicomnode_id INTEGER,
  option_replace_uid INTEGER DEFAULT 0,
  option_replace_phi INTEGER DEFAULT 0,
  option_study_interval INTEGER DEFAULT 0,
  option_series_interval INTEGER DEFAULT 0,
  schedule_loop INTEGER DEFAULT 0,
  schedule_loop_hours INTEGER DEFAULT 0,
  schedule_enabled INTEGER DEFAULT 0,
  schedule_repeat_interval TEXT,
  schedule_start_time TEXT,
  schedule_day_of_week TEXT
);

DROP TABLE IF EXISTS jobstudymap;
CREATE TABLE jobstudymap (
  job_id INTEGER NOT NULL,
  study_id INTEGER NOT NULL,
  status INTEGER NOT NULL
);