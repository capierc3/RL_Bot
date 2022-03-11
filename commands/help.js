/***
 * Shows the commands and how to use them.
 * @type {{name: string, description: string, execute(*, *): void}}
 */
module.exports = {
    name: '!help',
    description: 'displays commands and how to use them',
    execute(msg, args) {
        let string =
            "All commands start with '!'\n" +
            "- add platform id\n" +
            "   - Adds a new user to the bot. Needs the platform and user id to work.\n" +
            "   - platform: steam, xbl, epic, psn, switch\n" +
            "   - id: \n" +
            "       - Steam: number found in url on rltracker website\n" +
            "       - All other just your username\n" +
            "- rank user:\n" +
            "   - Shows the ranking of the main user, will update if data is old\n" +
            "   - user: user name, case matters.";

        msg.author.send(string);
    },
};