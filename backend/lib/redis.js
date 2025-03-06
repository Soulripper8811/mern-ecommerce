import { Redis } from '@upstash/redis'
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
    url: 'https://enjoyed-wombat-54298.upstash.io',
    token: 'AdQaAAIjcDE5ZDdlNDg4YmU2MzI0MGUwYTNiMWFkZDUyZmQyMjgzZXAxMA',
  })