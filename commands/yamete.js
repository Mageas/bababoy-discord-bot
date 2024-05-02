const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yamete")
    .setDescription("YAMETE KUDASAI!"),

  async execute(interaction) {
    try {
      const response = await fetch(`https://animechan.xyz/api/random`);
      const data = await response.json();

			const imageResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${data.anime}&limit=1`)
			const imageData = await imageResponse.json();

      if (response.ok) {
				const quoteEmbed = new EmbedBuilder()
					.setColor('#0099ff')
					.setTitle(`**${data.anime}**`)
					.setDescription(`*${data.quote}*\n\n__*${data.character}*__`)
					.setImage(imageData.data[0].images.jpg.image_url)
					.setTimestamp()
					.setFooter({ text: 'YAMETE', iconURL: 'https://i1.sndcdn.com/artworks-qISH1u6OWVPz1WnJ-0JxJHg-t500x500.jpg' });

        await interaction.reply({ embeds: [quoteEmbed] });
      } else {
				const errorEmbed = new EmbedBuilder()
					.setColor('#FF0000')
					.setTitle('Erreur de recherche de ville')
					.setDescription('La ville spécifiée n\'a pas été trouvée.')
					.addFields(
						{ name: 'Code d\'erreur', value: data.cod },
						{ name: 'Message d\'erreur', value: data.message },
						{ name: 'Causes possibles', value: '- Orthographe incorrecte de la ville\n- Ville non prise en charge par l\'API' }
					)
					.setTimestamp();

					await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (e) {
			console.log(e)

      const errorEmbed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('Erreur lors de la récupération des données YAMETE')
				.setDescription('Une erreur s\'est produite lors de la récupération des données YAMETE.')
				.setTimestamp();

				await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
