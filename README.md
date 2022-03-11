# Rocket League Tracker Bot

Discord bot to view rocket league stats. 

### current build:

- !add platform number
	+ platform: example is "steam"
	+ number: the user number found on RLtrackers site for the user
	+ command adds the user to the log.json file for the bot
- !rank user
	+ user: user name of player
	+ command shows the rank of the main 4 play list
	+ user log entry is updated if past the expiry date

### Files needed not in git

- .env file:
	+ this file is needed to run the discord bot, add it to the root dir
	+ file needs one line that contains the token given by discord. 
	 	+ "TOKEN=...."

### coming builds:
- !help feature to show commands
- leader boards
- ???
