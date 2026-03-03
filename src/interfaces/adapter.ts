export interface AuthAdapter {
  createUser: (data: any) => Promise<any>;
  findUserByEmail: (email: string) => Promise<any>;
}
