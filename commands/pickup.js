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
            startPickup(client);
        }
    
    });
    async function startPickup(cl){
        const sheet = google.sheets({version:'v4', auth: cl});
        const pickUpOptions = {
            spreadsheetId: config.sheetToken,
            range: 'PickUp!A:D'
        };

        let pickUpData = await sheet.spreadsheets.values.get(pickUpOptions);
        let pickUpValues = pickUpData.data.values;
        let pickUpDetails = [
            message.author.username,
            message.author.id,
            message.author.toString(),
        ];

        if(pickUpValues.length > 1){
            const pickUpInProgress = new Discord.MessageEmbed()
            .setTitle('Pick Up In Progress')
            .setColor(0xFF0000)
            .setDescription('Unable to create pickup while one is in progress.');
            message.channel.send(pickUpInProgress);
        } else {
            const addPickUp = {
                spreadsheetId: config.sheetToken,
                range: 'PickUp!A2',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [pickUpDetails] }
            };
            let sheetResponse = await sheet.spreadsheets.values.update(addPickUp);
    
            const newPickUp = new Discord.MessageEmbed()
            .setTitle('Pick Up Started')
            .setColor(0x00FF00)
            .setDescription('Use \'!add\' to join pickup');
            message.channel.send(newPickUp);
        }
    }
};

module.exports.help = {
    name: 'pickup',
};