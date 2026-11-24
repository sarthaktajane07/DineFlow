import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Polyfill global for sockjs-client if needed
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

/**
 * Custom hook to connect to Spring Boot WebSocket STOMP broker.
 * Subscribes to /topic/all and invokes onEvent(event, payload).
 */
export function useRealtime(onEvent) {
  const clientRef = useRef(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const serverOrigin = apiUrl.replace(/\/api$/, '');
    const wsUrl = import.meta.env.VITE_WS_URL || `${serverOrigin}/ws`;

    const token = localStorage.getItem('token');

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (msg) => {
        if (import.meta.env.DEV) {
          // console.debug('[STOMP]', msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Connected to STOMP WebSocket at', wsUrl);

      client.subscribe('/topic/all', (message) => {
        try {
          const body = JSON.parse(message.body);
          if (body.event && onEventRef.current) {
            onEventRef.current(body.event, body.payload);
          }
        } catch (e) {
          console.error('Failed to parse STOMP message:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return clientRef;
}
