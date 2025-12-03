import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import type { Express } from 'express';

export class UpdateUserInfoRequestDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  left?: string;
}

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
  image?: Express.Multer.File;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  left?: string;

  @IsOptional()
  followers?: number;

  @IsOptional()
  followings?: number;
}
