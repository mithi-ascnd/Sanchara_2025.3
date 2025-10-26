import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a1a' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="blind/navigation" />
      <Stack.Screen name="deaf/navigation" />
      <Stack.Screen name="wheelchair/navigation" />
      <Stack.Screen name="search" />
      <Stack.Screen name="report" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
