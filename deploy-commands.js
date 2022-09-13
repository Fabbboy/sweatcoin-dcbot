const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('price').setDescription('Replies with the current SWEAT price'),
    new SlashCommandBuilder().setName('clear').setDescription('Clears complete channel').addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to clear').setRequired(true)),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);
