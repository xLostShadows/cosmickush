import { SlashCommandBuilder } from 'discord.js'
export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Ping!'),
  async execute(interaction) {
    try {
      await interaction.reply('Pong!')
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true
        })
      } else {
        await interaction.reply({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true
        })
      }
    }
  }
}