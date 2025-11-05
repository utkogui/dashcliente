import { JWTPayload } from './utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload
    }
  }
}

// Exportar vazio para garantir que seja um módulo
export {}
