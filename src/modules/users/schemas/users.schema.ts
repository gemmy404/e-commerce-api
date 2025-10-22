import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [15, 'Name must not be more than 15 characters'],
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    enum: ['ADMIN', 'USER'],
  })
  role: string;

  @Prop()
  avatar: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UsersSchema = SchemaFactory.createForClass(User);
// UsersSchema.index({email: 1}, {unique: true});
