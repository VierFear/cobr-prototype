import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView 
      source={{ uri: 'http://192.168.0.199:3000' }}  // ← замени на свой IP
      style={{ flex: 1 }}
    />
  );
}