const { WebClient, ErrorCode } = require('@slack/web-api');
//const dotenv = require('dotenv');
//dotenv.config();

const web = new WebClient(process.env.BOT_TOKEN);

const coffeebot = async (event) => {
  const { user_id: botId } = await web.auth.test();
  console.log(`> This bot ID is ${botId}`);

  const { channels } = await web.conversations.list();
  const { id: coffeeChannelId } = channels.find(({ name }) => name === process.env.CHANNEL_NAME);
  console.log(`> Channel ID for coffee channel is ${coffeeChannelId}`);

  const { members } = await web.conversations.members({ channel: coffeeChannelId });
  const allMembers = members.filter(memberId => memberId !== botId);
  const shuffledMembers = [...allMembers].sort(() => Math.random() - 0.5);

  const pairedMembers = shuffledMembers.map((_, index) => {
    if (index < shuffledMembers.length / 2) {
      const pair = shuffledMembers.slice(index*2, ((index*2)+2));
      return pair.length === 2 ? pair : undefined;
    }
  }).filter(Boolean);
  console.log(`> Generated ${pairedMembers.length} pairs of members`);

  for (const pair of pairedMembers) {
    console.log(`>>>>> Trying to pair ${pair.toString()} ...`);
    const { channel: privateChannel } = await web.conversations.open({
      users: pair.toString(),
    });
    console.log(`>>>>> Paired ${pair.toString()} in ${privateChannel.id}`);

    console.log(`>>>>> Sending message to ${privateChannel.id} ...`);
    await web.chat.postMessage({
      text: `Hi <@${pair[0]}> and <@${pair[1]}>, you are paired up for coffee this week!`,
      channel: privateChannel.id,
    });
    console.log(`>>>>> Sent message to ${privateChannel.id}`);
  };

  console.log(`> Completed pairing of ${pairedMembers.length} pairs of members`);

  await web.chat.postMessage({
    text: 'I have paired up this everyone for coffee this week!',
    channel: coffeeChannelId,
  });

  console.log('> Messaged coffee channel');

  const response = {
    statusCode: 200,
    body: {
      botId,
      coffeeChannelId,
      pairedMembers,
    },
  };
  return response;
};

//coffeebot();

exports.handler = coffeebot;
