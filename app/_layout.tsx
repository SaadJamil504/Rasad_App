import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function RootLayout() {
  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#ffffff' 
      }} 
      edges={['top']}>
      <LanguageProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="modal" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        </Stack>
      </LanguageProvider>
    </SafeAreaView>
  );
}