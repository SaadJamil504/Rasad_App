import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from "../constants/Api";

import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Owner");
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["Owner", "Driver", "Customer"];

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password,
          role: selectedRole.toLowerCase(),
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ Backend returned HTML instead of JSON. First 500 chars:", text.substring(0, 500));
        Alert.alert("Server Error", "The server returned an invalid response. Check your backend terminal.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Save the access token securely
        if (data.access) {
          await SecureStore.setItemAsync('userToken', data.access);
        }
        
        setIsLoading(false);
        // Success: Redirect based on role
        if (selectedRole === "Customer") {
          router.replace("/(customer)" as any);
        } else if (selectedRole === "Driver") {
          router.replace("/(driver)" as any);
        } else {
          router.replace("/(tabs)" as any);
        }

      } else {
        setIsLoading(false);
        Alert.alert("Login Failed", data.error || data.detail || "Invalid phone number or password");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login Error:", error);
      Alert.alert("Connection Error", "Could not connect to the server. Please check your internet and backend.");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo Circle */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>R</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Rasad</Text>

          {/* Subtitle with Urdu text */}
          <Text style={styles.subtitle}>راساد</Text>
          <Text style={styles.subtitleEn}>Milk delivery, organised.</Text>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  selectedRole === role && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === role && styles.roleButtonTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone number / فون نمبر"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password / پیش رفتہ"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing in..." : "Sign in →"}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>New? </Text>
            <Pressable onPress={handleRegister}>
              <Text style={styles.registerLink}>Create account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  content: {
    width: "100%",
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    marginBottom: 18,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "500",
  },
  subtitleEn: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "400",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
    width: "100%",
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
  },
  roleButtonSelected: {
    borderColor: "#000000",
    backgroundColor: "#000000",
  },
  roleButtonText: {
    fontSize: 13,
    color: "#999999",
    fontWeight: "500",
  },
  roleButtonTextSelected: {
    color: "#FFFFFF",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  registerText: {
    fontSize: 14,
    color: "#666666",
  },
  registerLink: {
    fontSize: 14,
    color: "#0099FF",
    fontWeight: "600",
  },
});
