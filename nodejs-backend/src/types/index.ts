import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ReminderFilter {
  userId?: string;
  sendReminder?: boolean;
  relation?: string;
  month?: number;
  upcoming?: boolean;
}

export interface NotificationPayload {
  reminderId: string;
  userId: string;
  personName: string;
  birthday: Date;
  phone?: string;
  email?: string;
  message: string;
  method: 'SMS' | 'EMAIL' | 'BOTH';
}
