const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the weather!")
    .addStringOption((option) =>
      option
        .setName("city")
        .setDescription("The city to get the weather for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("state")
        .setDescription("The state to get the weather for")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("country")
        .setDescription("The country to get the weather for")
        .setRequired(false)
    ),

  async execute(interaction) {
    const city = interaction.options.getString("city");
    const state = interaction.options.getString("state");
    const country = interaction.options.getString("country");

    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}`;
    if (state) {
      apiUrl += `,${state}`;
    }
    if (country) {
      apiUrl += `,${country}`;
    }
    apiUrl += `&appid=${process.env.OPEN_WEATHER_TOKEN}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        const weatherEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`Météo à ${data.name}, ${data.sys.country}`)
					.setImage(`https://media.gqmagazine.fr/photos/5d8883ff1c594a0008b58583/master/w_1600,c_limit/unnamed-1.jpg`)
          .setDescription(
						'https://www.youtube.com/watch?v=mRtKGvIukn0\n\n' +
            data.weather
              .map((weather) => `${weather.main}: ${weather.description}`)
              .join("\n")
          )
          .setThumbnail(
            `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
          )
					.addFields(
						{
							name: "🌡️ Température",
							value: `${Math.round(data.main.temp)}°C`,
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "💧 Humidité",
							value: `${data.main.humidity}%`,
							inline: true,
						},
						{
							name: "💨 Vitesse du vent",
							value: `${data.wind.speed} m/s`,
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "🌤️ Prévisions",
							value: data.weather[0].main,
							inline: true,
						},
						{
							name: "📉 Température min",
							value: `${Math.round(data.main.temp_min)}°C`,
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "📈 Température max",
							value: `${Math.round(data.main.temp_max)}°C`,
							inline: true,
						},
						{
							name: "☁️ Nuageux",
							value: `${data.clouds.all}%`,
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "🌡️ Press atmosphérique",
							value: `${data.main.pressure} hPa`,
							inline: true,
						},
						{
							name: "🌅 Lever du soleil",
							value: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "🌇 Coucher du soleil",
							value: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
							inline: true,
						},
						{
							name: "📍 Latitude",
							value: data.coord.lat.toString(),
							inline: true,
						},
						{
							name: '\u200b',
							value: '\u200b',
							inline: true,
						},
						{
							name: "📍 Longitude",
							value: data.coord.lon.toString(),
							inline: true,
						}
					)
          .setTimestamp();

        await interaction.reply({ embeds: [weatherEmbed] });
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
				.setTitle('Erreur lors de la récupération des données météorologiques')
				.setDescription('Une erreur s\'est produite lors de la récupération des données météorologiques.')
				.setTimestamp();

				await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
