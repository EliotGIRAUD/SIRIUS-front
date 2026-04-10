import { setSetupComplete } from "@/lib/local-session";
import { useDogStore } from "@/hooks/useDogStore";
import { useThemedStyles } from "@/hooks/use-themed-styles";
import { getFirebaseAuth } from "@/lib/firebase";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SETUP_DOG_BACKGROUND_PATTERN_OPACITY = 0.8;

const GOLDEN_URL = "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80";
const BREEDS = [
  { id: "golden_retriever", label: "Golden Retriever" },
  { id: "husky", label: "Husky" },
  { id: "beagle", label: "Beagle" },
];

export default function SetupDogScreen() {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"breed" | "name">("breed");
  const [breedIndex, setBreedIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const initDog = useDogStore((s) => s.initDog);
  const { colors: c, styles: s } = useThemedStyles();
  const breed = BREEDS[breedIndex]?.id ?? BREEDS[0].id;
  const breedLabel = BREEDS[breedIndex]?.label ?? BREEDS[0].label;

  function onPrevBreed() {
    setBreedIndex((v) => (v - 1 + BREEDS.length) % BREEDS.length);
  }

  function onNextBreed() {
    setBreedIndex((v) => (v + 1) % BREEDS.length);
  }

  function onConfirmBreed() {
    setStep("name");
  }

  async function onStart() {
    const nom = name.trim();
    if (!nom) {
      Alert.alert("Nom", "Indiquer un nom pour le chien");
      return;
    }
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      const user = auth?.currentUser ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }

      await useDogStore.getState().hydrateUserIdFromStorage();
      const idToken = await user.getIdToken();
      const apiOk = await useDogStore.getState().authApiLogin({ idToken });
      if (!apiOk) {
        Alert.alert("Erreur", "POST /init-dog a échoué");
        return;
      }

      const ok = await initDog(nom, breed);
      if (!ok) {
        Alert.alert("Erreur", "POST /init-dog a échoué");
        return;
      }
      await setSetupComplete(true);
      router.replace("/(tabs)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[s.formFlowScreen, styles.screen]}>
      <Image
        source={require("../assets/images/pawbackground.svg")}
        style={[styles.backgroundPawPattern, { opacity: SETUP_DOG_BACKGROUND_PATTERN_OPACITY }]}
        contentFit="cover"
        transition={0}
      />

      <View style={styles.content}>
        <Text style={styles.caption}>{step === "breed" ? "Choix du chien..." : "Choix du nom..."}</Text>
        <Text style={styles.title}>{step === "breed" ? breedLabel : "Quel est son nom ?"}</Text>

        {step === "breed" ? (
          <>
            <View style={styles.cardWrap}>
              <View style={styles.cardBack} />
              <View style={styles.cardFront}>
                <Image source={{ uri: GOLDEN_URL }} style={styles.dogImage} contentFit="contain" />
              </View>
            </View>

            <View style={styles.carouselControls}>
              <Pressable style={styles.circleButton} onPress={onPrevBreed}>
                <Ionicons name="arrow-back" size={28} color="#3B090C" />
              </Pressable>
              <Pressable style={styles.circleButtonPrimary} onPress={onConfirmBreed}>
                <Ionicons name="checkmark" size={34} color="#FBE4CE" />
              </Pressable>
              <Pressable style={styles.circleButton} onPress={onNextBreed}>
                <Ionicons name="arrow-forward" size={28} color="#3B090C" />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.nameStepWrap}>
            <TextInput style={[s.textField, styles.nameField]} placeholder="ex. Sirius" placeholderTextColor={c.textMuted} value={name} onChangeText={setName} autoFocus />
            <View style={styles.nameActions}>
              <Pressable style={styles.circleButton} onPress={() => setStep("breed")}>
                <Ionicons name="arrow-back" size={28} color="#3B090C" />
              </Pressable>
              <Pressable style={[styles.primaryAction, busy && s.disabled]} onPress={onStart} disabled={busy}>
                {busy ? <ActivityIndicator color="#FBE4CE" /> : <Text style={styles.primaryActionLabel}>Valider</Text>}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FBE4CE",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: 44,
  },
  backgroundPawPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  caption: {
    color: "#3B090C80",
    fontSize: 34 / 2,
    marginTop: 8,
  },
  title: {
    color: "#3B090C",
    fontFamily: "Modak",
    fontWeight: "400",
    fontSize: 61 / 2,
    lineHeight: 1.1 * (61 / 2),
    textAlign: "center",
    minHeight: 70,
  },
  cardWrap: {
    marginTop: 14,
    width: "100%",
    alignItems: "center",
  },
  cardBack: {
    position: "absolute",
    top: 18,
    width: 300,
    height: 445,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "#F2EBE4",
    backgroundColor: "#F7F3EE",
    transform: [{ rotate: "8deg" }],
  },
  cardFront: {
    width: 300,
    height: 445,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "#F2EBE4",
    backgroundColor: "#EEF0F2",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  dogImage: {
    width: "100%",
    height: "86%",
  },
  carouselControls: {
    marginTop: -34,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circleButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  circleButtonPrimary: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#3B090C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
  nameStepWrap: {
    width: "100%",
    marginTop: 44,
    gap: 20,
    alignItems: "center",
  },
  nameField: {
    width: "100%",
    maxWidth: 360,
    minHeight: 64,
    borderRadius: 24,
    backgroundColor: "#3B090C0D",
    color: "#3B090C",
    fontSize: 18,
    paddingHorizontal: 20,
  },
  nameActions: {
    width: "100%",
    maxWidth: 360,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryAction: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 26,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B090C",
  },
  primaryActionLabel: {
    color: "#FBE4CE",
    fontSize: 18,
    fontWeight: "700",
  },
});
