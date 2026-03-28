import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

export default function DriverReport() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.successHeader}>
           <View style={styles.confettiContainer}>
             <Ionicons name="sparkles" size={40} color="#fff" />
           </View>
           <Text style={styles.successTitle}>Route Complete!</Text>
           <Text style={styles.urduSuccessTitle}>آج کا کام مکمل</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Deliveries</Text>
            <Text style={styles.statValue}>38 / 38</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Milk</Text>
            <Text style={styles.statValue}>142L</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Cash Collected</Text>
            <Text style={styles.statValueRs}>Rs 4,200</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Skipped</Text>
            <Text style={styles.statValueWarning}>2 customers</Text>
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.noteSection}>
          <View style={styles.noteLabelRow}>
            <Text style={styles.noteLabel}>Note (optional)</Text>
            <Text style={styles.urduNoteLabel}>نوٹ</Text>
          </View>
          <TextInput 
            style={styles.noteInput}
            placeholder="Any issues today? / آج کوئی مسئلہ؟"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit report →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  successHeader: {
    backgroundColor: '#22c55e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  confettiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  urduSuccessTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  statValueRs: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f59e0b',
  },
  statValueWarning: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  noteSection: {
    marginBottom: 32,
  },
  noteLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  urduNoteLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  noteInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
