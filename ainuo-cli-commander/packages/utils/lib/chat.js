import path from "node:path";
import {homedir} from "node:os";
import {TEMP_CHAT_API_KEY, TEMP_HOME_DIR} from "./cache.js";
import { getCachedConfiguration } from './path.js'
import {pathExistsSync} from "path-exists";
import fse from "fs-extra";
import { Configuration, OpenAIApi } from 'openai'

export const getCachedChatAPIPath = getCachedConfiguration(() => path.join(homedir(), TEMP_HOME_DIR, TEMP_CHAT_API_KEY))

export function getApiKey() {
    const apiKeyPath = getCachedChatAPIPath();
    if (pathExistsSync(apiKeyPath)) {
        return fse.readFileSync(apiKeyPath).toString();
    }
    return "";
}

export function saveApiKey(apiKey) {
    const apiKeyPath = getCachedChatAPIPath();
    fse.writeFileSync(apiKeyPath, apiKey)
}

export function clearChatCache() {
    const apiKeyPath = getCachedChatAPIPath();
    fse.removeSync(apiKeyPath)
}

export class ChatGpt {
    model = "text-davinci-003"
    constructor(configuration) {
        const openai = new OpenAIApi(configuration)
        this.client = openai
    }
    static of(apiKey) {
        const configuration = new Configuration({
            apiKey: apiKey,
        });
        return new ChatGpt(configuration);
    }

    async send(question) {
        const completion = await this.client.createCompletion({
            model: this.model,
            prompt: question,
            max_tokens: 3072
        });
        return completion.data.choices[0].text
    }
}
