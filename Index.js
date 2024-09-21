const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const cocApiToken = process.env.COC_API_TOKEN;

// Register slash commands
const commands = [
    {
        name: 'clan',
        description: 'Get information about a Clash of Clans clan',
        options: [
            {
                name: 'tag',
                type: 3, // STRING type
                description: 'The tag of the clan',
                required: true,
            }
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationCommands('YOUR_CLIENT_ID'), { body: commands });
        console.log('Slash commands registered successfully');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
})();

// Event: Bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Handle interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'clan') {
        const clanTag = options.getString('tag').replace('#', '%23');

        try {
            const response = await axios.get(`https://api.clashofclans.com/v1/clans/${clanTag}`, {
                headers: {
                    Authorization: `Bearer ${cocApiToken}`
                }
            });

            const clan = response.data;
            await interaction.reply(`**${clan.name}** (Tag: ${clan.tag})\nLevel: ${clan.clanLevel}\nMembers: ${clan.members}/50`);
        } catch (error) {
            console.error('Error fetching clan info:', error);
            await interaction.reply('Failed to fetch clan information. Please check the clan tag and try again.');
        }
    }
});

// Login to Discord
client.login(token);
