import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  status: z.enum(['PENDING', 'PROCESSING', 'DONE']).optional(),
  assignedTo: z.string().uuid().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;