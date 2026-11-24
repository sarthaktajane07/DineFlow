import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getWsUrl = () => {
  if (process.env.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL;
  }
  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:5000/ws';
  }
  return 'ws://localhost:5000/ws';
};

export function useRealtime(onEvent: (event: string, payload: any) => void) {
  const clientRef = useRef<Client | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let client: Client;

    const setup = async () => {
      const token = await SecureStore.getItemAsync('token');
      const wsUrl = getWsUrl();

      client = new Client({
        brokerURL: wsUrl,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        client.subscribe('/topic/all', (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.event && onEventRef.current) {
              onEventRef.current(body.event, body.payload);
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        });
      };

      client.activate();
      clientRef.current = client;
    };

    setup();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return clientRef;
}
