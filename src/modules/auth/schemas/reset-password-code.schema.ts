import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";
import {User} from "../../users/schemas/users.schema";

export type ResetPasswordCodeDocument = HydratedDocument<ResetPasswordCode>;

@Schema({timestamps: true})
export class ResetPasswordCode {
    @Prop({
        required: true,
        unique: true,
        minlength: [6, 'code must be 6 characters'],
        maxlength: [6, 'code must be 6 characters'],
    })
    code: string;

    @Prop({
        required: true
    })
    expireAt: Date;

    @Prop({
        required: true,
        default: true
    })
    isValid: boolean;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: User.name,
    })
    user: User;
}

export const ResetPasswordCodeSchema = SchemaFactory.createForClass(ResetPasswordCode);