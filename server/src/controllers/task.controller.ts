import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { Server } from 'socket.io';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let tasks;
    if (user.role === 'USER') {
      tasks = await prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: user.userId },
            { assigneeId: null }
          ]
        },
        include: { assignee: { select: { email: true } } }
      });
    } else {
      tasks = await prisma.task.findMany({ include: { assignee: { select: { email: true } } } });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    let { title, description, deadline, labels, priority, assigneeId } = req.body;
    if (user.role === 'USER' && !assigneeId) {
      assigneeId = user.userId;
    }

    const task = await prisma.task.create({
      data: { title, description, deadline, labels, priority, assigneeId }
    });

    await prisma.activityLog.create({
      data: { action: 'Task created', taskId: task.id, userId: user.userId }
    });

    if (assigneeId && assigneeId !== user.userId) {
      const io: Server = req.app.get('io');
      io.to(assigneeId).emit('taskAssigned', { message: `You have been assigned a new task: ${title}` });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (user.role === 'USER' && task.assigneeId && task.assigneeId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });

    await prisma.activityLog.create({
      data: { action: `Status changed to ${status}`, taskId: id, userId: user.userId }
    });

    if (updatedTask.assigneeId && updatedTask.assigneeId !== user.userId) {
      const io: Server = req.app.get('io');
      io.to(updatedTask.assigneeId).emit('taskUpdated', { message: `Task ${updatedTask.title} status changed to ${status}` });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
