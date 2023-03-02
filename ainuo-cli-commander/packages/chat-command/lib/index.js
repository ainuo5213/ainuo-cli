import Command from "@ainuo-utils/command";
import {
    ChatGpt,
    clearChatCache, getApiKey, log, makeInput, makePassword, printErrorLog, saveApiKey,
} from "@ainuo-utils/utils";
import ora from "ora";

class ChatCommand extends Command {
    chatClient = null

    get command() {
        return "chat";
    }

    get options() {
        return [['-c --clear', '清除chat缓存', false]];
    }

    get description() {
        return "chat with chat-gpt";
    }

    async action(args) {
        if (args.clear) {
            clearChatCache()
        }
        const apiKey = await this.getChatApiKey()
        this.chatClient = ChatGpt.of(apiKey)
        await this.loopQuestion()
    }

    async loopQuestion() {
        const question = await makeInput({
            message: '你想要聊点什么呢？',
            required: true,
            validator(val) {
                return val ? true : '你想要聊点什么呢'
            }
        })
        const spinner = ora('正在向chat-gpt提问：', question)
        try {
            spinner.start()
            const result = await this.chatClient.send(question)
            spinner.stop()
            log.success(result)
            await this.loopQuestion()
        } catch (e) {
            console.log(e)
            printErrorLog(e)
            spinner.stop()
        }
    }

    async getChatApiKey() {
        let apiKey = getApiKey()
        if (!apiKey) {
            apiKey = await makePassword({
                message: '请输入chat-gpt申请的api-key',
                required: true,
                validator(val) {
                    return val ? true : '请输入chat-gpt申请的api-key'
                }
            })
            saveApiKey(apiKey)
        }
        return apiKey
    }
}

export default function Chatter(program) {
    return new ChatCommand(program);
}
