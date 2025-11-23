import { StyleSheet, Image, View, Text, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
// FIX: Use 'legacy' import for SDK 54+ support
import * as FileSystem from 'expo-file-system/legacy';
import { useState, useRef } from 'react';
import { restoreImage, checkJobStatus } from '../../services/api'; 
import { Ionicons } from '@expo/vector-icons';

export default function RestoreScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const abortController = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setProcessedImage(null);
      setStatusMessage("");
    }
  };

  const handleProcess = async () => {
    if (!image) return;
    setLoading(true);
    setStatusMessage("Uploading...");
    
    abortController.current = new AbortController();

    try {
      const initialResponse = await restoreImage(image, abortController.current.signal);
      const jobId = initialResponse.job_id;
      if (!jobId) throw new Error("No Job ID received");

      setStatusMessage("AI Enhancing (Wait ~5-10 min)...");
      let attempts = 0;
      const maxAttempts = 500;
      
      intervalRef.current = setInterval(async () => {
        try {
          if (abortController.current?.signal.aborted) {
             if (intervalRef.current) clearInterval(intervalRef.current);
             return;
          }

          attempts++;
          const statusData = await checkJobStatus(jobId, abortController.current?.signal);
          console.log(`Attempt ${attempts}:`, statusData.status);

          if (statusData.status === 'completed' || statusData.status === 'success') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            let serverPath = "";
            if (statusData.results && statusData.results.length > 0) {
              serverPath = statusData.results[0].url;
            } else if (statusData.output_url) {
              serverPath = statusData.output_url;
            }

            if (serverPath) {
              const fullUrl = serverPath.startsWith('http') ? serverPath : `http://167.88.43.163:8001${serverPath}`;
              setProcessedImage(fullUrl);
              setLoading(false);
              setStatusMessage("Done!");
            }
          } else if (attempts >= maxAttempts) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            Alert.alert("Timeout", "Server took too long.");
            setLoading(false);
          }
        } catch (err: any) { 
            if (err.message !== 'Canceled') console.error(err); 
        }
      }, 2000); 

    } catch (e: any) {
      if (e.message !== 'Canceled') {
        Alert.alert("Error", `Failed: ${e.message}`);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setLoading(false);
    setStatusMessage("Canceled");
  };

  const handleSave = async () => {
    if (!processedImage) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        Alert.alert("Permission needed", "Please allow access to save photos.");
        return;
      }

      // Use Legacy FileSystem
      const fs = FileSystem as any;
      const docDir = fs.documentDirectory || fs.cacheDirectory;
      const fileUri = docDir + "upscaled_image.png";

      setLoading(true); 
      setStatusMessage("Downloading...");
      
      // This function exists in 'expo-file-system/legacy'
      const downloadRes = await FileSystem.downloadAsync(processedImage, fileUri);
      
      await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
      
      setLoading(false);
      Alert.alert("Saved!", "High-res image saved to your Gallery.");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Save Failed", e.message);
    }
  };

  const activeImage = isComparing ? image : (processedImage || image);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>✨ Super Upscaler</Text>
      
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#BB86FC" />
              <Text style={styles.loadingText}>{statusMessage}</Text>
            </View>
          ) : activeImage ? (
            <Pressable 
              onPressIn={() => processedImage && setIsComparing(true)} 
              onPressOut={() => setIsComparing(false)}
              style={{flex:1, width: '100%'}}
            >
              <Image source={{ uri: activeImage }} style={styles.image} resizeMode="contain" />
              {processedImage && (
                <View style={styles.compareBadge}>
                  <Text style={styles.compareText}>{isComparing ? "ORIGINAL" : "HOLD TO COMPARE"}</Text>
                </View>
              )}
            </Pressable>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={50} color="#555" />
              <Text style={styles.placeholderText}>Select low-res image</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        {!processedImage ? (
          <>
            {loading ? (
               <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                 <Ionicons name="close-circle" size={20} color="#fff" />
                 <Text style={styles.buttonText}>Cancel</Text>
               </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Pick Image</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.primaryButton, !image && styles.disabled]} 
                  onPress={handleProcess}
                  disabled={!image}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Enhance 4x</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => { setProcessedImage(null); setImage(null); }}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>New</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.successButton} onPress={handleSave}>
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#121212' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 20, textAlign: 'center', letterSpacing: 1 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 10, marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  imageContainer: { width: '100%', height: 350, borderRadius: 15, overflow: 'hidden', backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', opacity: 0.7 },
  placeholderText: { color: '#888', marginTop: 10, fontSize: 16 },
  loadingContainer: { alignItems: 'center', gap: 15 },
  loadingText: { color: '#BB86FC', fontSize: 16, fontWeight: '600' },
  compareBadge: { position: 'absolute', bottom: 15, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  compareText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  controls: { gap: 15 },
  pickButton: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  primaryButton: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, backgroundColor: '#CF6679', alignItems: 'center', justifyContent: 'center' }, 
  cancelButton: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, backgroundColor: '#CF6679', alignItems: 'center', justifyContent: 'center', width: '100%' },
  successButton: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, backgroundColor: '#03DAC6', alignItems: 'center', justifyContent: 'center', flex: 1 }, 
  secondaryButton: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 12, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', flex: 1 },
  buttonText: { fontWeight: '700', color: '#fff', fontSize: 16 },
  resultActions: { flexDirection: 'row', gap: 15 },
  disabled: { opacity: 0.5 }
});