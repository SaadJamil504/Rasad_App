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
    TouchableOpacity
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
        if (activeFilter === "Active") return matchesSearch; // Everyone in this list is role: customer
        return matchesSearch;
    });

    const getStatusInfo = (customer: any) => {
        const balance = parseFloat(customer.outstanding_balance || 0);
        if (balance > 0) return { label: "Overdue", color: "#ef4444", bg: "#fee2e2" };
        if (balance === 0) return { label: "Clear", color: "#10b981", bg: "#d1fae5" };
        return { label: "Active", color: "#3b82f6", bg: "#dbeafe" };
    };

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
                        #{item.id}  •  {item.area || item.city || 'Unassigned'}  •  {parseFloat(item.daily_quantity || 0).toFixed(1)}L/d
                    </ThemedText>
                </View>

                <View style={styles.cardRight}>
                    <View style={styles.balanceContainer}>
                        <ThemedText style={[styles.rsPrefix, { color: status.color }]}>Rs</ThemedText>
                        <ThemedText style={[styles.balanceText, { color: status.color }]}>
                            {balance.toLocaleString()}
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
                    </View>
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => router.push("/(tabs)/add-customer")}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <ThemedText style={styles.addButtonText}>Add</ThemedText>
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
    safeArea: { flex: 1, backgroundColor: "#f8fafc" },
    container: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
    title: { fontSize: 28, fontWeight: "900", color: "#111827" },
    urduTitle: { fontSize: 18, color: "#9ca3af", marginTop: -4 },
    addButton: { backgroundColor: "#000", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 4 },
    addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    searchRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 15 },
    searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e2e8f0" },
    searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15 },
    filterOutline: { backgroundColor: "#f1f5f9", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
    filterOutlineText: { color: "#475569", fontWeight: "700" },
    filterTabs: { flexDirection: "row", backgroundColor: "#f1f5f9", marginHorizontal: 20, borderRadius: 15, padding: 4, marginBottom: 15 },
    filterTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
    activeFilterTab: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    filterTabText: { color: "#64748b", fontWeight: "700", fontSize: 13 },
    activeFilterText: { color: "#111827" },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    customerCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1.5, borderColor: "#e2e8f0" },
    avatarCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 20, fontWeight: "900" },
    cardInfo: { flex: 1, marginLeft: 15 },
    nameText: { fontSize: 17, fontWeight: "800", color: "#1e293b" },
    metaText: { fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: "600" },
    cardRight: { alignItems: "flex-end" },
    balanceContainer: { flexDirection: "row", alignItems: "baseline", gap: 2 },
    rsPrefix: { fontSize: 12, fontWeight: "800" },
    balanceText: { fontSize: 18, fontWeight: "900" },
    statusBadge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusTabText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
    empty: { alignItems: "center", marginTop: 50 },
});
