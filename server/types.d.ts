import { JWTPayload } from './utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload
    }
  }
}

export {}
