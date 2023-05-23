from flask import jsonify
import utils.config as config

def scpsettings():
    settings = config.getDicomScpSettings()
    response = {
        "aetitle": settings[0],
        "port": settings[1],
        "label": settings[2]
    }
    return jsonify(response)