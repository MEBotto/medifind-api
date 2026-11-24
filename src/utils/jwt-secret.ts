import 'dotenv/config';

/**
 * Evita firmar o verificar JWT con una clave de respaldo conocida.
 * La configuración debe existir antes de usar la autenticación.
 */
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET debe estar configurado en las variables de entorno');
  }

  return secret;
};
