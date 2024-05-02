async function sendMessageInChunks(interaction, message, maxLength = 2000) {
  const lines = message.split('\n');
  const chunks = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lastChunk = chunks[chunks.length - 1];

    if (lastChunk.length + line.length + 1 <= maxLength) {
      chunks[chunks.length - 1] += '\n' + line;
    } else {
      chunks.push(line);
    }
  }

  await interaction.editReply(chunks[0]);

  for (let i = 1; i < chunks.length; i++) {
    await interaction.followUp(chunks[i]);
  }
}

module.exports = { sendMessageInChunks };