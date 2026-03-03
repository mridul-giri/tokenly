export interface AuthAdapter {
  createUser: (data: any) => Promise<any>;
  findUserByEmail: (email: string) => Promise<any>;
  findUserById: (userId: string) => Promise<any>;
  updatePassword: (userId: string, newPassword: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
}
