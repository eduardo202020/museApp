import { musePalette } from '@/components/museiq/theme';
import { useMuseIQ } from '@/providers/museiq-provider';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

function CustomDrawerContent(props: any) {
  const { currentRoom, allPermissionsGranted, museumProfile } = useMuseIQ();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 12 }}>
      <View
        style={{
          backgroundColor: musePalette.surface,
          borderRadius: 24,
          marginHorizontal: 12,
          marginBottom: 18,
          padding: 18,
        }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          <Image contentFit="contain" source={require('@/assets/images/logo.png')} style={{ height: 42, width: 42 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: musePalette.primary, fontSize: 24, fontWeight: '900' }}>
              {museumProfile?.name ?? 'MuseIQ'}
            </Text>
            <Text style={{ color: musePalette.textMuted, fontSize: 13, fontWeight: '700' }}>
              {museumProfile?.routeName ?? 'Recorrido'}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 16 }}>
          <Text style={{ color: musePalette.text, fontSize: 14, fontWeight: '700' }}>
            Sala actual: {currentRoom?.name ?? 'Sin detectar'}
          </Text>
          <Text style={{ color: musePalette.textMuted, fontSize: 13 }}>
            Estado: {allPermissionsGranted ? currentRoom?.statusLabel ?? 'listo' : 'permisos incompletos'}
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: musePalette.primarySoft,
        drawerActiveTintColor: musePalette.primary,
        drawerInactiveTintColor: musePalette.textMuted,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '700',
          marginLeft: -12,
        },
        drawerStyle: {
          backgroundColor: musePalette.backgroundStrong,
          width: 300,
        },
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Recorrido',
          title: 'Recorrido',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="compass" size={size} />,
        }}
      />
      <Drawer.Screen
        name="ajustes"
        options={{
          drawerLabel: 'Ajustes',
          title: 'Ajustes',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} />,
        }}
      />
      <Drawer.Screen
        name="ayuda"
        options={{
          drawerLabel: 'Ayuda',
          title: 'Ayuda',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="help-circle-outline" size={size} />,
        }}
      />
    </Drawer>
  );
}
