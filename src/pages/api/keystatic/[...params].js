import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

const handler = makeHandler({ config });

export const ALL = handler;
export const prerender = false;
