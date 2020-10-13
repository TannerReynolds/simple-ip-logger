module.exports = {
    command: 'case',
    description: 'Displays specific visitor information',
    syntax: '{PREFIX}case',
    execute: async (_this, msg, args) => {
        if (!args.join(' ')) return msg.channel.createMessage('No arguments were given');
        const caseNumber = args.join(' ');
        const ipInfo = _this.db.get('visitors').find({ case: caseNumber }).value();
        if (ipInfo === undefined) {
            msg.channel.createMessage('This is not a valid case');
        } else {
            msg.channel.createMessage(`**Showing Information For Case ${caseNumber}**\nIP: \`${ipInfo.ip}\`\nCountry: \`${ipInfo.country}\`\nCity: \`${ipInfo.city}\`\nPostal Code: \`${ipInfo.postCode}\`\nOrganization: \`${ipInfo.org}\`\nLatitude: \`${ipInfo.lat}\`\nLongitude: \`${ipInfo.lon}\``);
        }
    },
};
