import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

const handler = makeHandler({
  config,
  secret: process.env.KEYSTATIC_SECRET,
});

export const ALL = handler;
export const prerender = false;
