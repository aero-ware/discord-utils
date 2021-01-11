import { Message, MessageReaction, User } from "discord.js";

async function getReply(
  message: Message,
  options?: {
    time?: number;
    user?: User;
    keywords?: string[];
    regex?: RegExp;
  }
) {
  if (options) {
    if (options.time) {
      if (typeof options.time !== "number" || options.time < 0)
        throw new Error("Time must be a non-negative number or zero.");
    }
    if (options.user) {
    }
    if (options.keywords) {
      if (!Array.isArray(options.keywords))
        throw new Error("Keywords must be an array of strings.");
    }
  }

  const time = options?.time || 30000;
  const user = options?.user || message.author;
  const keywords: string[] = options?.keywords || [];

  return (
    await message.channel.awaitMessages(
      (msg: Message) =>
        msg.author.id === user.id &&
        (keywords.length === 0 ||
          keywords.includes(msg.content.toLowerCase())) &&
        (!options || !options.regex || options.regex.test(msg.content)),
      {
        max: 1,
        time: time,
      }
    )
  ).first();
}

async function getReaction(
  message: Message,
  reactions: string[],
  options?: {
    time?: number;
    user?: User;
  }
) {
  if (options) {
    if (options.time) {
      if (typeof options.time !== "number" || options.time < 0)
        throw new Error("Time must be a non-negative number or zero.");
    }
    if (options.user) {
    }
  }

  const time = options?.time || 30000;
  const user = options?.user || message.author;

  return (
    await message.awaitReactions(
      (reaction: MessageReaction, usr: User) =>
        usr.id === user.id && reactions.includes(reaction.emoji.name),
      {
        max: 1,
        time: time,
      }
    )
  ).first();
}

export { getReply, getReaction };
