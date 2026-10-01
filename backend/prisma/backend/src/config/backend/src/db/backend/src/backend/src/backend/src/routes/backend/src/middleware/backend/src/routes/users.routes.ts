import { Router } from "express";

import { prisma } from "../db/prisma.js";
import {
  authenticate,
  AuthenticatedRequest
} from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, async (
  req: AuthenticatedRequest,
  res
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({
      error: "Usuário não encontrado."
    });
  }

  return res.json(user);
});

router.get("/search", authenticate, async (req, res) => {
  const username = String(
    req.query.username ?? ""
  )
    .trim()
    .toLowerCase();

  if (!username) {
    return res.status(400).json({
      error: "Informe um username."
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      username
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true
    }
  });

  if (!user) {
    return res.status(404).json({
      error: "Usuário não encontrado."
    });
  }

  return res.json(user);
});

export default router;
