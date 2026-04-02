import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS, BASE_URL } from "../../constants/Api";

export default function DriversScreen() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useFocusEffect(
        useCallback(() => {
            fetchDrivers();
        }, [])
    );

    const fetchDrivers = async () => {
        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            // Fetch absolute staff and filter in frontend consistent with routes.tsx
            const response = await fetch(`${ENDPOINTS.DRIVERS}?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();

            if (response.status === 401 || data.code === "token_not_valid") {
                Alert.alert("Session Expired", "Your session has expired. Please log in again.");
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userRole');
                router.replace('/login');
                return;
            }

            const fullList = Array.isArray(data) ? data : (data.results || []);
            
            // Broaden filter to include placeholder users (tmp_) and case-insensitive roles
            const driversList = fullList.filter((u: any) => 
                u.role?.toLowerCase() === "driver" || 
                (u.username && u.username.toLowerCase().startsWith("tmp_"))
            );
            setDrivers(driversList);
        } catch (error) {
            console.error("Fetch Drivers Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDrivers = drivers.filter((driver) => {
        const nameToSearch = (driver.first_name || driver.full_name || driver.username || "").toLowerCase();
        return nameToSearch.includes(searchQuery.toLowerCase());
    });

    const getInitialColor = (name: string) => {
        const colors = ["#dbeafe", "#d1fae5", "#fef3c7", "#ede9fe"];
        const charCode = (name || "U").charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const getInitialTextColor = (name: string) => {
        const colors = ["#2563eb", "#059669", "#d97706", "#7c3aed"];
        const charCode = (name || "U").charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const renderDriverCard = ({ item }: { item: any }) => {
        const name = item.first_name || item.full_name || item.username || "Unknown";
        const initial = name.charAt(0).toUpperCase();

        return (
            <ThemedView style={styles.driverCard}>
                <View style={[styles.avatarCircle, { backgroundColor: getInitialColor(name) }]}>
                    <ThemedText style={[styles.avatarText, { color: getInitialTextColor(name) }]}>{initial}</ThemedText>
                </View>

                <View style={styles.cardInfo}>
                    <ThemedText style={styles.nameText}>{name}</ThemedText>
                    <ThemedText style={styles.metaText}>
                        <Ionicons name="call" size={12} /> {item.phone_number || 'No Phone'}
                    </ThemedText>
                </View>

                <View style={styles.cardRight}>
                    <View style={styles.statusBadge}>
                        <ThemedText style={styles.statusTabText}>Active</ThemedText>
                    </View>
                </View>
            </ThemedView>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.title}>Drivers</ThemedText>
                        <ThemedText style={styles.subtitle}>ڈرائیورز کی فہرست</ThemedText>
                    </View>
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => router.push("/(tabs)/add-driver")}
                    >
                        <Ionicons name="add" size={22} color="#fff" />
                        <ThemedText style={styles.addButtonText}>Add New</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search driver name..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredDrivers}
                    renderItem={renderDriverCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDrivers} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            {isLoading ? <ActivityIndicator color="#111827" /> : <ThemedText>No drivers found</ThemedText>}
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#ffffff" },
    container: { flex: 1 },
    header: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        paddingHorizontal: 24, 
        paddingTop: 24, 
        marginBottom: 32 
    },
    title: { fontSize: 32, fontWeight: "900", color: "#000", lineHeight: 42, paddingBottom: 6 },
    subtitle: { fontSize: 20, color: "#94a3b8", fontWeight: "500", marginTop: 10 },
    addButton: { backgroundColor: "#000", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, gap: 4 },
    addButtonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
    searchRow: { paddingHorizontal: 24, marginBottom: 16 },
    searchContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#f8fafc", 
        borderRadius: 16, 
        paddingHorizontal: 16, 
        borderWidth: 1, 
        borderColor: "#f1f5f9" 
    },
    searchInput: { flex: 1, paddingVertical: 14, marginLeft: 12, fontSize: 15, fontWeight: "600", color: "#000" },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    driverCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#fff", 
        padding: 18, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: "#f1f5f9",
    },
    avatarCircle: { width: 52, height: 52, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 22, fontWeight: "900" },
    cardInfo: { flex: 1, marginLeft: 16 },
    nameText: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
    metaText: { fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: "600" },
    cardRight: { alignItems: "flex-end" },
    statusBadge: { backgroundColor: "#dbeafe", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusTabText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5, color: "#3b82f6" },
    empty: { alignItems: "center", marginTop: 60, padding: 40 },
});
