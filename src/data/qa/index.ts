// src/data/qa/index.ts
// Q&A scenario barrel — imports all 7 scenarios and exports as ordered array
// A1 scenarios appear first, A2 scenarios appear last (canonical display order for Phase 18)
import { caffe } from './caffe';
import { albergo } from './albergo';
import { ristorante } from './ristorante';
import { strada } from './strada';
import { presentazioni } from './presentazioni';
import { negozio } from './negozio';
import { treno } from './treno';

export { caffe, albergo, ristorante, strada, presentazioni, negozio, treno };
export const scenarios = [caffe, albergo, ristorante, strada, presentazioni, negozio, treno];
