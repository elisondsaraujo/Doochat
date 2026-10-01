import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Não autenticado."
    });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(
      token,
      env.JWT_SECRET
    );

    if (
      typeof payload !== "object" ||
      !payload.sub ||
      typeof payload.sub !== "string"
    ) {
      return res.status(401).json({
        error: "Token inválido."
      });
    }

    req.userId = payload.sub;

    next();
  } catch {
    return res.status(401).json({
      error: "Token inválido ou expirado."
    });
  }
}
