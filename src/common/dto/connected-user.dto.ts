export interface ConnectedUserDto {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}