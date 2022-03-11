const fs = require('fs');
const base_url = "https://api.tracker.gg/api/v2/rocket-league/standard/profile/"
const fetch = require('node-fetch');


module.exports = {
    name: '!add',
    description: 'gets players rank',
    execute(msg, args) {
        //check input
        if (args.length !== 2) {
            msg.reply("wrong format\n" +
                "format:  needed !.. platform #\n" +
                "example: !. steam 123456789")
        }
        //get log
        let json;
        try {
            json = fs.readFileSync("log.json");
            json = JSON.parse(json);
        } catch (err) {
            console.log("error")
            json = []
        }
        // check if user is already in log
        let res = ""
        let found = false;
        for (let i = 0; i < json.length; i++) {
            let id = json[i].data.platformInfo.platformUserIdentifier;
            if (id === args[1]) {
                res = json[i].data.platformInfo.platformUserHandle + " already added."
                found = true
                break;
            }
        }
        // gets user info if not found
        if (!found) {
            let url = base_url + args[0] + '/' + args[1];
            fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0'
                }
            })
                .then(response => response.json())
                .then(data => saveJson(json, data, msg))
            .catch(function (err) {
                console.log(err);
            })
        } else {
            msg.reply(res);
        }
    }


};

/**
 * saves the updated log to log.json and messages user that the player was added.
 * @param json log data
 * @param data new player json from API call
 * @param msg discord message
 */
function saveJson(json, data, msg) {
    let user = data.data.platformInfo.platformUserHandle;
    let entry = {
        "user": user,
        "data": data.data
    }
    json.push(entry);
    let writeJson = JSON.stringify(json, null, 2);
    fs.writeFileSync('log.json', writeJson);
    msg.reply(user + " added to tracker")
}