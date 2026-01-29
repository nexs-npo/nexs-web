import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

const handler = makeHandler({
  config,
  clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: process.env.KEYSTATIC_SECRET,
});

export const ALL = handler;
export const prerender = false;
