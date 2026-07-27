export const ARCHITECTURES= ["arm64-v8a","armeabi-v7a","x86_64"]as const;

export type Architectures = typeof ARCHITECTURES[number];