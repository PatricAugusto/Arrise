import { createTamagui } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';

export const tamaguiConfig = createTamagui(defaultConfig);
export const config = tamaguiConfig;
export default tamaguiConfig;

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}