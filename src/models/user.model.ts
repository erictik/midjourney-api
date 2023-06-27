import { model } from "mongoose";
import { BaseDocumentInterface, BaseDocumentSchema } from "./base.model";

export interface UserInterface extends BaseDocumentInterface {
    role: string;
    lastLogin?: Date;
    status?: string;
    username: string;
    password: string;
    token: string;
}

const UserSchema = new BaseDocumentSchema(
    {
        role: {
            type: String,
            required: true,
            default: "client",
            enum: ["admin", "client", "operator"],
        },
        lastLogin: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            default: "register",
            enum: ["register", "inactive", "deleted"],
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        token: {
            type: String,
            trim: true,
        },
    },
    null,
    ["password", "token"]
);

UserSchema.methods.getPropertyArrayForHide = (withMines?: Boolean) => {
    if (withMines)
        return ["-__v", "-deleted", "-password", "-token"];

    return ["__v", "deleted", "password", "token"];
};

UserSchema.methods.getPropertyObjectForHide = () => {
    return {
        __v: 0,
        deleted: 0,
        password: 0,
        token: 0,
    };
};

UserSchema.index({ username: 1 });

const User = model<UserInterface>("User", UserSchema);
export default User;
