import { IsString, IsNotEmpty, Matches, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, {
    message: '手机号格式不正确',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(20, { message: '密码长度不能超过20位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  @MinLength(6, { message: '确认密码长度不能少于6位' })
  @MaxLength(20, { message: '确认密码长度不能超过20位' })
  confirmPassword: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  followers?: number;

  @IsOptional()
  followings?: number;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, {
    message: '手机号格式不正确',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(20, { message: '密码长度不能超过20位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'id不能为空' })
  id: string;

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
