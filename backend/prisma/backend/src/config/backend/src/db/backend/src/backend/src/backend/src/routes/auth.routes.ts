import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(80)
});

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Dados inválidos."
    });
  }

  const {
    email,
    password,
    username,
    displayName
  } = result.data;

  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    }
  });

  if (existingUser) {
    return res.status(409).json({
      error: "E-mail ou username já utilizado."
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      username: normalizedUsername,
      displayName,
      passwordHash
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

  const token = jwt.sign(
    {
      sub: user.id
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

  return res.status(201).json({
    user,
    token
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Dados inválidos."
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: result.data.email.toLowerCase()
    }
  });

  if (!user?.passwordHash) {
    return res.status(401).json({
      error: "Credenciais inválidas."
    });
  }

  const validPassword = await bcrypt.compare(
    result.data.password,
    user.passwordHash
  );

  if (!validPassword) {
    return res.status(401).json({
      error: "Credenciais inválidas."
    });
  }

  const token = jwt.sign(
    {
      sub: user.id
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    }
  });
});

export default router;
