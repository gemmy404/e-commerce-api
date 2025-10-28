import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {User} from "../../users/schemas/users.schema";

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
        type: Types.ObjectId, ref: 'User',
        required: true
    })
    user: User;
}

export const ResetPasswordCodeSchema = SchemaFactory.createForClass(ResetPasswordCode);