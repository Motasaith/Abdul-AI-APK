import { StyleSheet, View, Text, Image, ScrollView, Switch, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
// 1. Import the hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  
  // 2. Get safe area insets
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => Linking.openURL(url);

  return (
    <ScrollView 
      style={styles.container} 
      // 3. Add dynamic padding to contentContainerStyle (Scrollable area)
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
    >
      <Text style={styles.headerTitle}>Explore</Text>

      {/* Developer Card */}
      <View style={styles.devCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={{fontSize: 30}}>👨‍💻</Text>
          </View>
        </View>
        <Text style={styles.devName}>Abdul Rauf Azhar</Text>
        <Text style={styles.devRole}>Lead Developer & AI Engineer</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity onPress={() => openLink('https://github.com/Motasaith')} style={styles.socialBtn}>
            <Ionicons name="logo-github" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.linkedin.com/in/abdul-rauf-azhar-5750a3378/')} style={styles.socialBtn}>
            <Ionicons name="logo-linkedin" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://react-portfolio-five-rho-14.vercel.app/')} style={styles.socialBtn}>
            <Ionicons name="globe-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Section */}
      <Text style={styles.sectionTitle}>App Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={22} color="#BB86FC" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <Switch 
          value={notifications} 
          onValueChange={setNotifications}
          trackColor={{ false: "#767577", true: "#BB86FC" }}
          thumbColor={notifications ? "#fff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="save-outline" size={22} color="#BB86FC" />
          <Text style={styles.settingText}>Auto-Save to Gallery</Text>
        </View>
        <Switch 
          value={autoSave} 
          onValueChange={setAutoSave}
          trackColor={{ false: "#767577", true: "#BB86FC" }}
          thumbColor={autoSave ? "#fff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="server-outline" size={22} color="#BB86FC" />
          <Text style={styles.settingText}>VPS Status</Text>
        </View>
        <Text style={{color: '#03DAC6', fontWeight: 'bold'}}>Online</Text>
      </View>

      <Text style={styles.footerText}>Version 1.0.0 • Powered by Abdul AI</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 20 },
  
  devCard: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 30, borderTopWidth: 4, borderTopColor: '#BB86FC' },
  avatarContainer: { marginBottom: 15, shadowColor: '#BB86FC', shadowOpacity: 0.5, shadowRadius: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#BB86FC' },
  devName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  devRole: { fontSize: 14, color: '#888', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 5 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 10 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  footerText: { textAlign: 'center', color: '#555', marginTop: 30, marginBottom: 10 } // Reduced bottom margin since padding handles it
});