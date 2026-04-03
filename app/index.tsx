import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView 
      source={{ uri: 'https://cobr-prototype.vercel.app' }}
      style={{ flex: 1 }}
    />
  );
}