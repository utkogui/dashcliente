import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'
const JWT_EXPIRES_IN = '24h'

export interface JWTPayload {
  id: string
  email: string
  tipo: string
  clienteId?: string | null
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Token inválido ou expirado')
  }
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    return null
  }
}
