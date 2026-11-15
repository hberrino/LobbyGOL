import { randomBytes,scrypt as scryptCallback,timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');return `${salt}:${(await scrypt(password,salt,64)).toString('hex')}`;}
export async function passwordMatches(password,stored){const [salt,key]=stored.split(':');return timingSafeEqual(await scrypt(password,salt,64),Buffer.from(key,'hex'));}
