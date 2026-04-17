import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View, Switch } from 'react-native';
import { useLanguage } from "../../contexts/LanguageContext";

export default function OwnerSettings() {
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>{t.settings}</ThemedText>
          <ThemedText style={styles.subtitle}>{t.preferences}</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={32} color="#1d4ed8" />
          </View>
          <View>
            <ThemedText style={styles.userName}>{t.ownerDashboard}</ThemedText>
            <ThemedText style={styles.userRole}>{t.sysAdmin}</ThemedText>
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>{t.generalSettings}</ThemedText>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
              </View>
              <ThemedText style={styles.menuText}>{t.notifications}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
              </View>
              <ThemedText style={styles.menuText}>{t.security}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
          <View style={[styles.menuItem, { paddingVertical: 12 }]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fefce8' }]}>
                <Ionicons name="language-outline" size={20} color="#eab308" />
              </View>
              <ThemedText style={styles.menuText}>{t.languageStr}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText style={{ fontSize: 12, color: language === 'en' ? '#3b82f6' : '#9ca3af', fontWeight: 'bold' }}>EN</ThemedText>
              <Switch 
                value={language === 'ur'}
                onValueChange={toggleLanguage}
                trackColor={{ false: "#e2e8f0", true: "#e2e8f0" }}
                thumbColor={language === 'ur' ? "#10b981" : "#3b82f6"}
              />
              <ThemedText style={{ fontSize: 12, color: language === 'ur' ? '#10b981' : '#9ca3af', fontWeight: 'bold' }}>UR</ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>{t.support}</ThemedText>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#a855f7" />
              </View>
              <ThemedText style={styles.menuText}>{t.helpCenter}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#f97316" />
              </View>
              <ThemedText style={styles.menuText}>{t.aboutApp}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace("/login")}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <ThemedText style={styles.logoutText}>{t.signOut}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    lineHeight: 42,
    paddingBottom: 6,
  },
  subtitle: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
  },
});
