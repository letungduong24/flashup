import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const logger = new Logger('BcryptUtil');

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @param saltRounds Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Check if a string is a bcrypt hash
 * @param password String to check
 * @returns True if the string is a bcrypt hash
 */
export function isBcryptHash(password: string): boolean {
  return password.startsWith('$2a$') || 
         password.startsWith('$2b$') || 
         password.startsWith('$2y$');
}

/**
 * Validate and compare password (supports both hashed and plain text)
 * This is a temporary solution until all passwords are hashed
 * @param plainPassword Plain text password from user input
 * @param storedPassword Password from database (may be hashed or plain)
 * @returns True if passwords match, false otherwise
 */
export async function validatePassword(
  plainPassword: string,
  storedPassword: string
): Promise<boolean> {
  if (!plainPassword || !storedPassword) {
    logger.error('validatePassword: Missing password parameters');
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    // Password is hashed, use bcrypt.compare
    try {
      logger.debug(`Comparing password - plain length: ${plainPassword.length}, hash length: ${storedPassword.length}`);
      const result = await comparePassword(plainPassword, storedPassword);
      if (!result) {
        logger.error('bcrypt.compare returned false');
        logger.error(`Plain password length: ${plainPassword.length}`);
        logger.error(`Stored password length: ${storedPassword.length}`);
        logger.error(`Stored password preview: ${storedPassword.substring(0, 30)}`);
      } else {
        logger.debug('bcrypt.compare returned true');
      }
      return result;
    } catch (error) {
      logger.error('Error in bcrypt.compare:', error);
      return false;
    }
  } else {
    // Password is not hashed (temporary), compare directly
    // TODO: Remove this when all passwords are hashed
    logger.warn('Password is not hashed, comparing directly');
    return plainPassword === storedPassword;
  }
}

