const { parse } = require('node-html-parser');

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deemix")
    .setDescription("Deezer ARL!"),

  async execute(interaction) {
    try {
      const response = await fetch("https://rentry.org/firehawk52");
      const text = await response.text();
      
      const html = parse(text);
    
      const rows = html.querySelectorAll('.ntable-wrapper')[1].querySelector('tbody').querySelectorAll('tr');
      
      const embeds = [];
      for (const row of rows) {
        const tdElements = row.querySelectorAll('td');
        const image = tdElements[0].querySelector('img').getAttribute('src');
        const country = tdElements[0].querySelector('img').getAttribute('alt');
        const plan = tdElements[1].text;
        const expiry = tdElements[2].text;
        const arl = tdElements[3].text;
    
        const embed = new EmbedBuilder()
          .addFields(
            { name: 'Plan', value: plan, inline: true },
            { name: 'Expiry', value: expiry, inline: true },
            { name: 'ARL', value: arl }
          )
          .setFooter({ text: country, iconURL: image });

        embeds.push(embed);
      }

      const embedGroups = [];
      for (let i = 0; i < embeds.length; i += 10) {
        embedGroups.push(embeds.slice(i, i + 10));
      }

      await interaction.reply("Voici les comptes Deezer ARL disponibles:");
      for (const group of embedGroups) {
        await interaction.followUp({ embeds: group });
      }
    } catch (e) {
      console.log(e);
      await interaction.reply(`${e}`);
    }
  },
};
