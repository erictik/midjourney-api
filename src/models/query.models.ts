import { model } from "mongoose";
import { BaseDocumentInterface, BaseDocumentSchema } from "./base.model";
import { v4 as uuid4 } from 'uuid';

export interface QueryInterface extends BaseDocumentInterface {
    uuid: string,
    query: string,
    result: string,
    status: string,
    error: string,
    message: string,
}

const QuerySchema = new BaseDocumentSchema(
    {
        uuid: {
            type: String,
            required: true,
        },
        query: {
            type: String,
            trim: true,
        },
        result: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            default: "initialized",
            enum: ["initialized", "finished"],
        },
        error: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
        },
    },
    null,
);

QuerySchema.pre('save', async function (next) { // this line
    const query = this;
    query.uuid = uuid4();
    next();
});

const Query = model<QueryInterface>("Query", QuerySchema);
export default Query;
