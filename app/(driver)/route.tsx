import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";
import { Linking, TouchableOpacity } from 'react-native';

interface Delivery {
  id: string | number;
  customer_name: string;
  customer_house_no: string;
  customer_street: string;
  customer_area: string;
  customer_address?: string;
  status: string;
  sequence_order?: number;
  customer_latitude?: number | string;
  customer_longitude?: number | string;
}

export default function DriverRoute() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoute = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(ENDPOINTS.DELIVERIES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching route:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  const handleStartNavigation = () => {
    // Dynamic Updating: Include only stops that have not been marked as "Delivered" or "Paused"
    const pending = deliveries.filter(d => d.status !== 'delivered' && d.status !== 'paused');
    if (pending.length === 0) return;

    // We assume backend either returns coordinates or we use address as fallback. 
    // As per specs we use LAT,LNG
    const getCoordinateStr = (d: Delivery) => {
      if (d.customer_latitude && d.customer_longitude) {
        return `${d.customer_latitude},${d.customer_longitude}`;
      }
      // fallback to address
      return encodeURIComponent(`${d.customer_house_no} ${d.customer_street} ${d.customer_area}`);
    };

    const destination = getCoordinateStr(pending[pending.length - 1]);
    let mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

    if (pending.length > 1) {
      const waypoints = pending.slice(0, -1).map(getCoordinateStr).join('|');
      mapUrl += `&waypoints=${waypoints}`;
    }

    Linking.openURL(mapUrl).catch(err => console.error("Could not open Google Maps", err));
  };

  if (loading) {
     return (
       <SafeAreaView style={styles.container}>
         <View style={{ flex: 1, justifyContent: 'center' }}>
           <ActivityIndicator size="large" color="#000" />
         </View>
       </SafeAreaView>
     );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoute(); }} />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Delivery Sequence</Text>
            <Text style={styles.urduTitle}>ترتیبی فہرست</Text>
          </View>
          {deliveries.filter(d => d.status !== 'delivered' && d.status !== 'paused').length > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handleStartNavigation}>
              <Ionicons name="navigate-circle" size={24} color="#fff" />
              <Text style={styles.navButtonText}>Navigate</Text>
            </TouchableOpacity>
          )}
        </View>

        {deliveries.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="map-outline" size={48} color="#9ca3af" />
             <Text style={styles.emptyText}>No routes assigned for today.</Text>
          </View>
        ) : (
          deliveries.map((item, index) => (
            <View key={item.id} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View style={[styles.circle, item.status === 'delivered' ? styles.circleDone : styles.circlePending]}>
                  <Text style={[styles.stepNum, item.status === 'delivered' && styles.stepNumDone]}>{index + 1}</Text>
                </View>
                {index < deliveries.length - 1 && <View style={styles.line} />}
              </View>
              
              <View style={styles.stepContent}>
                <Text style={styles.customerName}>{item.customer_name}</Text>
                <View style={styles.addressBox}>
                  <Ionicons name="location-outline" size={14} color="#64748b" style={{ marginTop: 3 }} />
                  <Text style={styles.addressText}>
                    {item.customer_address || `${item.customer_house_no}, ${item.customer_street}, ${item.customer_area}`}
                  </Text>
                </View>
                {item.status === 'delivered' && (
                  <View style={styles.doneBadge}>
                    <Ionicons name="checkmark-done" size={12} color="#059669" />
                    <Text style={styles.doneBadgeText}>Delivered</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  scrollContent: { 
    padding: 24,
    paddingTop: 1,
    paddingBottom: 40 
  },
  headerRow: { 
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#000' 
  },
  urduTitle: { 
    fontSize: 20, 
    color: '#94a3b8', 
    fontWeight: '500',
    marginTop: 4 
  },
  navButton: {
    backgroundColor: '#3b82f6', // Blueprint navigation color
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: { 
    padding: 40, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#9ca3af', 
    marginTop: 10, 
    textAlign: 'center' 
  },
  stepContainer: { 
    flexDirection: 'row', 
    gap: 16 
  },
  stepIndicator: { 
    alignItems: 'center', 
    width: 32 
  },
  circle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  circlePending: { 
    backgroundColor: '#fff', 
    borderColor: '#e2e8f0' 
  },
  circleDone: { 
    backgroundColor: '#10b981', 
    borderColor: '#10b981' 
  },
  stepNum: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#94a3b8' 
  },
  stepNumDone: { 
    color: '#fff' 
  },
  line: { 
    width: 2, 
    flex: 1, 
    backgroundColor: '#f1f5f9', 
    marginVertical: 4 
  },
  stepContent: { 
    flex: 1, 
    paddingBottom: 32 
  },
  customerName: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#000', 
    marginBottom: 4 
  },
  addressBox: { 
    flexDirection: 'row', 
    gap: 4, 
    alignItems: 'flex-start' 
  },
  addressText: { 
    fontSize: 14, 
    color: '#64748b', 
    lineHeight: 20, 
    flex: 1 
  },
  doneBadge: { 
    flexDirection: 'row', 
    gap: 4, 
    alignItems: 'center', 
    marginTop: 8, 
    backgroundColor: '#f0fdf4', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  doneBadgeText: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#16a34a' 
  },
});
