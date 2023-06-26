import { Document, Schema } from "mongoose";

export interface BaseDocumentInterface extends Document {
    deleted?: boolean;
    active?: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class BaseDocumentSchema extends Schema {
    constructor(
        schemaObject: any,
        schemaOptions: any,
        hiddenProperties?: string[]
    ) {
        super(
            {
                deleted: {
                    type: Boolean,
                    required: true,
                    default: false,
                },
                active: {
                    type: Boolean,
                    required: true,
                    default: true,
                },
                createdBy: {
                    type: Schema.Types.ObjectId,
                    default: null,
                    ref: "User",
                },
                createdAt: {
                    type: Date,
                },
                updatedAt: {
                    type: Date,
                },
                updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
                ...schemaObject,
            },
            {
                timestamps: true,
                ...schemaOptions,
            }
        );
        this.methods.toJSON = function () {
            const objectData: any = this.toObject();
            delete objectData.__v;
            if (hiddenProperties) {
                hiddenProperties.forEach((key: string) => delete objectData[key]);
            }
            return objectData;
        };
    }
}
