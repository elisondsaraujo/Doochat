import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import {
  authenticate,
  AuthenticatedRequest
} from "../middleware/auth.js";

const router = Router();

const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(5000)
});

router.post("/", authenticate, async (
  req: AuthenticatedRequest,
  res
) => {
  const result = messageSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Mensagem inválida."
    });
  }

  const {
    conversationId,
    content
  } = result.data;

  const membership =
    await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: req.userId
      }
    });

  if (!membership) {
    return res.status(403).json({
      error: "Você não participa desta conversa."
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.userId!,
      content,
      type: "TEXT",
      status: "SENT"
    }
  });

  return res.status(201).json(message);
});

router.get("/:conversationId", authenticate, async (
  req: AuthenticatedRequest,
  res
) => {
  const conversationId =
    req.params.conversationId;

  const membership =
    await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: req.userId
      }
    });

  if (!membership) {
    return res.status(403).json({
      error: "Acesso negado."
    });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId
    },
    orderBy: {
      createdAt: "asc"
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  });

  return res.json(messages);
});

export default router;
