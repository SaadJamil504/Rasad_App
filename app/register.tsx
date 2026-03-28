import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  const [city, setCity] = useState("");

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
    if (!city.trim()) {
      Alert.alert("Error", "Please enter city/area");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
  };

  const handleStep3Complete = async () => {
    if (!perLiterPrice.trim()) {
      Alert.alert("Error", "Please enter per liter price");
      return;
    }
    if (!halfLiterPrice.trim()) {
      Alert.alert("Error", "Please enter half liter price");
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        businessName,
        ownerName,
        whatsapp,
        city,
        deliveryType,
        perLiterPrice,
        halfLiterPrice,
      };
      console.log("Registration data:", registrationData);

      // Simulating API call
      setTimeout(() => {
        setIsLoading(false);
        router.replace("/(tabs)");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Setup failed. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const renderProgressBar = () => {
    const steps = 3;
    return (
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
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
                <Text style={styles.stepNumber}>STEP 1/3</Text>
              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>Set up your business</Text>
              <Text style={styles.urduText}>اپنے کاروبار کو ترتیب دیں</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Name</Text>
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
                <Text style={styles.label}>WhatsApp</Text>
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
                <Text style={styles.label}>City / Area</Text>
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
                <Text style={styles.stepNumber}>STEP 2/3</Text>
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
                <Text style={styles.stepNumber}>STEP 3/3</Text>
              </View>

              {renderProgressBar()}

              <Text style={styles.heading}>Set your milk rate</Text>
              <Text style={styles.urduText}>اپنی دوہ کی شرح مقرر کریں</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Per Liter Rs</Text>
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
                <Text style={styles.label}>Half Liter Rs</Text>
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
                style={[styles.continueButton, styles.startButton]}
                onPress={handleStep3Complete}
                disabled={isLoading}
              >
                <Text style={styles.startButtonText}>
                  {isLoading ? "Setting up..." : "Start using Rasad 🚀"}
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
