import { musePalette } from '@/components/museiq/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: musePalette.primary,
        tabBarInactiveTintColor: '#7691A7',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopWidth: 0,
          height: 84,
          paddingTop: 8,
          paddingBottom: 18,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="recorrido"
        options={{
          title: 'Recorrido',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'map' : 'map-outline'} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="obras"
        options={{
          title: 'Obras',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'images' : 'images-outline'} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mi-visita"
        options={{
          title: 'Mi visita',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons color={color} name={focused ? 'time' : 'time-outline'} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
