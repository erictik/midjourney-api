import { model } from "mongoose";
import { BaseDocumentInterface, BaseDocumentSchema } from "./base.model";
import { v4 as uuid4 } from 'uuid';

export interface TaskInterface extends BaseDocumentInterface {
    uuid?: string,
    prompt: string,
    command: string,
    result: Object,
    status: string,
    error: string,
    message: string,
    percentage?: string,
}

const TaskSchema = new BaseDocumentSchema(
    {
        uuid: {
            type: String,
        },
        prompt: {
            type: String,
            trim: true,
        },
        command: {
            type: String,
            required: true,
            default: "imagine",
            enum: ["imagine", "describe", "variation", "upscale"],
        },
        result: {
            type: Object,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            default: "initialized",
            enum: ["initialized", "waiting", "finished"],
        },
        error: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
        },
        percentage: {
            type: String,
            trim: true,
        },
    },
    null,
);

TaskSchema.pre('save', async function (next) { // this line
    const task = this;
    if (task.$isEmpty('uuid')) {
        task.uuid = uuid4();
    }
    next();
});

const Task = model<TaskInterface>("Task", TaskSchema);
export default Task;
