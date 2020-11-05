const { WebClient } = require('@slack/web-api');
const dotenv = require('dotenv');

dotenv.config();

const botToken = process.env.BOT_TOKEN;
const web = new WebClient(botToken);

(async () => {
  const { user_id: botId } = await web.auth.test();

  const { channels } = await web.conversations.list();
  const { id: channelId } = channels.find(({ name }) => name === 'slackbot-test');

  const { members } = await web.conversations.members({ channel: channelId });
  const allMembers = members.filter(memberId => memberId !== botId);
  const shuffledMembers = [...allMembers].sort(() => Math.random() - 0.5);

  const pairedMembers = shuffledMembers.map((_, index) => {
    if (index < shuffledMembers.length / 2) {
      const pair = shuffledMembers.slice(index*2, ((index*2)+2));
      return pair.length === 2 ? pair : undefined;
    }
  }).filter(Boolean);

  pairedMembers.forEach(async pair => {
    const { channel:privateChannel } = await web.conversations.open({
      users: pair.toString(),
    });
    console.log('pairing', pair.toString(), 'in', privateChannel.id);
    web.chat.postMessage({
      text: `Hi <@${pair[0]}> and <@${pair[1]}>, you are paired up for coffee this week!`,
      channel: privateChannel.id,
    });
  });

  web.chat.postMessage({
    text: 'I have paired up this everyone for coffee this week!',
    channel: channelId,
  });
})();
