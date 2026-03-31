import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  Alert,
  RefreshControl,
  ScrollView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { Colors } from "../../constants/theme";

interface Payment {
  id: number;
  amount: string;
  method: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  date: string;
  note?: string;
  received_by_name?: string;
}

export default function CustomerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPayments = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.PAYMENTS_LIST, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleReportPayment = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(ENDPOINTS.PAYMENT_CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          method,
          date,
          note
        })
      });

      if (response.ok) {
        Alert.alert("Success", "Payment report submitted successfully.");
        setModalVisible(false);
        resetForm();
        fetchPayments();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to submit payment report.");
      }
    } catch (error) {
      console.error("❌ Error reporting payment:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod('Cash');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'rejected': return '#dc2626';
      default: return '#f59e0b';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.methodIcon}>
          <Ionicons 
            name={item.method.toLowerCase().includes('cash') ? 'cash-outline' : 'card-outline'} 
            size={20} 
            color="#64748b" 
          />
        </View>
        <View style={styles.paymentDetails}>
          <Text style={styles.amountText}>Rs {parseFloat(item.amount).toLocaleString()}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      {item.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.methodLabel}>{item.method}</Text>
        <Text style={styles.receivedByText}>
          {item.status === 'confirmed' ? `Confirmed by ${item.received_by_name || 'Owner'}` : 'Verification pending'}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerUrdu}>ادائیگیوں کا ریکارڑ</Text>
        </View>
      </View>

      {/* Section 1: Record Payment */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECORD PAYMENT</Text>
          <Text style={styles.urduSectionTitle}>ادائیگی درج کریں</Text>
        </View>
        
        <View style={styles.recordFormCard}>
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Amount Paid</Text>
              <TextInput
                style={styles.input}
                placeholder="Rs 0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Method</Text>
            <View style={styles.methodTabs}>
              {['Cash', 'Transfer', 'JazzCash', 'EasyPaisa'].map((m) => (
                <TouchableOpacity 
                  key={m}
                  style={[styles.methodTab, method === m && styles.activeMethodTab]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[styles.methodTabText, method === m && styles.activeMethodTabText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleReportPayment}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Record</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 2: History Header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: 20, marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>PAYMENT HISTORY</Text>
        <Text style={styles.urduSectionTitle}>تاریخچہ</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.centerMode}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Fetching payment history...</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="wallet-outline" size={40} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No payments yet</Text>
              <Text style={styles.emptySubtitle}>Your history will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#000' },
  headerUrdu: { fontSize: 18, color: '#94a3b8', fontWeight: '500' },
  sectionContainer: {
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  urduSectionTitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  recordFormCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  methodTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeMethodTab: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  methodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeMethodTabText: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#000',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerMode: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#94a3b8', fontWeight: '600' },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  paymentDetails: { flex: 1, marginLeft: 16 },
  amountText: { fontSize: 16, fontWeight: '800', color: '#000' },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusLabel: { fontSize: 9, fontWeight: '800' },
  noteContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  noteText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  receivedByText: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});
