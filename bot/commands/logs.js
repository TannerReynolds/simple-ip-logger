module.exports = {
    command: 'logs',
    description: 'Displays recent visitors',
    syntax: '{PREFIX}logs',
    execute: async (_this, msg) => {
        const visitors = _this.db.get('visitors').value();
        if (visitors === undefined) {
            msg.channel.createMessage('Your site has no visitors');
        } else {
            const recent = visitors.map(e => e.date).sort().reverse();
            const visitorsCollection = [];
            let maximum;
            recent.length > 10
                ? maximum = 10
                : maximum = recent.length;
            for (let i = 0; i < maximum; i++) {
                const targetData = _this.db.get('visitors').find({ date: recent[i] }).value();
                visitorsCollection.push(`[Case ${targetData.case}]\n[IP]: ${targetData.ip}\n[UA]: ${targetData.userAgent.match(/.{1,30}/g)[0]}`);
                if (i + 1 >= maximum) {
                    msg.channel.createMessage(`**IP Logger Logs**\n\`\`\`ini\n${visitorsCollection.join('\n\n')}\n\`\`\``);
                }
            }
        }
    },
};
