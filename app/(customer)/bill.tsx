import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ENDPOINTS } from "../../constants/Api";

interface DeliveryHistoryItem {
  id: number;
  date: string;
  quantity: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'paused';
  total_amount: string;
}

export default function CustomerBill() {
  const [history, setHistory] = useState<DeliveryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalMilk: 0,
    totalAmount: 0,
    deliveredDays: 0
  });
  const [downloading, setDownloading] = useState(false);

  const fetchHistory = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1; // getMonth() is 0-indexed
      const year = now.getFullYear();
      
      const token = await SecureStore.getItemAsync('userToken');
      const url = `${ENDPOINTS.DELIVERIES_HISTORY}?month=${month}&year=${year}`;
      
      console.log(`🚀 Fetching history from: ${url}`);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      const historyData = Array.isArray(data) ? data : [];
      setHistory(historyData);

      // Calculate Summary
      const delivered = historyData.filter(d => d.status === 'delivered');
      const totalMilk = delivered.reduce((sum, d) => sum + parseFloat(d.quantity || '0'), 0);
      const totalAmount = delivered.reduce((sum, d) => sum + parseFloat(d.total_amount || '0'), 0);
      
      setSummary({
        totalMilk,
        totalAmount,
        deliveredDays: delivered.length
      });

    } catch (err) {
      console.error("❌ Error fetching bill history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please login again.");
        return;
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const fileName = `Rasad_Bill_${month}_${year}.pdf`;
      const url = `${ENDPOINTS.BILL_PDF}?month=${month}&year=${year}`;
      
      // 1. Download to temporary location first
      const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const downloadRes = await FileSystem.downloadAsync(
        url,
        tempFileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (downloadRes.status !== 200) {
        Alert.alert("Error", "Failed to generate PDF. Please try again later.");
        return;
      }

      // 2. Handle saving to user-accessible location
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, { encoding: FileSystem.EncodingType.Base64 });
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
          await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert("Success", "Bill saved successfully to your selected folder.");
        } else {
          // Fallback to sharing if permission denied
          await Sharing.shareAsync(downloadRes.uri);
        }
      } else {
        // iOS: Sharing sheet is the standard way to "Save to Files"
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadRes.uri, {
            UTI: 'com.adobe.pdf',
            mimeType: 'application/pdf',
          });
        } else {
          Alert.alert("Success", "Bill downloaded. You can find it in your app's documents.");
        }
      }
    } catch (error) {
      console.error("❌ PDF Download Error:", error);
      Alert.alert("Error", "An unexpected error occurred while downloading the bill.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Calculating your bill...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />
        }
      >
        <View style={styles.headerArea}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.headerTitle}>{getMonthName()}</Text>
              <Text style={styles.headerUrdu}>اس مہینے کا بل</Text>
            </View>
          </View>
          
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.totalAmountText}>Rs {summary.totalAmount.toLocaleString()}</Text>
              <Text style={styles.totalAmountLabel}>CURRENT TOTAL</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{summary.totalMilk.toFixed(1)}L</Text>
                <Text style={styles.statLabel}>Total Milk</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{summary.deliveredDays}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: '#059669' }]}>Active</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.historySectionHeader}>
          <Text style={styles.sectionTitle}>DAILY CONSUMPTION</Text>
          <Text style={styles.urduSectionTitle}>روزانہ کا ریکارڈ</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptySubtitle}>Consumption history will appear here once deliveries begin.</Text>
          </View>
        ) : (
          history.map((item: DeliveryHistoryItem) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.cardLeft}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dayNumber}>{getDayNumber(item.date)}</Text>
                  <Text style={styles.dayName}>{getDayName(item.date)}</Text>
                </View>
                <View style={styles.deliveryDetails}>
                  <Text style={styles.qtyText}>{parseFloat(item.quantity).toString()} Liters</Text>
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: item.status === 'delivered' ? '#22c55e' : item.status === 'paused' ? '#f59e0b' : '#ef4444' }
                    ]} />
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.amountText}>Rs {parseFloat(item.total_amount).toLocaleString()}</Text>
                <Text style={styles.urduQty}>دودھ: {parseFloat(item.quantity).toString()} لیٹر</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Download PDF Button */}
      <TouchableOpacity 
        style={[styles.payNowBtn, downloading && { opacity: 0.7 }]} 
        onPress={handleDownloadPDF}
        disabled={downloading}
      >
        <Text style={styles.payNowText}>{downloading ? 'PREPARING...' : 'DOWNLOAD PDF'}</Text>
        {downloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="download-outline" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  loadingWrapper: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '600',
  },
  headerArea: {
    backgroundColor: '#fff',
    paddingVertical: 1,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  headerUrdu: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  totalAmountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  totalAmountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#f1f5f9',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
  },
  urduSectionTitle: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  dayName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  deliveryDetails: {
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  urduQty: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
  payNowBtn: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    left: 24,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  payNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
