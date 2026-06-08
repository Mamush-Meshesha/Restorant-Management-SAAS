import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_conversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const memberships = await prisma.conversationMember.findMany({
      where: { user_id: userId },
      include: {
        conversation: {
          include: {
            members: {
              where: { user_id: { not: userId } },
              include: { user: { select: { id: true, first_name: true, last_name: true, username: true, role: true } } }
            },
            messages: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    // Map to frontend expected format
    const conversations = memberships.map(m => {
      const conv = m.conversation;
      const otherMember = conv.members[0]?.user;
      const lastMsg = conv.messages[0];
      
      return {
        id: conv.id,
        name: conv.name || (otherMember ? `${otherMember.first_name} ${otherMember.last_name || ''}`.trim() : "Unknown"),
        role: otherMember?.role?.name || "User",
        lastMessage: lastMsg ? lastMsg.content : "New conversation",
        lastTime: lastMsg ? lastMsg.created_at : conv.created_at,
        unread: m.unread_count,
        online: true, // Mock online status for now
      };
    }).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

    res.status(200).json({ data: conversations });
  } catch (error) {
    next(error);
  }
};

export const get_messages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: { conversation_id_user_id: { conversation_id: conversationId, user_id: userId! } }
    });

    if (!membership) return res.status(403).json({ message: "Not a member of this conversation" });

    // Mark as read
    if (membership.unread_count > 0) {
      await prisma.conversationMember.update({
        where: { id: membership.id },
        data: { unread_count: 0 }
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
      take: 100
    });

    // Map to frontend expected format
    const formattedMessages = messages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.content,
      timestamp: m.created_at,
      read: m.is_read
    }));

    res.status(200).json({ data: formattedMessages });
  } catch (error) {
    next(error);
  }
};

export const send_message = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const message = await prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId!,
        content
      }
    });

    // Increment unread count for other members
    await prisma.conversationMember.updateMany({
      where: { 
        conversation_id: conversationId,
        user_id: { not: userId }
      },
      data: {
        unread_count: { increment: 1 }
      }
    });

    res.status(201).json({ data: message });
  } catch (error) {
    next(error);
  }
};

export const start_conversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user?.id;
    const orgId = req.user?.organizationId || req.user?.instituteId;

    if (!targetUserId || !orgId) return res.status(400).json({ message: "Missing target user or organization" });

    // Check if conversation already exists between these two exact users
    // This is a simplified check, works best for 1-on-1 chats
    const existingMember = await prisma.conversationMember.findFirst({
      where: {
        user_id: userId,
        conversation: {
          members: {
            some: { user_id: targetUserId }
          }
        }
      },
      include: { conversation: true }
    });

    if (existingMember) {
      return res.status(200).json({ data: existingMember.conversation });
    }

    const conversation = await prisma.conversation.create({
      data: {
        organization_id: orgId,
        members: {
          create: [
            { user_id: userId! },
            { user_id: targetUserId }
          ]
        }
      }
    });

    res.status(201).json({ data: conversation });
  } catch (error) {
    next(error);
  }
};
