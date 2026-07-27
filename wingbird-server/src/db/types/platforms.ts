export const PLATFORMS= ["android","ios"]as const;

export type Platforms = typeof PLATFORMS[number];