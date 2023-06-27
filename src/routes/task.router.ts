import express, { Request, Response } from 'express';

import Task, { TaskInterface } from '../models/task.model';
import { processTask } from "../utils/task.utils"

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    const prompt = req.body.prompt;
    const command = req.body.command ? req.body.command : 'imagine';
    const newTask: TaskInterface = new Task({
        prompt: prompt,
        command: command,
        status: "waiting",
    });

    await newTask.save();
    processTask(newTask);
    res.json(newTask);
});

router.get("/:uuid", async (req: Request, res: Response) => {
    const uuid = req.params.uuid;
    const task: any = await Task.findOne({ uuid }).lean();

    if (!task) {
        return res.status(404).json({ message: "Not found" });
    }

    if (task.result) {
        const { uri } = task.result
        task.uri = uri;
        delete task.result;
    }
    return res.json(task);
});

export default router;