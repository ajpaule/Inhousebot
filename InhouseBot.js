const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json')
const { google } = require('googleapis');
const creds = require('./inhouse_client_secret.json');
const client = new google.auth.JWT(
    creds.client_email, 
    null, 
    creds.private_key, 
    ['https://www.googleapis.com/auth/spreadsheets']
);
const bot = new Discord.Client();

bot.on('ready', () => {
    console.log('Bot Online');
})

bot.commands = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
    if(err){ 
        console.error(err); 
    }

    let jsFiles = files.filter(f => f.split('.').pop() === 'js');

    if(jsFiles.length <= 0){ 
        return; 
    }
    jsFiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        bot.commands.set(props.help.name, props);
    });
});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;

    let prefix = config.prefix;
    let msgArray = message.content.split(' ');
    let command = msgArray[0].toLowerCase();
    let args = msgArray;

    if(!command.startsWith(prefix)) return;

    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot, message, args);
});

bot.login(config.inhouseToken);