/**
 * Tabs Index - Redirect to Games
 */

import { Redirect } from 'expo-router';

export default function TabsIndex() {
  return <Redirect href="/(tabs)/games" />;
}
