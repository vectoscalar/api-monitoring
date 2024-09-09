import BaseDAO from "../common/base.dao";
import { UserModel } from "../models/user.model";

export class UserDAO extends BaseDAO {
  constructor() {
    super(UserModel); // Pass the UserModel to the super class constructor
  }
}