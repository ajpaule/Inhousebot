const Discord = require('discord.js');
const { google } = require('googleapis');
const config = require('../config.json');
const creds = require('../inhouse_client_secret.json');
const client = new google.auth.JWT(
    creds.client_email, 
    null, 
    creds.private_key, 
    ['https://www.googleapis.com/auth/spreadsheets']
);

module.exports.run = async (bot, message, args) => {
    client.authorize(function(err, tokens){
        if(err){
            console.log(err);
        }else{
            addPlayer(client);
        }
    
    });
    async function addPlayer(cl){
        const sheet = google.sheets({version:'v4', auth: cl});
        const pickUpOptions = {
            spreadsheetId: config.sheetToken,
            range: 'PickUp!A2:D'
        };

        let pickUpData = await sheet.spreadsheets.values.get(pickUpOptions);
        let pickUpValues = pickUpData.data.values;
        let lastRow = pickUpValues.length + 1;
        let players = pickUpValues.map(x => x[1]);
        
        if(players.includes(message.author.id)){ return; }
        if(lastRow >= 8){ return; }

        let pickUpDetails = [
            message.author.username,
            message.author.id,
            message.author.toString(),
        ];

        const addPickUp = {
            spreadsheetId: config.sheetToken,
            range: 'PickUp!A' + Number(lastRow + 1),
            valueInputOption: 'USER_ENTERED',
            resource: { values: [pickUpDetails] }
        };
        let sheetResponse = await sheet.spreadsheets.values.update(addPickUp);

        let activePlayers = pickUpValues.map(x => x[0]);
        activePlayers.push(message.author.username);

        const newPickUp = new Discord.MessageEmbed()
        .setTitle('Players')
        .setColor(0xff00FF)
        .setDescription(activePlayers.join(' - '));
        message.channel.send(newPickUp);
    }
};

module.exports.help = {
    name: 'add',
};