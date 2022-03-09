const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
    name: '!rank',
    description: 'gets players rank',
    execute(msg, args) {
        //get log
        let json;
        try {
            json = fs.readFileSync("log.json");
            json = JSON.parse(json);
        } catch (err) {
            console.log("error")
            json = []
        }
        //get username
        let user = "";
        for (let i = 0; i < args.length; i++) {
            if (i > 0) user += " ";
            user += args[i];
        }

        let rankString = "\n";
        for (let i = 0; i < json.length; i++) {
            if (json[i].user === user) {
                rankString += user + "'s ranks:\n";
                rankString += getRanks(json[i].data.segments);
            }
        }

        msg.reply(rankString);
    },


};

function getRanks(playlists) {
    let ranks = "";
    ranks += "Casual: " + playlists[1].stats.rating.displayValue + " mmr\n"
        + "Duels: " + playlists[2].stats.tier.metadata.name + " " + playlists[2].stats.division.metadata.name + "\n"
        + "Doubles: " + playlists[3].stats.tier.metadata.name + " " + playlists[3].stats.division.metadata.name + "\n"
        + "Standard 3v3: " + playlists[4].stats.tier.metadata.name + " " + playlists[4].stats.division.metadata.name + "\n"
        + "Tournaments: " + playlists[9].stats.tier.metadata.name + " " + playlists[9].stats.division.metadata.name + "\n"

    return ranks;
}