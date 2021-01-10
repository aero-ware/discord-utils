import { Client, Collection, Message, MessageEmbed } from "discord.js";
import { config as dotenv } from "dotenv";
import utils from "./lib";

dotenv();

const client = new Client();
const prefix = "!";
const commands = new Collection<string, Function>();

command("p", (message, args, client) => {
  utils.paginate(
    message,
    new Array(10)
      .fill(null)
      .map((_, i) => new MessageEmbed().setTitle(`Page ${i + 1}`)),
    {
      fastForwardAndRewind: {},
      goTo: {},
    }
  );
});

client.on("ready", () => console.log("Ready!"));

client.on("message", (message) => {
  if (
    message.author.bot ||
    !message.guild ||
    !message.content.startsWith(prefix)
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()!.toLowerCase();

  const c = commands.get(command);

  if (!c) return;

  c(message, args, client);
});

client.login(process.env.TOKEN);

function command(
  name: string,
  callback: (message: Message, args: string[], client: Client) => any
) {
  commands.set(name, callback);
}
