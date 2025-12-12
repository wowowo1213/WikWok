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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  views: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  comments: Types.ObjectId[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);
