import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DrawerRoute = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  name: string;
};

const primaryRoutes: DrawerRoute[] = [
  { icon: "home-outline", label: "Inicio", name: "home" },
  { icon: "map-outline", label: "Explorar salas", name: "info-recorrido" },
];

const secondaryRoutes: DrawerRoute[] = [
  { icon: "business-outline", label: "Cambiar museo", name: "cambiar-museo" },
  { icon: "settings-outline", label: "Configuracion", name: "ajustes" },
  { icon: "help-circle-outline", label: "Ayuda", name: "ayuda" },
  { icon: "cube-outline", label: "Modo tecnico", name: "debug" },
];

export default function DrawerLayout() {
  const { museumProfile, resetVisitorExperience } = useMuseIQ();

  return (
    <Drawer
      drawerContent={(props) => {
        const activeRoute = props.state.routes[props.state.index]?.name;

        return (
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={styles.drawerContent}
            style={styles.drawerScroll}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <View style={styles.brandLockup}>
                  <Image
                    contentFit="contain"
                    source={require("@/assets/images/splash-icon.png")}
                    style={styles.brandMark}
                  />
                  <Text style={styles.drawerBrand}>
                    Muse<Text style={styles.brandAccent}>IQ</Text>
                  </Text>
                </View>

                <Pressable
                  onPress={() => props.navigation.closeDrawer()}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons color="#FFFFFF" name="close" size={23} />
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push("/perfil" as never)}
                style={({ pressed }) => [
                  styles.profileRow,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.avatar}>
                  <Ionicons color="#FFFFFF" name="person" size={30} />
                </View>
                <View style={styles.profileCopy}>
                  <Text style={styles.visitorName}>Visitante</Text>
                  <Text style={styles.profileLink}>Ver perfil</Text>
                </View>
              </Pressable>

              <Text numberOfLines={1} style={styles.drawerMuseum}>
                {museumProfile?.name ?? "Museo"}
              </Text>
            </View>

            <View style={styles.menuSection}>
              {primaryRoutes.map((item) => (
                <DrawerMenuItem
                  key={item.name}
                  active={activeRoute === item.name}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => router.push(`/${item.name}` as never)}
                />
              ))}
            </View>

            <View style={styles.separator} />

            <View style={styles.menuSection}>
              {secondaryRoutes.map((item) => (
                <DrawerMenuItem
                  key={item.name}
                  active={activeRoute === item.name}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => router.push(`/${item.name}` as never)}
                />
              ))}
            </View>

            <View style={styles.separator} />

            <Pressable
              onPress={() => {
                resetVisitorExperience()
                  .then(() => router.replace("/" as never))
                  .catch(() => undefined);
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color={musePalette.danger} name="log-out-outline" size={25} />
              <Text style={styles.logoutText}>Cerrar sesion</Text>
            </Pressable>
          </DrawerContentScrollView>
        );
      }}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#02070B",
          width: 292,
        },
        sceneStyle: {
          backgroundColor: musePalette.background,
        },
      }}
    >
      <Drawer.Screen name="home" />
      <Drawer.Screen name="info-recorrido" />
      <Drawer.Screen name="mis-visitas" options={{ drawerItemStyle: styles.hiddenDrawerItem }} />
      <Drawer.Screen name="favoritos" options={{ drawerItemStyle: styles.hiddenDrawerItem }} />
      <Drawer.Screen name="historial" options={{ drawerItemStyle: styles.hiddenDrawerItem }} />
      <Drawer.Screen name="perfil" options={{ drawerItemStyle: styles.hiddenDrawerItem }} />
      <Drawer.Screen name="cambiar-museo" />
      <Drawer.Screen name="idioma" options={{ drawerItemStyle: styles.hiddenDrawerItem }} />
      <Drawer.Screen name="ayuda" />
      <Drawer.Screen name="ajustes" />
      <Drawer.Screen name="debug" />
    </Drawer>
  );
}

function DrawerMenuItem({
  active,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        active ? styles.menuItemActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {active ? <View style={styles.activeRail} /> : null}
      <Ionicons color="#FFFFFF" name={icon} size={27} />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  drawerScroll: {
    backgroundColor: "#02070B",
  },
  drawerContent: {
    flexGrow: 1,
    paddingTop: 0,
  },
  drawerHeader: {
    gap: 20,
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandLockup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  brandMark: {
    height: 42,
    width: 42,
  },
  drawerBrand: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  brandAccent: {
    color: musePalette.primary,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.26)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  visitorName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  profileLink: {
    color: musePalette.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  drawerMuseum: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  menuSection: {
    gap: 2,
    paddingHorizontal: 14,
  },
  menuItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    minHeight: 58,
    overflow: "hidden",
    paddingHorizontal: 22,
    position: "relative",
  },
  menuItemActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  activeRail: {
    backgroundColor: musePalette.primary,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 5,
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  separator: {
    backgroundColor: "rgba(255,255,255,0.16)",
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 30,
    marginVertical: 16,
  },
  hiddenDrawerItem: {
    display: "none",
  },
  logoutButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    marginHorizontal: 14,
    minHeight: 58,
    paddingHorizontal: 22,
  },
  logoutText: {
    color: musePalette.danger,
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
  },
});
