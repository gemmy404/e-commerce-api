export interface UserResponseDto {
  id?: string;
  name: string;
  email?: string;
  avatar?: string | null;
  isActive?: boolean;
  role?: string;
}