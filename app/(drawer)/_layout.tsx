import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, View } from "react-native";

export default function DrawerLayout() {
  const { museumProfile } = useMuseIQ();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.drawerContent}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerBrand}>MuseIQ</Text>
            <Text style={styles.drawerMuseum}>
              {museumProfile?.name ?? "Museo"}
            </Text>
          </View>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: musePalette.primarySoft,
        drawerActiveTintColor: musePalette.primaryStrong,
        drawerInactiveTintColor: musePalette.textMuted,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "700",
          marginLeft: -12,
        },
        drawerStyle: {
          backgroundColor: musePalette.surface,
          width: 292,
        },
        sceneStyle: {
          backgroundColor: musePalette.background,
        },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: "Recorrido",
          title: "Recorrido",
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="compass-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="info-recorrido"
        options={{
          drawerLabel: "Info del recorrido",
          title: "Info del recorrido",
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="map-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="ayuda"
        options={{
          drawerLabel: "Ayuda y FAQ",
          title: "Ayuda y FAQ",
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="help-circle-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="ajustes"
        options={{
          drawerLabel: "Ajustes",
          title: "Ajustes",
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="options-outline" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="debug"
        options={{
          drawerLabel: "Modo tecnico",
          title: "Modo tecnico",
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="build-outline" size={size} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0,
  },
  drawerHeader: {
    backgroundColor: "#F2F7FD",
    borderBottomColor: musePalette.border,
    borderBottomWidth: 1,
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  drawerBrand: {
    color: musePalette.primaryStrong,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  drawerMuseum: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
