import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SideMenu({ isVisible, onClose }: SideMenuProps) {
  const router = useRouter();

  if (!isVisible) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push({ pathname: path as any });
  };

  return (
    <View style={styles.drawerOverlay}>
      <View style={styles.drawerContent}>
        <View style={styles.drawerHeader}>
          <ThemedText type="title" style={styles.drawerTitle}>
            Menu
          </ThemedText>
          <Pressable onPress={onClose}>
            <ThemedText style={styles.closeIcon}>✕</ThemedText>
          </Pressable>
        </View>
        <View style={styles.drawerMenu}>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/")}
          >
            <ThemedText style={styles.drawerItemText}>Dashboard</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/customers")}
          >
            <ThemedText style={styles.drawerItemText}>Customers</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/routes")}
          >
            <ThemedText style={styles.drawerItemText}>Routes</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/entry")}
          >
            <ThemedText style={styles.drawerItemText}>Entry</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/payments")}
          >
            <ThemedText style={styles.drawerItemText}>Payments</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => navigateTo("/settings")}
          >
            <ThemedText style={styles.drawerItemText}>Settings</ThemedText>
          </Pressable>
          <Pressable
            style={styles.drawerItem}
            onPress={() => router.replace("/login")}
          >
            <ThemedText style={[styles.drawerItemText, styles.logoutText]}>Logout</ThemedText>
          </Pressable>
        </View>
      </View>
      <Pressable
        style={styles.drawerBackdrop}
        onPress={onClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 0.5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContent: {
    flex: 0.5,
    backgroundColor: "#fff",
    paddingTop: 40, // Increased for status bar safety
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeIcon: {
    fontSize: 24,
    color: "#6b7280",
  },
  drawerMenu: {
    paddingVertical: 12,
  },
  drawerItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  drawerItemText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  logoutText: {
    color: "#ef4444",
  },
});
