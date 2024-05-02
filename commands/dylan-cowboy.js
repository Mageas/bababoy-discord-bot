const { SlashCommandBuilder } = require('discord.js');
const { sendMessageInChunks } = require('../utils');

const Groq = require("groq-sdk");
const groq = new Groq({
	apiKey: process.env.GROQ_TOKEN
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dylan-cowboy')
		.setDescription('Dylan le cow boy!'),
	async execute(interaction) {
		const requestBody = {
			messages: [
				{
					role: 'system',
					content: `Je finis toutes mes phrases par BANG BANG`,
				},
				{
					role: 'user',
					content: `Je veux une histoire sur Jesse le meilleur Cowboy du far ouest qui est a l'EPSI`,
				},
			],
			model: 'mixtral-8x7b-32768',
		};

		try {
			await interaction.reply('Génération en cours...');

			const chat = await groq.chat.completions.create(requestBody);
			const message = chat.choices[0]?.message?.content;
	
			await sendMessageInChunks(interaction, message);
		} catch (e) {
			console.log(e);
			await interaction.reply(`${e}`);
		}
	},
};