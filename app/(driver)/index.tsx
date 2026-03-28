import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../constants/Api";

const deliveries = [
  { id: '1', name: 'Waleed Hassan', sub: 'H-45, BLOCK C', qty: '3L', status: 'done' },
  { id: '2', name: 'Sana Bibi', sub: 'H-78, BLOCK-3 • 5L usual', qty: '5L', status: 'active' },
  { id: '3', name: 'Uncle Tariq', sub: 'H-12, BLOCK-E • 2L usual', qty: '2L', status: 'next' },
];

export default function DriverHome() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = React.useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    console.log("🔍 Fetching:", `${BASE_URL}/accounts/profile/`);
    fetch(`${BASE_URL}/accounts/profile/`)
      .then(async res => {
        const text = await res.text();
        console.log("📡 Response status:", res.status);
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("❌ Backend returned HTML instead of JSON. First 500 characters:", text.substring(0, 500));
          throw new Error("Invalid JSON response");
        }
      })
      .then(data => {
        console.log("✅ API Connection Success! data:", data);
        setConnectionStatus('success');
      })
      .catch(err => {
        console.error("❌ API Connection Failed:", err);
        setConnectionStatus('failed');
      });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Connection Status Badge */}
      <View style={[
        styles.statusBadge,
        connectionStatus === 'success' ? styles.statusSuccess : connectionStatus === 'failed' ? styles.statusFailed : styles.statusChecking
      ]}>
        <Text style={styles.statusBadgeText}>
          {connectionStatus === 'checking' ? '🔄 Checking Backend...' : 
           connectionStatus === 'success' ? '✅ Connected to Backend' : 
           '❌ Cannot Connect to Backend'}
        </Text>
      </View>
      {/* Dark Header */}
      <View style={styles.darkHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingUrdu}>السلام علیکم</Text>
            <Text style={styles.driverName}>Ali Bhai 🚀</Text>
            <Text style={styles.routeName}>ROUTE-A  •  JOHAR TOWN  •  38 STOPS</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutIconButton}
            onPress={() => router.replace("/login")}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>DONE</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>LEFT</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Rs 4.2K</Text>
            <Text style={styles.statLabel}>CASH</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>TODAY'S LIST</Text>
          <Text style={styles.urduListTitle}>آج کی فہرست</Text>
        </View>

        {deliveries.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.card,
              item.status === 'active' && styles.activeCard
            ]}
          >
            <View style={styles.cardLeft}>
              <View style={[
                styles.statusIcon,
                item.status === 'done' && styles.doneIcon,
                item.status === 'active' && styles.activeIcon,
                item.status === 'next' && styles.nextIcon,
              ]}>
                {item.status === 'done' && <Ionicons name="checkmark" size={16} color="#059669" />}
                {item.status === 'active' && <Ionicons name="hourglass" size={16} color="#2563eb" />}
              </View>
              <View>
                <Text style={[
                  styles.customerName,
                  item.status === 'done' && styles.doneText
                ]}>
                  {item.name}
                </Text>
                <Text style={styles.customerSub}>{item.sub}</Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              {item.status === 'done' ? (
                <View style={styles.qtyDoneRow}>
                   <Text style={styles.qtyTextDone}>{item.qty}</Text>
                   <Ionicons name="checkmark" size={18} color="#059669" />
                </View>
              ) : item.status === 'active' ? (
                <View style={styles.activeAction}>
                  <View style={styles.qtyBox}>
                    <Text style={styles.qtyTextActive}>{item.qty.replace('L', '')}</Text>
                    <Text style={styles.qtyUnit}>L</Text>
                  </View>
                  <TouchableOpacity style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>Done ✓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.nextText}>Next</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkHeader: {
    backgroundColor: '#111827',
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logoutIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  greetingUrdu: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  routeName: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  urduListTitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  activeCard: {
    borderColor: '#2563eb',
    borderWidth: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneIcon: { backgroundColor: '#ecfdf5' },
  activeIcon: { backgroundColor: '#eff6ff' },
  nextIcon: { backgroundColor: '#f9fafb' },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  doneText: {
    color: '#9ca3af',
    textDecorationLine: 'none',
  },
  customerSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  qtyDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyTextDone: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  activeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyTextActive: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  qtyUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  doneButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  nextText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChecking: { backgroundColor: '#fef3c7' },
  statusSuccess: { backgroundColor: '#d1fae5' },
  statusFailed: { backgroundColor: '#fee2e2' },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
});
