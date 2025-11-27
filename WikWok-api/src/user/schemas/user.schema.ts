import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Video } from './video.model';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Video' }], default: [] })
  videos: Types.ObjectId[] | Video[];
}

export const UserSchema = SchemaFactory.createForClass(User);
