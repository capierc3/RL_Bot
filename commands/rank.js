const fs = require('fs');
const Discord = require('discord.js');
const fetch = require("node-fetch");

module.exports = {
    name: '!rank',
    description: 'gets players rank',
    async execute(msg, args) {
        //get log
        let log = getLog();
        //get username
        let user = "";
        for (let i = 0; i < args.length; i++) {
            if (i > 0) user += " ";
            user += args[i];
        }
        // find user entry
        let userIdx = getUser(log, user);
        // check for update and update if needed
        let needUpdate = checkUpdate(log[userIdx].data.expiryDate);
        if (needUpdate) {
            await update(log[userIdx].data.platformInfo.platformSlug, log[userIdx].data.platformInfo.platformUserIdentifier, log, userIdx);
            log = getLog();
            userIdx = getUser(log,user);
        }
        // find ranks and respond to message
        let rankString = "\n";
        rankString += user + "'s ranks:\n";
        rankString += getRanks(log[userIdx].data.segments);
        msg.reply(rankString);
    }
};

/**
 * gets the json object from log.json
 * @returns {*[]}
 */
function getLog() {
    let json;
    try {
        json = fs.readFileSync("log.json");
        json = JSON.parse(json);
    } catch (err) {
        console.log("error")
        json = []
    }
    return json;
}

/**
 * finds the ranks from the users json data
 * @param playlists log[x].data.segments of the user
 * @returns {string} String of ranks to print
 */
function getRanks(playlists) {
    let ranks = "";
    let rankArr = ["No ranking found.","No ranking found.","No ranking found.","No ranking found.","No ranking found."];
    // loop through segments to find rankings for playlists
    for (let i = 0; i < playlists.length; i++) {
        switch (playlists[i].metadata.name) {
            case 'Un-Ranked':
                rankArr[0] = playlists[i].stats.rating.displayValue + " mmr\n";
                break;
            case 'Ranked Duel 1v1':
                rankArr[1] = playlists[i].stats.tier.metadata.name + " " + playlists[1].stats.division.metadata.name + "\n"
                break;
            case "Ranked Doubles 2v2":
                rankArr[2] = playlists[i].stats.tier.metadata.name + " " + playlists[1].stats.division.metadata.name + "\n"
                break;
            case "Ranked Standard 3v3":
                rankArr[3] = playlists[i].stats.tier.metadata.name + " " + playlists[1].stats.division.metadata.name + "\n"
                break;
            case "Tournament Matches":
                rankArr[4] = playlists[i].stats.tier.metadata.name + " " + playlists[1].stats.division.metadata.name + "\n"
                break;
        }
    }
    // build and return string
    ranks += "Casual: " + rankArr[0]
        + "Duels: " + rankArr[1]
        + "Doubles: " + rankArr[2]
        + "Standard 3v3: " + rankArr[3]
        + "Tournaments: " + rankArr[4];
    return ranks;
}

/**
 * checks the expiryDate from the user json and compares to current date, if expired returns true.
 * @param exDate log.data.expiryDate string
 * @returns {boolean} true past expiry date, false if still current.
 */
function checkUpdate(exDate) {
    // separate exDate string into usable chunks
    let exDateArFull = exDate.split("T");
    let exDateYMD = exDateArFull[0].split("-");
    let exDateTime = exDateArFull[1].split(":");
    // get current date
    let date = new Date();
    // check year, month, day
    if (!(date.getUTCFullYear() === parseInt(exDateYMD[0], 10))) {
        return true
    } else if (!(('0' + (date.getUTCMonth()+1)).slice(-2) === exDateYMD[1])) {
        return true;
    } else if (!(('0' + date.getUTCDate()).slice(-2) === exDateYMD[2])) {
        return true;
    }
    // check hours and mins
    let hour = parseInt(exDateTime[0], 10);
    let min = parseInt(exDateTime[1], 10);
    if (hour < date.getUTCHours()) {
        return true;
    } else if (min <= date.getUTCMinutes()) {
        return true;
    }
    // no update needed
    return false;
}

/**
 * Gets the new user data from the API
 * @param platform users platform, found at log[userIdx].data.platformInfo.platformSlug
 * @param id users if number, found at log[userIdx].data.platformInfo.platformUserIdentifier
 * @param log the complete log json
 * @param userIdx index of the user to update
 * @returns {Promise<void>} waits for completion to move on.
 */
async function update(platform, id, log, userIdx) {
    //build url
    const base_url = "https://api.tracker.gg/api/v2/rocket-league/standard/profile/";
    let url = base_url + platform + '/' + id;
    // fetch from url
    fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0'
        }
    })
        .then(response => response.json())
        .then(data => saveJson(log, data, userIdx))
        .catch(function (err) {
            console.log(err);
        })
}

/**
 *
 * @param log complete log json object
 * @param user user name to find
 * @returns {number} index value, -404 if user not in log
 */
function getUser(log, user) {
    for (let i = 0; i < log.length; i++) {
        if (log[i].user === user) {
            return i
        }
    }
    return -404;
}

/**
 * Saves the json log to file after updated
 * @param log complete log json object
 * @param data new data to add
 * @param userIdx index of user to update
 */
function saveJson(log, data, userIdx) {
    log[userIdx].data = data.data;
    let writeJson = JSON.stringify(log, null, 2);
    fs.writeFileSync('log.json', writeJson);
}