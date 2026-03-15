import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCreateMeal } from "../../hooks/useMeals";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

function nowDateString() {
  return new Date().toISOString().split("T")[0];
}

function nowTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CameraScreen() {
  const router = useRouter();
  const createMeal = useCreateMeal();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>("lunch");
  const [date] = useState(nowDateString);
  const [time] = useState(nowTimeString);
  const [notes, setNotes] = useState("");

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed to take meal photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Photo library access is needed to select meal photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!imageUri) {
      Alert.alert("No image", "Please take or select a photo first.");
      return;
    }

    const formData = new FormData();
    formData.append("meal_type", mealType);
    formData.append("date", date);
    formData.append("time", time);
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }

    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1] ?? "jpg";

    formData.append("image", {
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
      name: `meal.${fileType}`,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    } as unknown as Blob);

    try {
      const meal = await createMeal.mutateAsync(formData);
      // Reset form
      setImageUri(null);
      setNotes("");
      // Navigate to meal detail
      router.push(`/meal/${meal.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze meal.";
      Alert.alert("Error", message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Log a Meal</Text>

        {/* Image preview or buttons */}
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.changeBtnText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnIcon}>{"\u{1F4F7}"}</Text>
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Text style={styles.photoBtnIcon}>{"\u{1F5BC}"}</Text>
              <Text style={styles.photoBtnText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meal type picker */}
        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.mealTypeRow}>
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeBtn,
                mealType === type && styles.mealTypeBtnActive,
              ]}
              onPress={() => setMealType(type)}
            >
              <Text
                style={[
                  styles.mealTypeBtnText,
                  mealType === type && styles.mealTypeBtnTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date & Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.dateTimeValue}>{date}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.dateTimeValue}>{time}</Text>
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. extra sauce on the side"
          multiline
          numberOfLines={3}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, createMeal.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={createMeal.isPending}
        >
          {createMeal.isPending ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.submitBtnText}> Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.submitBtnText}>Analyze Meal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photoBtnIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  preview: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 8,
  },
  changeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  changeBtnText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 12,
  },
  mealTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  mealTypeBtnActive: {
    backgroundColor: "#4CAF50",
  },
  mealTypeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  mealTypeBtnTextActive: {
    color: "#FFF",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeValue: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  notesInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
