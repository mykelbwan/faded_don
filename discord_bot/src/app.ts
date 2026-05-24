import "dotenv/config";

import axios from "axios";
import { Client, Events, GatewayIntentBits, Message } from "discord.js";

type DonResponse = {
    response: string;
};

const discordToken = requireEnv("DISCORD_API_KEY");
const donApiUrl = requireEnv("DON_API_URL");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !client.user) {
        return;
    }

    const mentionTriggered = message.mentions.users.has(client.user.id);
    const replyContext = await getReplyContext(message);

    if (!mentionTriggered && !replyContext) {
        return;
    }

    const donMessage = buildDonMessage(message, client.user.id, replyContext);
    if (!donMessage) {
        return;
    }

    try {
        const response = await axios.post<DonResponse>(
            donApiUrl,
            {
                username: message.author.username ?? message.author.globalName,
                message: donMessage,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        const content = response.data.response?.trim();
        if (!content) {
            return;
        }

        await message.reply({
            content,
            allowedMentions: {
                repliedUser: false,
            },
        });
    } catch (error) {
        console.error("Failed to handle Discord message", error);
    }
});

void client.login(discordToken);

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

async function getReplyContext(message: Message): Promise<Message | null> {
    if (!message.reference?.messageId) {
        return null;
    }

    try {
        const referencedMessage = await message.fetchReference();
        if (
            !referencedMessage.author.bot ||
            referencedMessage.author.id !== client.user?.id
        ) {
            return null;
        }

        return referencedMessage;
    } catch (error) {
        console.error("Failed to fetch referenced Discord message", error);
        return null;
    }
}

function buildDonMessage(
    message: Message,
    botUserId: string,
    replyContext: Message | null,
): string {
    if (replyContext) {
        return [
            "Trigger: reply_to_bot",
            `Bot previous message: ${normalizeContent(replyContext.content)}`,
            `User reply: ${normalizeContent(message.content)}`,
        ].join("\n");
    }

    const cleanedContent = normalizeContent(
        stripBotMention(message.content, botUserId),
    );
    if (!cleanedContent) {
        return "";
    }

    return ["Trigger: mention", `User message: ${cleanedContent}`].join("\n");
}

function stripBotMention(content: string, botUserId: string): string {
    return content
        .replaceAll(`<@${botUserId}>`, "")
        .replaceAll(`<@!${botUserId}>`, "")
        .trim();
}

function normalizeContent(content: string): string {
    return content.replace(/\s+/g, " ").trim();
}
