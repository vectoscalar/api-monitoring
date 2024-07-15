import { UserDAO } from '../dao/user.dao'; 
export class UserService {
  private userDAO: UserDAO;

  constructor() {
    this.userDAO = new UserDAO();
  }

  async getAllUsers() {
    try {

      const users = await this.userDAO.find();
      return users;
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      throw error;
    }
  }
}
