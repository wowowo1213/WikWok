import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Video } from '../upload/video.model';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '这个人很懒，什么都没有留下~' })
  bio: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: 0 })
  followers: number;

  @Prop({ default: 0 })
  followings: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Video' }], default: [] })
  videos: Types.ObjectId[] | Video[];
}

export const UserSchema = SchemaFactory.createForClass(User);
