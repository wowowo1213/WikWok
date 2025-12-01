import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'userId不能为空' })
  userId: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  followers?: number;

  @IsOptional()
  followings?: number;
}
