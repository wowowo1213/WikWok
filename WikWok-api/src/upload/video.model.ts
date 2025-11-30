import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  fileHash: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ default: '' })
  filename: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  views: number;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
