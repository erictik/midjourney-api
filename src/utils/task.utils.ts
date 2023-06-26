import { TaskInterface } from "../models/task.model";
import { Midjourney } from "..";

export const processTask = async (task: TaskInterface) => {
    const client = new Midjourney({
        ServerId: <string>process.env.SERVER_ID,
        ChannelId: <string>process.env.CHANNEL_ID,
        SalaiToken: <string>process.env.SALAI_TOKEN,
        HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
        Debug: true,
        Ws: true,
    });

    const update = (msg: any) => {
        const re_pat = /(\d+%)/;
        const percentage = msg.d.content.match(re_pat);
        if (percentage) {
            task.percentage = percentage[0];
            task.save();
        }
    }

    await client.Connect(update);
    const Imagine = await client.Imagine(
        task.prompt,
        (uri: string, progress: string) => {
            console.log("Imagine.loading", uri, "progress", progress);
        }
    ).catch((err) => {
        console.error(`imagine error ${err}`)
        return;
    });

    task.result = Imagine ? Imagine : {};
    task.status = "finished";

    await task.save();
};

