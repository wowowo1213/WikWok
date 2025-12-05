import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController, UserPublicController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { Video, VideoSchema } from 'src/upload/video.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [UserController, UserPublicController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
