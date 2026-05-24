import { SensorPanel } from "@/components/museiq/home/sensor-panel";
import { QrScannerOverlay } from "@/components/museiq/home/qr-scanner-overlay";
import { HomeExploreSheet } from "@/features/home/components/home-explore-sheet";
import { HomeHud } from "@/features/home/components/home-hud";
import { HomeSceneState } from "@/features/home/components/home-scene-state";
import { useHomeScreenController } from "@/features/home/hooks/use-home-screen-controller";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    activeSheet,
    artworkTitleForQr,
    centralLabel,
    currentArtworkId,
    debugModeEnabled,
    dismissSuggestion,
    isArtworkNarrationPlaying,
    isRoomDetected,
    isSuggestionVisible,
    isTorchOn,
    museumName,
    openArtworkDetail,
    openExploreSheet,
    openManualCodeEntry,
    openQrScanner,
    repeatArtworkNarration,
    roomArtworks,
    roomName,
    sensorPanelProps,
    setIsTorchOn,
    shouldShowSuggestionCta,
    suggestedArtwork,
    suggestedArtworkImageSource,
    topRoomLabel,
    visitedArtworkIds,
    closeQrScanner,
    handleCentralAction,
    handleExploreOtherSuggestions,
    handleMockQrScan,
    handleViewSuggestedAr,
  } = useHomeScreenController();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.cameraShade} />
      <SafeAreaView style={styles.safeArea}>
        <HomeHud
          centralLabel={centralLabel}
          isArtworkNarrationPlaying={isArtworkNarrationPlaying}
          onCentralAction={handleCentralAction}
          onExplore={openExploreSheet}
          onOpenDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
          onOpenQr={openQrScanner}
          onRepeatArtworkNarration={repeatArtworkNarration}
          shouldShowSuggestionCta={shouldShowSuggestionCta}
          topRoomLabel={topRoomLabel}
        />

        {activeSheet === "qr" ? (
          <QrScannerOverlay
            artworkTitle={artworkTitleForQr}
            isTorchOn={isTorchOn}
            museumName={museumName}
            onCancel={closeQrScanner}
            onManualEntry={openManualCodeEntry}
            onMockScan={handleMockQrScan}
            onToggleTorch={() => setIsTorchOn((value) => !value)}
            roomName={roomName}
          />
        ) : (
          <HomeSceneState
            isRoomDetected={isRoomDetected}
            isSuggestionVisible={isSuggestionVisible}
            onCloseSuggestion={dismissSuggestion}
            onExploreOtherSuggestions={handleExploreOtherSuggestions}
            onViewSuggestedAr={handleViewSuggestedAr}
            roomName={roomName}
            shouldShowSuggestionCta={shouldShowSuggestionCta}
            suggestedArtwork={suggestedArtwork}
            suggestedArtworkImageSource={suggestedArtworkImageSource}
          />
        )}
      </SafeAreaView>

      {activeSheet === "explore" ? (
        <HomeExploreSheet
          currentArtworkId={currentArtworkId}
          isRoomDetected={isRoomDetected}
          onArtworkPress={openArtworkDetail}
          onClose={closeQrScanner}
          roomArtworks={roomArtworks}
          roomName={roomName}
          visitedArtworkIds={visitedArtworkIds}
        />
      ) : null}

      {debugModeEnabled ? <SensorPanel {...sensorPanelProps} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  cameraShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.22)",
  },
  safeArea: {
    flex: 1,
  },
});
