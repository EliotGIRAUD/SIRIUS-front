import { isSetupComplete } from "@/lib/local-session";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type SlideConfig = {
  title: string;
  text: string;
  image: number;
  imageSide: "left" | "right";
  imageTopRatio: number;
  imageOffsetRatio: number;
  imageScale: number;
};

const SLIDES: SlideConfig[] = [
  {
    title: "Prêt pour\nl'aventure ?",
    text: "Adopter un chien, c'est bien plus qu'un coup de cœur. C'est une promesse de vie quotidienne et d'amour à partager.",
    image: require("../assets/images/browndogleft.svg"),
    imageSide: "left",
    imageTopRatio: 0.04,
    imageOffsetRatio: 0.16,
    imageScale: 1.2,
  },
  {
    title: "30 jours pour\ntout comprendre",
    text: "Budget, balades, imprévus...\nVis la vraie vie avant d'adopter.",
    image: require("../assets/images/browndogright.svg"),
    imageSide: "right",
    imageTopRatio: 0.05,
    imageOffsetRatio: 0.16,
    imageScale: 1.2,
  },
  {
    title: "Apprivoise\navant d'adopter",
    text: "Tu deviens responsable pour toujours.\nCommence ta simulation maintenant.",
    image: require("../assets/images/whitedogleft.svg"),
    imageSide: "left",
    imageTopRatio: 0.04,
    imageOffsetRatio: 0.14,
    imageScale: 1.12,
  },
];
const BUTTON_RING_SIZE = 92;
const BUTTON_RING_STROKE = 5;
const BUTTON_RING_RADIUS = (BUTTON_RING_SIZE - BUTTON_RING_STROKE) / 2;
const BUTTON_RING_CIRCUMFERENCE = 2 * Math.PI * BUTTON_RING_RADIUS;
const DOG_RATIO = 402 / 436;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function CheckupScreen() {
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const alreadyDone = await isSetupComplete();
      if (!cancelled && alreadyDone) {
        router.replace("/setup-dog");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLast = step >= SLIDES.length - 1;
  const currentSlide = SLIDES[step];
  const ringProgress = (step + 1) / SLIDES.length;

  const baseImageHeight = clamp(screenHeight * 0.54, 320, 436) * currentSlide.imageScale;
  const slideImageHeight = Math.min(baseImageHeight, screenHeight * 0.74);
  const slideImageWidth = slideImageHeight * DOG_RATIO;
  const slideImageTop = clamp(screenHeight * currentSlide.imageTopRatio, 20, 64);
  const slideImageLeft =
    currentSlide.imageSide === "left"
      ? -(slideImageWidth * currentSlide.imageOffsetRatio)
      : screenWidth - slideImageWidth + slideImageWidth * currentSlide.imageOffsetRatio;
  const contentTop = slideImageTop + slideImageHeight - clamp(screenHeight * 0.14, 80, 118);
  const buttonBottom = clamp(screenHeight * 0.06, 34, 56);

  function onNext() {
    if (isTransitioning) return;
    if (isLast) {
      router.replace("/setup-dog");
      return;
    }
    setIsTransitioning(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setStep((v) => Math.min(SLIDES.length - 1, v + 1));
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  }

  return (
    <View style={[styles.screen, { width: screenWidth, height: screenHeight }]}>
      <Image
        source={require("../assets/images/pawbackground.svg")}
        style={styles.backgroundPawPattern}
        contentFit="cover"
        transition={0}
      />

      <Animated.View style={[styles.slideAnimatedLayer, { opacity: fadeAnim }]}>
        <Image
          key={`slide-image-${step}`}
          source={currentSlide.image}
          style={[
            styles.slideImage,
            {
              top: slideImageTop,
              width: slideImageWidth,
              height: slideImageHeight,
              left: slideImageLeft,
            },
          ]}
          contentFit="contain"
          transition={0}
        />

        <View style={[styles.slideContent, { marginTop: contentTop }]}>
          <View style={styles.slideCard}>
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideText}>{currentSlide.text}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.slideButtonWrap, { bottom: buttonBottom }]}>
        <Svg width={BUTTON_RING_SIZE} height={BUTTON_RING_SIZE} viewBox={`0 0 ${BUTTON_RING_SIZE} ${BUTTON_RING_SIZE}`} style={styles.slideButtonArc}>
          <Circle
            cx={BUTTON_RING_SIZE / 2}
            cy={BUTTON_RING_SIZE / 2}
            r={BUTTON_RING_RADIUS}
            stroke="#FBE4CE"
            strokeWidth={BUTTON_RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${BUTTON_RING_CIRCUMFERENCE * ringProgress} ${BUTTON_RING_CIRCUMFERENCE}`}
            transform={`rotate(-90 ${BUTTON_RING_SIZE / 2} ${BUTTON_RING_SIZE / 2})`}
          />
        </Svg>
        <Pressable style={styles.slideArrowButton} onPress={onNext} disabled={isTransitioning}>
          <Text style={styles.slideArrowLabel}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#3B090C",
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 0,
    position: "relative",
    overflow: "hidden",
  },
  backgroundPawPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  slideImage: {
    position: "absolute",
    opacity: 1,
  },
  slideAnimatedLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  slideContent: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  slideCard: {
    width: "94%",
    borderRadius: 18,
    padding: 8,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  slideTitle: {
    marginBottom: 18,
    color: "#FBE4CE",
    fontFamily: "Modak",
    fontWeight: "400",
    fontSize: 35,
    lineHeight: 35,
    letterSpacing: 0,
    textAlign: "center",
    maxWidth: 280,
  },
  slideText: {
    color: "#FBE4CE",
    fontFamily: "Montserrat",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: "center",
    maxWidth: 285,
  },
  slideButtonWrap: {
    position: "absolute",
    width: 130,
    height: 130,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    marginLeft: -65,
  },
  slideButtonArc: {
    position: "absolute",
    top: 19,
    left: 19,
  },
  slideArrowButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignSelf: "center",
    backgroundColor: "#FBE4CE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FBE4CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 54,
    elevation: 10,
  },
  slideArrowLabel: {
    color: "#3B090C",
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "500",
  },
});
