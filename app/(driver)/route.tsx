import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function DriverRoute() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Route Map</Text>
        <Text style={styles.subtitle}>View your delivery route on the map.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
});
