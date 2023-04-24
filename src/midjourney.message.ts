import axios from 'axios';

export type Message = {
    id: string;
    uri: string;
    hash: string;
    content: string;
}

export class MidjourneyMessage {
    constructor(public ChannelId: string, protected SalaiToken: string, public Limit = 50, public maxWait = 100) {
        console.log("MidjourneyMessage constructor")
    }
    async FilterMessages(prompt: string, loading?: (uri: string) => void) {
        const data = await this.RetrieveMessages(this.Limit)
        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            if (item.author.id === "936929561302675456" && item.content.includes(`**${prompt}`)) {
                console.log(JSON.stringify(item))
                if (item.attachments.length === 0) {
                    console.log("no attachment")
                    break
                }

                const imageUrl = item.attachments[0].url
                if (!imageUrl.endsWith(".png")) {
                    loading && loading(imageUrl)
                    break
                }
                const msg: Message = {
                    id: item.id,
                    uri: imageUrl,
                    hash: this.UriToHash(imageUrl),
                    content: item.content
                }
                return msg
            }
        }
        return null
    }
    protected UriToHash(uri: string) {
        return uri.split('_').pop()?.split('.')[0] ?? '';
    }
    async WaitMessage(prompt: string, loading?: (uri: string) => void) {
        for (let i = 0; i < this.maxWait; i++) {
            const msg = await this.FilterMessages(prompt, loading)
            if (msg !== null) {
                return msg
            }
            await this.Wait(1000 * 2)
        }
    }
    Wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async RetrieveMessages(limit = 50) {
        const headers = { 'authorization': this.SalaiToken };
        const response = await axios.get(`https://discord.com/api/v10/channels/${this.ChannelId}/messages?limit=${limit}`, { headers: headers });
        return response.data;
    }
}