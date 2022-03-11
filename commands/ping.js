const fs = require("fs");

module.exports = {
    name: '!ping',
    description: 'test commands',
    execute(msg, args) {
        msg.channel.send('pong');
    },
};