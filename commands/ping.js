/***
 * Command file for testing new features.
 * @type {{name: string, description: string, execute(*, *): void}}
 */
module.exports = {
    name: '!ping',
    description: 'test commands',
    execute(msg, args) {
        msg.channel.send('pong');
    },
};