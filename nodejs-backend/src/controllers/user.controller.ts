import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/helpers.js';
import { AuthenticatedRequest } from '../types/index.js';
import { UpdateUserInput } from '../validators/user.validator.js';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userService.findById(userId);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.findById(id as string);
      sendSuccess(res, user, 'User retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = req.user!.id;
      const data = req.body as UpdateUserInput;
      const user = await userService.update(id as string, requesterId, data);
      sendSuccess(res, user, 'User updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = req.user!.id;
      await userService.delete(id as string, requesterId);
      sendSuccess(res, null, 'User deleted');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await userService.getStats(userId);
      sendSuccess(res, stats, 'Stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
