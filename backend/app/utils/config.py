import os, json

def getDicomScpSettings():
    aetitle = "DEFAULT_SCP"
    port = 11112
    label = ""
    if os.path.exists("config.json"):
        with open("config.json", "r") as jsonFile:
            configJson = json.load(jsonFile)
            aetitle = configJson["aetitle"]
            port = int(configJson["port"])
            label = configJson["label"]
    else:
        with open("config.json", "w") as jsonFile:
            default = {
                "aetitle" : aetitle,
                "port" : port,
                "label" : label,
            }
            aetitle = default["aetitle"]
            port = default["port"]
            label = default["label"]
            json.dump(default, jsonFile)
    
    return aetitle, port, label
