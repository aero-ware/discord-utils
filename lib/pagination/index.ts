import { Message, MessageEmbed, MessageReaction, User } from "discord.js";

/**
 * Produces a simple pagination feature.
 * @param message The message object.
 * @param pages Pages for the pagination
 * @param options Optional options.
 */
export default async function paginate(
  message: Message,
  pages: MessageEmbed[],
  options?: {
    startingPage?: number;
    time?: number;
    fastForwardAndRewind?: {
      time?: number;
      rewindPrompt?: string;
      fastForwardPrompt?: string;
    };
    goTo?: {
      time?: number;
      prompt?: string;
    };
  }
) {
  if (options) {
    if (options.startingPage) {
      if (
        typeof options.startingPage !== "number" ||
        !Number.isInteger(options.startingPage)
      )
        throw new Error("Starting page index must be an integer.");
      if (options.startingPage < 0)
        throw new Error("Starting page index must be non-negative or zero.");
      if (options.startingPage > pages.length - 1)
        throw new Error(
          "Starting page index is greater than the length of the pages."
        );
    }

    if (options.time) {
      if (typeof options.startingPage !== "number")
        throw new Error("Starting page index must be a non-negative number.");
      if (options.time < 0) throw new Error("Time must be non-negative.");
    }

    if (options.fastForwardAndRewind) {
      if (typeof options.fastForwardAndRewind !== "object")
        throw new Error(
          "The 'fastForwardAndRewind' option should be an object."
        );

      if (options.fastForwardAndRewind.time) {
        if (typeof options.startingPage !== "number")
          throw new Error(
            "Fast forward and rewind time must be a non-negative number."
          );
        if (options.fastForwardAndRewind.time < 0)
          throw new Error("Fast forward and rewind time must be non-negative.");
      }

      if (options.fastForwardAndRewind.fastForwardPrompt) {
        if (
          typeof options.fastForwardAndRewind.fastForwardPrompt !== "string" ||
          !options.fastForwardAndRewind.fastForwardPrompt.length
        )
          throw new Error("Prompt should be a string that is not empty.");
      }

      if (options.fastForwardAndRewind.rewindPrompt) {
        if (
          typeof options.fastForwardAndRewind.rewindPrompt !== "string" ||
          !options.fastForwardAndRewind.rewindPrompt.length
        )
          throw new Error("Prompt should be a string that is not empty.");
      }
    }

    if (options.goTo) {
      if (options.goTo.prompt) {
        if (
          typeof options.goTo.prompt !== "string" ||
          !options.goTo.prompt.length
        )
          throw new Error("Prompt should be a string that is not empty.");

        if (typeof options.goTo.time !== "number" || options.goTo.time < 0)
          throw new Error("Time must be non-negative number.");
      }
    }
  }

  let pageNumber = options?.startingPage || 0;

  let page = pages[pageNumber];

  const pagination = await message.channel.send(page);

  const emojis = options?.fastForwardAndRewind
    ? ["⏪", "◀️", "⏹", "▶️", "⏩"]
    : ["◀️", "⏹", "▶️"];

  if (options?.goTo) emojis.push("🔢");

  if (pages.length > 1) Promise.all(emojis.map((e) => pagination.react(e)));
  pagination.react(emojis[options?.fastForwardAndRewind ? 2 : 1]);

  const collector = pagination.createReactionCollector(
    (reaction: MessageReaction, user: User) =>
      emojis.includes(reaction.emoji.name) && user.id === message.author.id,
    {
      dispose: true,
      time: options?.time || 60000,
    }
  );

  const handleReaction = async (reaction: MessageReaction) => {
    switch (reaction.emoji.name) {
      case "⏪":
        if (!options?.fastForwardAndRewind) return;
        const rwp = await message.channel.send(
          options.fastForwardAndRewind.rewindPrompt ||
            "How many pages would you like to go back?"
        );
        const rw = parseInt(
          (
            await message.channel.awaitMessages(
              (msg: Message) => {
                if (msg.author.id === message.author.id) msg.delete();
                return msg.author.id === message.author.id;
              },
              {
                max: 1,
                time: options.fastForwardAndRewind.time || 10000,
              }
            )
          ).first()?.content || ""
        );

        if (rw) {
          pageNumber -= rw;
          if (pageNumber < 1) pageNumber = 1;
        }
        rwp.delete();
        return await pagination.edit(pages[pageNumber]);
      case "◀️":
        pageNumber--;
        if (pageNumber < 1) {
          pageNumber = 1;
          return;
        }
        return await pagination.edit(pages[pageNumber]);
      case "⏹":
        return collector.stop();
      case "▶️":
        pageNumber++;
        if (pageNumber > pages.length) {
          pageNumber = pages.length;
          return;
        }
        return await pagination.edit(pages[pageNumber]);
      case "⏩":
        if (!options?.fastForwardAndRewind) return;
        const ffp = await message.channel.send(
          options.fastForwardAndRewind.fastForwardPrompt ||
            "How many pages would you like to go forward?"
        );
        const ff = parseInt(
          (
            await message.channel.awaitMessages(
              (msg: Message) => {
                if (msg.author.id === message.author.id) msg.delete();
                return msg.author.id === message.author.id;
              },
              {
                max: 1,
                time: options.fastForwardAndRewind.time || 10000,
              }
            )
          ).first()?.content || ""
        );

        if (ff) {
          pageNumber += ff;
          if (pageNumber > pages.length - 1) pageNumber = pages.length - 1;
        }
        ffp.delete();
        return await pagination.edit(pages[pageNumber]);
      case "🔢":
        if (!options?.goTo) return;

        const gtp = await message.channel.send(
          options.goTo.prompt || "Which page would you like to go to?"
        );

        const gt = parseInt(
          (
            await message.channel.awaitMessages(
              (msg: Message) => {
                if (msg.author.id === message.author.id) msg.delete();
                return msg.author.id === message.author.id;
              },
              {
                max: 1,
                time: options.goTo.time || 10000,
              }
            )
          ).first()?.content || ""
        );

        if (gt) {
          pageNumber = gt - 1;
          if (pageNumber > pages.length - 1) pageNumber = pages.length - 1;
          if (pageNumber < 0) pageNumber = 0;
        }
        gtp.delete();
        return await pagination.edit(pages[pageNumber]);
    }
  };

  collector.on("collect", handleReaction);
  collector.on("remove", handleReaction);

  collector.on("end", () => {
    pagination.delete();
  });
}
