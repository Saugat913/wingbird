export const CHANNELS= ["production","staging","development"]as const;

export type Channels = typeof CHANNELS[number];