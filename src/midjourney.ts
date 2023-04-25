import axios from 'axios';
import { MidjourneyMessage } from './midjourney.message';

export class Midjourney extends MidjourneyMessage {
    constructor(public ServerId: string, public ChannelId: string, protected SalaiToken: string, public debug = false) {
        super(ChannelId, SalaiToken, debug)
        this.log("Midjourney constructor")
    }

    async Imagine(prompt: string, loading?: (uri: string) => void) {
        const httpStatus = await this.ImagineApi(prompt)
        if (httpStatus !== 204) {
            throw new Error(`ImagineApi failed with status ${httpStatus}`)
        }
        this.log(`await generate image`)
        return await this.WaitMessage(prompt, loading)
    }

    async ImagineApi(prompt: string) {
        const payload = {
            type: 2,
            application_id: '936929561302675456',
            guild_id: this.ServerId,
            channel_id: this.ChannelId,
            session_id: '2fb980f65e5c9a77c96ca01f2c242cf6',
            data: {
                version: '1077969938624553050',
                id: '938956540159881230',
                name: 'imagine',
                type: 1,
                options: [
                    {
                        type: 3,
                        name: 'prompt',
                        value: prompt,
                    },
                ],
                application_command: {
                    id: '938956540159881230',
                    application_id: '936929561302675456',
                    version: '1077969938624553050',
                    default_permission: true,
                    default_member_permissions: null,
                    type: 1,
                    nsfw: false,
                    name: 'imagine',
                    description: 'Create images with Midjourney',
                    dm_permission: true,
                    options: [
                        {
                            type: 3,
                            name: 'prompt',
                            description: 'The prompt to imagine',
                            required: true,
                        },
                    ],
                },
                attachments: [],
            },
        };

        const headers = { authorization: this.SalaiToken };
        const response = await axios.post('https://discord.com/api/v9/interactions', payload, {
            headers,
        });

        return response.status;
    }

    async Variation(content: string, index: number, msgId: string, msgHash: string, loading?: (uri: string) => void) {
        // index is 1-4
        if (index < 1 || index > 4) {
            throw new Error(`Variation index must be between 1 and 4, got ${index}`)
        }
        const httpStatus = await this.VariationApi(index, msgId, msgHash)
        if (httpStatus !== 204) {
            throw new Error(`VariationApi failed with status ${httpStatus}`)
        }
        return await this.WaitOptionMessage(content, `Variations`, loading)

    }
    async VariationApi(index: number, messageId: string, messageHash: string) {
        const payload = {
            "type": 3,
            "guild_id": this.ServerId,
            "channel_id": this.ChannelId,
            "message_flags": 0,
            "message_id": messageId,
            "application_id": "936929561302675456",
            "session_id": "1f3dbdf09efdf93d81a3a6420882c92c",
            "data": {
                "component_type": 2,
                "custom_id": `MJ::JOB::variation::${index}::${messageHash}`
            }
        };
        const headers = { authorization: this.SalaiToken };
        const response = await axios.post('https://discord.com/api/v9/interactions', payload, {
            headers,
        });
        return response.status;
    }
    //FIXME this is not working
    async RemixModelApi(content: string, index: number, messageId: string, messageHash: string) {
        const payload = {
            "type": 5,
            "application_id": "936929561302675456",
            "channel_id": this.ChannelId,
            "guild_id": this.ServerId,
            "data": {
                "id": "1100105238322618488",
                "custom_id": `MJ::RemixModal::${messageHash}::${index}`,
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 4,
                                "custom_id": "MJ::RemixModal::new_prompt",
                                "value": content,
                            }
                        ]
                    }
                ]
            },
            "session_id": "ec6524c8d2926e285a8232f7ed1ced98",
        }
        const headers = { authorization: this.SalaiToken };
        const response = await axios.post('https://discord.com/api/v9/interactions', payload, {
            headers,
        });
        return response.status;
    }



    async Upscale(content: string, index: number, msgId: string, msgHash: string, loading?: (uri: string) => void) {
        // index is 1-4
        if (index < 1 || index > 4) {
            throw new Error(`Variation index must be between 1 and 4, got ${index}`)
        }
        const httpStatus = await this.UpscaleApi(index, msgId, msgHash)
        if (httpStatus !== 204) {
            throw new Error(`VariationApi failed with status ${httpStatus}`)
        }
        return await this.WaitOptionMessage(content, `Upscaled`, loading)
    }

    async UpscaleApi(index: number, messageId: string, messageHash: string) {
        const payload = {
            type: 3,
            guild_id: this.ServerId,
            channel_id: this.ChannelId,
            message_flags: 0,
            message_id: messageId,
            application_id: "936929561302675456",
            session_id: "ec6524c8d2926e285a8232f7ed1ced98",
            data: {
                component_type: 2,
                custom_id: `MJ::JOB::upsample::${index}::${messageHash}`
            }
        };

        const headers = { authorization: this.SalaiToken };
        const response = await axios.post("https://discord.com/api/v9/interactions", payload, { headers });
        return response.status;
    }

}