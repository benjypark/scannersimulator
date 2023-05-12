DROP TABLE IF EXISTS study;

CREATE TABLE study (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    study_uid TEXT,
    study_desc TEXT,
    study_date DATE,
    patient_id TEXT,
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
  modality TEXT,
  filepath TEXT,
  filsize INTEGER,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);