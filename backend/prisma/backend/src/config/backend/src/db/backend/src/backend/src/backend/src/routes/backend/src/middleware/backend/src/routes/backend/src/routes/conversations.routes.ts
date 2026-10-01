import { Router } from "express";

import { prisma } from "../db/prisma.js";
import {
  authenticate,
  AuthenticatedRequest
} from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, async (
  req: AuthenticatedRequest,
  res
) => {
  const { userId } = req.body;

  if (
    typeof userId !== "string" ||
    userId === req.userId
  ) {
    return res.status(400).json({
      error: "Usuário inválido."
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!targetUser) {
    return res.status(404).json({
      error: "Usuário não encontrado."
    });
  }

  const conversation =
    await prisma.conversation.create({
      data: {
        members: {
          create: [
            {
              userId: req.userId!
            },
            {
              userId
            }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

  return res.status(201).json(conversation);
});

router.get("/", authenticate, async (
  req: AuthenticatedRequest,
  res
) => {
  const conversations =
    await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: req.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

  return res.json(conversations);
});

export default router;
