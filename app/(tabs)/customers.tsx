import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    TouchableOpacity,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from "../../constants/Api";

export default function CustomersScreen() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"All" | "Overdue" | "Active">("All");

    useFocusEffect(
        useCallback(() => {
            fetchCustomers();
        }, [])
    );

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) return;

            const response = await fetch(ENDPOINTS.CUSTOMERS_LIST as string, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            console.log("DEBUG: Customers Staff API:", JSON.stringify(data));

            if (response.status === 401 || data.code === "token_not_valid") {
                Alert.alert("Session Expired", "Your session has expired. Please log in again.");
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userRole');
                router.replace('/login');
                return;
            }

            const list = Array.isArray(data) ? data : (data.results || []);
            setCustomers(list);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // BUILT-IN FAILSAFE: Check first_name, full_name, AND username
    const filteredCustomers = customers.filter((customer) => {
        const nameToSearch = (customer.first_name || customer.full_name || customer.username || "").toLowerCase();
        const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
        
        const balanceNum = parseFloat(customer.outstanding_balance || 0);
        
        if (activeFilter === "Overdue") return matchesSearch && balanceNum > 0;
        if (activeFilter === "Active") return matchesSearch && balanceNum <= 0;
        return matchesSearch;
    });

    const getStatusInfo = (customer: any) => {
        const balance = parseFloat(customer.outstanding_balance || 0);
        if (balance > 0) return { label: "Overdue", color: "#ef4444", bg: "#fee2e2" };
        return { label: "Active", color: "#3b82f6", bg: "#dbeafe" };
    };

    const getInitialColor = (name: string) => {
        const colors = ["#f8fafc", "#f0fdf4", "#eff6ff", "#fef2f2"];
        const charCode = (name || "U").charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const getInitialTextColor = (name: string) => {
        const colors = ["#64748b", "#10b981", "#3b82f6", "#ef4444"];
        const charCode = (name || "U").charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    const renderCustomerCard = ({ item }: { item: any }) => {
        const status = getStatusInfo(item);
        const name = item.first_name || item.full_name || item.username || "Unknown";
        const initial = name.charAt(0).toUpperCase();
        const balance = parseFloat(item.outstanding_balance || 0);

        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.customerCard}
                onPress={() => router.push({ pathname: "/customer-details", params: { id: item.id } })}
            >
                <View style={[styles.avatarCircle, { backgroundColor: getInitialColor(name) }]}>
                    <ThemedText style={[styles.avatarText, { color: getInitialTextColor(name) }]}>{initial}</ThemedText>
                </View>

                <View style={styles.cardInfo}>
                    <ThemedText style={styles.nameText}>{name}</ThemedText>
                    <ThemedText style={styles.metaText}>
                        {item.area || item.city || 'Unassigned Area'}  •  {parseFloat(item.daily_quantity || 0).toFixed(1)}L/day
                    </ThemedText>
                </View>

                <View style={styles.cardRight}>
                    <View style={styles.balanceContainer}>
                        {balance > 0 && <ThemedText style={[styles.rsPrefix, { color: status.color }]}>Rs</ThemedText>}
                        <ThemedText style={[styles.balanceText, { color: status.color }]}>
                            {balance > 0 ? balance.toLocaleString() : "Clear"}
                        </ThemedText>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <ThemedText style={[styles.statusTabText, { color: status.color }]}>{status.label}</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.title}>Customers</ThemedText>
                        <ThemedText style={styles.subtitle}>صارفین کی فہرست</ThemedText>
                    </View>
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => router.push("/(tabs)/add-customer")}
                    >
                        <Ionicons name="add" size={22} color="#fff" />
                        <ThemedText style={styles.addButtonText}>Add New</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search name or reg no..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.filterTabs}>
                    {(["All", "Overdue", "Active"] as const).map((f) => (
                        <Pressable 
                            key={f} 
                            onPress={() => setActiveFilter(f)}
                            style={[styles.filterTab, activeFilter === f && styles.activeFilterTab]}
                        >
                            <ThemedText style={[styles.filterTabText, activeFilter === f && styles.activeFilterText]}>
                                {f}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                <FlatList
                    data={filteredCustomers}
                    renderItem={renderCustomerCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCustomers} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            {isLoading ? <ActivityIndicator color="#111827" /> : <ThemedText>No customers found</ThemedText>}
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
    filterTabs: { flexDirection: "row", backgroundColor: "#f1f5f9", marginHorizontal: 24, borderRadius: 16, padding: 4, marginBottom: 20 },
    filterTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
    activeFilterTab: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    filterTabText: { color: "#64748b", fontWeight: "800", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" },
    activeFilterText: { color: "#000" },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    customerCard: { 
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
    balanceContainer: { flexDirection: "row", alignItems: "baseline", gap: 2 },
    rsPrefix: { fontSize: 12, fontWeight: "800" },
    balanceText: { fontSize: 20, fontWeight: "900" },
    statusBadge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusTabText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
    empty: { alignItems: "center", marginTop: 60, padding: 40 },
});
