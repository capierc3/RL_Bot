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
        let needUpdate = checkUpdate(log[userIdx].data.expiryDate);
        if (needUpdate) {
            await update(log[userIdx].data.platformInfo.platformSlug, log[userIdx].data.platformInfo.platformUserIdentifier, log, userIdx);
            log = getLog();
            userIdx = getUser(log,user);
        }
        let rankString = "\n";
        rankString += user + "'s ranks:\n";
        rankString += getRanks(log[userIdx].data.segments);
        msg.reply(rankString);
    }
};

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

function getRanks(playlists) {
    let ranks = "";
    let rankArr = ["No ranking found.","No ranking found.","No ranking found.","No ranking found.","No ranking found."];
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
    ranks += "Casual: " + rankArr[0]
        + "Duels: " + rankArr[1]
        + "Doubles: " + rankArr[2]
        + "Standard 3v3: " + rankArr[3]
        + "Tournaments: " + rankArr[4];

    return ranks;
}

function checkUpdate(exDate) {
    let exDateArFull = exDate.split("T");
    let exDateYMD = exDateArFull[0].split("-");
    let exDateTime = exDateArFull[1].split(":");

    let date = new Date();

    let needUpdate = false;
    // check year, month, day
    if (!(date.getUTCFullYear() === parseInt(exDateYMD[0], 10))) {
        needUpdate = true
    } else if (!(('0' + (date.getUTCMonth()+1)).slice(-2) === exDateYMD[1])) {
        console.log("month");
        needUpdate = true;
    } else if (!(('0' + date.getUTCDate()).slice(-2) === exDateYMD[2])) {
        console.log('day');
        needUpdate = true;
    }
    // check hours and mins
    let hour = parseInt(exDateTime[0], 10);
    let min = parseInt(exDateTime[1], 10);
    if (hour < date.getUTCHours()) {
        needUpdate = true;
    } else if (min <= date.getUTCMinutes()) {
        needUpdate = true;
    }
    return needUpdate;
}

async function update(platform, id, log, userIdx) {
    const base_url = "https://api.tracker.gg/api/v2/rocket-league/standard/profile/";
    let url = base_url + platform + '/' + id;
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

function getUser(log, user) {
    for (let i = 0; i < log.length; i++) {
        if (log[i].user === user) {
            return i
        }
    }
    return -404;
}

function saveJson(log, data, userIdx) {
    // let user = data.data.platformInfo.platformUserHandle;
    // let entry = {
    //     "user": user,
    //     "data": data.data
    // }
    //json.push(entry);

    log[userIdx].data = data.data;
    let writeJson = JSON.stringify(log, null, 2);
    fs.writeFileSync('log.json', writeJson);
}