const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data : new SlashCommandBuilder()
		.setName('modlog')
		.setDescription('Set or Clear Mod Log')

		.addSubcommand(subcommand => subcommand
      .setName('set')
      .setDescription('Select a channel to send moderation actions')
			.addChannelOption(channel => channel
        .setName('channel')
        .setDescription('Select a channel to send moderation actions')
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.AnnouncementThread, ChannelType.PrivateThread, ChannelType.GuildForum)
        .setRequired(true)))
		.addSubcommand(subcommand => subcommand
      .setName('clear')
      .setDescription('Clears the modlog channel')),

	usage: '[set <channel> | clear]',

	async execute(interaction) {
    const inputs = interaction.options;
    if (inputs.getChannel('channel')) {
			channel = inputs.getChannel('channel').id;
			const channelStr = channel.toString();
			const updateModLog = { modlog_channel_id: channelStr };
			interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, updateModLog);
			interaction.reply('My moderation actions will be sent to <#'+ channel +'>')
    }
		else if (inputs._subcommand === 'clear') {
			const buttons = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('modlog confirm').setLabel('Confirm').setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('modlog cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
				);
			await interaction.reply({ content: 'Are you sure you want to deactivate the modlog?', components: [buttons] });
			return;
		}
		else {
			return interaction.reply('Something broke 😬');
		}
  },
	buttons : {
		'confirm' : async function confirm(interaction) {
			const updateModLog = { modlog_channel_id: 0 };
			interaction.client.dbFunctions.updateGuildData('SETTINGS', interaction.guild.id, updateModLog);
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.channel.send('✅ modlog has been deactivated');
		},
		'cancel' : async function cancel(interaction) {
			const message = await interaction.message.fetch();
			message.delete();
			return interaction.channel.send('❌ Cancelled');
		},
	},
};
