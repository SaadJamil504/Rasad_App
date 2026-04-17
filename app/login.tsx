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
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        
        // Save user info for global access
        if (data.role) {
          await SecureStore.setItemAsync('userRole', data.role);
        }

        setIsLoading(false);
        
        // Success: Redirect based on role returned from backend
        const userRole = data.role?.toLowerCase();
        
        if (userRole === "customer") {
          router.replace("/(customer)" as any);
        } else if (userRole === "driver") {
          router.replace("/(driver)" as any);
        } else if (userRole === "owner") {
          router.replace("/(tabs)" as any);
        } else {
          // Fallback if role is missing or unknown
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

  const handleBypassLogin = async () => {
    setPhoneNumber("03010779759");
    setPassword("saad1234");
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: "03010779759",
          password: "saad1234",
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ Bypass Login Error: Backend returned HTML instead of JSON.", text.substring(0, 500));
        Alert.alert("Server Error", "The server returned an invalid response.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        if (data.access) await SecureStore.setItemAsync('userToken', data.access);
        if (data.role) await SecureStore.setItemAsync('userRole', data.role);
        
        setIsLoading(false);
        const userRole = data.role?.toLowerCase();
        
        if (userRole === "customer") {
          router.replace("/(customer)" as any);
        } else if (userRole === "driver") {
          router.replace("/(driver)" as any);
        } else {
          router.replace("/(tabs)" as any);
        }
      } else {
        setIsLoading(false);
        Alert.alert("Bypass Login Failed", data.error || data.detail || "Invalid hardcoded credentials");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Bypass Login Error:", error);
      Alert.alert("Connection Error", "Could not connect to the server.");
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
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password / پیش رفتہ"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
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

          {/* Bypass Login Button */}
          <TouchableOpacity
            style={[
              styles.bypassButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleBypassLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.bypassButtonText}>
              {isLoading ? "Please wait..." : "Bypass Login (Owner) ⚡"}
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
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
  },
  eyeIcon: {
    paddingRight: 16,
    justifyContent: "center",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  bypassButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  bypassButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
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
