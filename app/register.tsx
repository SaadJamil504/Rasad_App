import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ENDPOINTS } from "../constants/Api";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // Step 2: Delivery Type
  const [deliveryType, setDeliveryType] = useState("solo");

  // Step 3: Milk Rate
  const [perLiterPrice, setPerLiterPrice] = useState("");
  const [halfLiterPrice, setHalfLiterPrice] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleStep1Continue = () => {
    if (!businessName.trim()) {
      Alert.alert("Error", "Please enter business name");
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!whatsapp.trim()) {
      Alert.alert("Error", "Please enter WhatsApp number");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Error", "Please enter city/area");
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
  };

  const handleStep3Continue = () => {
    if (!perLiterPrice.trim()) {
      Alert.alert("Error", "Please enter per liter price");
      return;
    }
    if (!halfLiterPrice.trim()) {
      Alert.alert("Error", "Please enter half liter price");
      return;
    }
    setCurrentStep(4);
  };

  const handleStep4Complete = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          full_name: ownerName,
          phone_number: whatsapp,
          email: email,
          role: 'owner',
          house_no: "N/A",
          street: "N/A",
          area: "N/A",
          city: city, // User's input from the Address field
          address: city, // User's input from the Address field
          latitude: "24.8607", // Default placeholder
          longitude: "67.0011", // Default placeholder
          dairy_name: businessName,
          cow_price: perLiterPrice,
          buffalo_price: halfLiterPrice,
        }),





      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ Backend returned HTML instead of JSON:", text.substring(0, 500));
        Alert.alert("Server Error", "Registration failed. The server returned an invalid response.");
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        setIsLoading(false);
        Alert.alert("Success", "Account created successfully! Please login.", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      } else {
        setIsLoading(false);
        // Better error handling for Django REST Framework
        let errorMessage = "Something went wrong. Please check your details.";
        if (data.error) errorMessage = data.error;
        else if (data.detail) errorMessage = data.detail;
        else if (typeof data === 'object') {
          // If data is a dictionary of fields, join them
          const firstKey = Object.keys(data)[0];
          const firstError = data[firstKey];
          errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
        
        Alert.alert("Registration Failed", errorMessage);
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Registration Error:", error);
      Alert.alert("Connection Error", "Could not connect to the server. Please check your internet.");
    }
  };


  const handleBackToLogin = () => {
    router.back();
  };

  const renderProgressBar = () => {
    const steps = 3;
    return (
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressBar,
              step <= currentStep ? styles.progressBarActive : {},
            ]}
          />
        ))}

      </View>
    );
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
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Q1 — Business Info</Text>
                <Text style={styles.stepNumber}>STEP 1/4</Text>

              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>Set up your business</Text>
              <Text style={styles.urduText}>اپنے کاروبار کو ترتیب دیں</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dairy Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ahmed Doodh Wala"
                  placeholderTextColor="#999"
                  value={businessName}
                  onChangeText={setBusinessName}
                  editable={!isLoading}
                />
              </View>


              <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#999"
                  value={ownerName}
                  onChangeText={setOwnerName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone No</Text>
                <TextInput
                  style={styles.input}
                  placeholder="03XX-XXXXXXX"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  editable={!isLoading}
                />
              </View>


              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Johar Town, Lahore"
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                  editable={!isLoading}
                />
              </View>



              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleStep1Continue}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Delivery Type */}
          {currentStep === 2 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Q2 — Delivery Type</Text>
                <Text style={styles.stepNumber}>STEP 2/4</Text>

              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>How do you deliver?</Text>
              <Text style={styles.urduText}>آپ کیسے ڈیلیور کریں گے؟</Text>

              {/* Option 1: Solo */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  deliveryType === "solo" && styles.optionCardSelected,
                ]}
                onPress={() => setDeliveryType("solo")}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionEmoji}>🚕</Text>
                  <Text style={styles.optionTitle}>I deliver myself</Text>
                </View>
                <Text style={styles.optionUrdu}>
                  سولو — تمام راستے آپ کے ہیں
                </Text>
                <Text style={styles.optionSubtitle}>
                  Solo — all routes are yours
                </Text>
              </TouchableOpacity>

              {/* Option 2: Team */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  deliveryType === "team" && styles.optionCardSelected,
                ]}
                onPress={() => setDeliveryType("team")}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionEmoji}>👥</Text>
                  <Text style={styles.optionTitle}>I have a team</Text>
                </View>
                <Text style={styles.optionUrdu}>میرے پاس ٹیم ہے</Text>
                <Text style={styles.optionSubtitle}>
                  Multiple drivers on routes
                </Text>
              </TouchableOpacity>

              {/* Option 3: Add Later */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  styles.optionCardLight,
                  deliveryType === "later" && styles.optionCardSelected,
                ]}
                onPress={() => setDeliveryType("later")}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionEmoji}>⚡</Text>
                  <Text style={styles.optionTitle}>
                    Add drivers later anytime
                  </Text>
                </View>
                <Text style={styles.optionUrdu}>
                  ڈرائیور بعد میں کبھی بھی شامل کریں
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleStep2Continue}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Milk Rate */}
          {currentStep === 3 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Q3 — Milk Rate</Text>
                <Text style={styles.stepNumber}>STEP 3/4</Text>

              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>Set your milk rate</Text>
              <Text style={styles.urduText}>اپنی دوہ کی شرح مقرر کریں</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cow Milk Price (Rs)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="210"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={perLiterPrice}
                  onChangeText={setPerLiterPrice}
                  editable={!isLoading}
                />
              </View>


              <View style={styles.inputContainer}>
                <Text style={styles.label}>Buffalo Milk Price (Rs)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="105"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={halfLiterPrice}
                  onChangeText={setHalfLiterPrice}
                  editable={!isLoading}
                />
              </View>


              {/* Info Box */}
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxCheckmark}>✓</Text>
                <Text style={styles.infoBoxText}>
                  Per-customer overrides possible
                </Text>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleStep3Continue}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 4: Security */}
          {currentStep === 4 && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Q4 — Account Security</Text>
                <Text style={styles.stepNumber}>STEP 4/4</Text>
              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>Secure your account</Text>
              <Text style={styles.urduText}>اپنا اکاؤنٹ محفوظ کریں</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Create Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                />
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxCheckmark}>🛡️</Text>
                <Text style={styles.infoBoxText}>
                  Use a strong password to keep data safe
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.continueButton, styles.startButton]}
                onPress={handleStep4Complete}
                disabled={isLoading}
              >
                <Text style={styles.startButtonText}>
                  {isLoading ? "Creating Account..." : "Start using Rasad 🚀"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    paddingVertical: 10,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AAA",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: "#000000",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 4,
    fontFamily: 'system-ui apple-system blinkmacsystemfont segoe ui roboto sans-serif',
  },
  urduText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  optionCard: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  optionCardSelected: {
    borderColor: "#000000",
    backgroundColor: "#F8F8F8",
  },
  optionCardLight: {
    backgroundColor: "#F0F8FF",
    borderColor: "#B0D9FF",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  optionUrdu: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginLeft: 30,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#999",
    marginLeft: 30,
  },
  infoBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoBoxCheckmark: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 10,
    fontWeight: "bold",
  },
  infoBoxText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#000000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#22C55E",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
