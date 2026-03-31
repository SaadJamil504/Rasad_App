import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ENDPOINTS } from "../constants/Api";

export default function DriverSignupScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  
  // Validation State
  const [invitationData, setInvitationData] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      Alert.alert("Invalid Link", "This invitation link is missing a token.");
      setIsValidating(false);
    }
  }, [token]);

  const validateToken = async () => {
    setIsValidating(true);
    try {
      // @ts-ignore
      const url = typeof ENDPOINTS.INVITATION_VALIDATE === 'function' ? ENDPOINTS.INVITATION_VALIDATE(token) : "";
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setInvitationData(data);
        setEmail(data.email || "");
      } else {
        Alert.alert("Invalid Link", data.detail || "This link is expired or invalid.");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Token Validation Error:", error);
      Alert.alert("Connection Error", "Could not reach the server. Try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        token: token,
        email: email,
        password: password,
        full_name: fullName,
        phone_number: phoneNumber,
        role: "driver"
      };

      const response = await fetch(ENDPOINTS.INVITATION_SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Driver account created successfully! Please login.", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      } else {
        const errorMsg = data.detail || Object.values(data).flat().join("\n");
        Alert.alert("Signup Failed", errorMsg);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Connection Error", "Something went wrong. Please check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
        <ThemedText style={{ marginTop: 16 }}>Validating driver invite...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Driver Portal</ThemedText>
          <ThemedText style={styles.subtitle}>Complete your profile to start delivering.</ThemedText>
        </View>

        <ThemedView style={styles.card}>
            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    style={styles.input}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Phone Number</ThemedText>
                <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="03XX-XXXXXXX"
                    style={styles.input}
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Create a strong password"
                />
            </View>

            <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Re-enter password"
                />
            </View>

            <Pressable
                style={styles.primaryButton}
                onPress={handleSignup}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <ThemedText style={styles.primaryButtonText}>Finish Signup</ThemedText>
                )}
            </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#111827",
    height: 54,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
}); 
