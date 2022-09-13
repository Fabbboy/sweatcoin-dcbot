const { Client, GatewayIntentBits, Embed, EmbedBuilder} = require('discord.js');
let { token } = require('./config.json');
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

//import coinGecko from 'coingecko-api';
const coinGecko = require('coingecko-api');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');
});

async function getCurrentSweatPriceChannel() {
    const channel = client.channels.cache.get('1019315396710506646');
    const CoinGeckoClient = new coinGecko();
    const data = await CoinGeckoClient.coins.fetch('sweatcoin', {});
    const price = data.data.market_data.current_price.usd;
    const eur = data.data.market_data.current_price.eur;
    const chf = data.data.market_data.current_price.chf;
    const totalVolume = data.data.market_data.total_volume.usd;
    //await interaction.reply("The current SWEAT price is: " + price);

    const exampleEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('SWEAT Price')
        .setTimestamp()
        .setAuthor({
            name: "Tracker",
            iconURL: 'https://uploads-ssl.webflow.com/61110d4f51955c3ea8e4b009/613744d6635c6c7a9636a705_sweatcoin-app-icon-no-bg.png'
        })
        .setURL('https://www.coingecko.com/en/coins/sweatcoin')
        .setThumbnail('https://uploads-ssl.webflow.com/61110d4f51955c3ea8e4b009/613744d6635c6c7a9636a705_sweatcoin-app-icon-no-bg.png')
        .addFields(
            {name: 'USD:', value: price.toString(), inline: false},
            {name: 'CHF:', value: chf.toString(), inline: false},
            {name: 'EUR:', value: eur.toString(), inline: false},
            {name: 'Total Volume:', value: formatToHumanReadable(totalVolume.toString()) + " USD", inline: false},
        )

    channel.send({embeds: [exampleEmbed]});
}

//when bot is on send every minute the current price
client.on('ready', () => {
    const channelId = "1019315396710506646"
    const channel = client.channels.cache.get(channelId)
    if (!channel) return console.error("The channel does not exist!");
    setInterval(async () => {
        await getCurrentSweatPriceChannel();
    }, 60000);
})

function setStatus() {
    getSweatInfo().then(function (data) {
        const price = data.data.market_data.current_price.usd;
        client.user.setActivity("Price: " + price.toString() + " USD", { type: 'WATCHING' });
    });
}

//set activity
client.on('ready', () => {
   setStatus();
})

async function clearChannel(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
        return interaction.reply({ content: 'You need to input a number between 1 and 100.', ephemeral: true });
    }
    await interaction.channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        interaction.channel.send('There was an error trying to prune messages in this channel!');
    });
    //reply and delete after 5 seconds
    const reply = await interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });

}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'price') {
        await getCurrentSweatPrice(interaction);
       // await interaction.reply("The current SWEAT price is: " + price);
    }else if(commandName === "clear"){
        //new SlashCommandBuilder().setName('clear').setDescription('Clears complete channel').addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to clear').setRequired(true)),
        await clearChannel(interaction);

    }

});


function formatToHumanReadable(s) {
    var i = parseInt(s);
    if (isNaN(i)) { return ''; }
    var minus = '';
    if (i < 0) { minus = '-'; }
    i = Math.abs(i);
    var n = new String(i);
    var a = [];
    while (n.length > 3) {
        var nn = n.substr(n.length-3);
        a.unshift(nn);
        n = n.substr(0,n.length-3);
    }
    if (n.length > 0) { a.unshift(n); }
    n = a.join('.');
    i = n;
    return minus + i;
}

async function getCurrentSweatPrice(interaction) {
    const CoinGeckoClient = new coinGecko();
    const data = await CoinGeckoClient.coins.fetch('sweatcoin', {});
    const price = data.data.market_data.current_price.usd;
    const eur = data.data.market_data.current_price.eur;
    const chf = data.data.market_data.current_price.chf;
    const totalVolume = data.data.market_data.total_volume.usd;
    //await interaction.reply("The current SWEAT price is: " + price);

    const exampleEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('SWEAT Price')
        .setTimestamp()
        .setAuthor({ name: "Tracker", iconURL: 'https://uploads-ssl.webflow.com/61110d4f51955c3ea8e4b009/613744d6635c6c7a9636a705_sweatcoin-app-icon-no-bg.png'})
        .setURL('https://www.coingecko.com/en/coins/sweatcoin')
        .setThumbnail('https://uploads-ssl.webflow.com/61110d4f51955c3ea8e4b009/613744d6635c6c7a9636a705_sweatcoin-app-icon-no-bg.png')
        .addFields(
            { name: 'USD:', value: price.toString(), inline: false },
            { name: 'CHF:', value: chf.toString(), inline: false },
            { name: 'EUR:', value: eur.toString(), inline: false },
            { name: 'Total Volume:', value: formatToHumanReadable(totalVolume.toString()) + " USD", inline: false },
            )

    await interaction.reply({ embeds: [exampleEmbed] });
}
async function getSweatInfo() {
    const CoinGeckoClient = new coinGecko();
    return CoinGeckoClient.coins.fetch('sweatcoin', {});
}

//remove last char of token
token = token.substring(0, token.length - 1);
client.login(token);