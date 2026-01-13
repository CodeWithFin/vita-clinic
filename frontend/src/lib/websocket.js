import { queueData, myPosition, estimatedWait } from '../stores/queue.js';

let socket = null;
let reconnectInterval = null;

export function connectWebSocket() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No token found, skipping WebSocket connection');
    return;
  }
  
  // Use native WebSocket
  socket = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
  
  socket.onopen = () => {
    console.log('WebSocket connected');
    subscribeToQueue();
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'queue-update') {
        queueData.set(data.queue || []);
        if (data.myPosition !== undefined) {
          myPosition.set(data.myPosition);
        }
        if (data.estimatedWait !== undefined) {
          estimatedWait.set(data.estimatedWait);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket disconnected');
    // Auto-reconnect after 5 seconds
    reconnectInterval = setTimeout(() => {
      connectWebSocket();
    }, 5000);
  };
  
  return socket;
}

export function disconnectWebSocket() {
  if (reconnectInterval) {
    clearTimeout(reconnectInterval);
    reconnectInterval = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function subscribeToQueue() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'subscribe-queue' }));
  }
}

export function unsubscribeFromQueue() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'unsubscribe-queue' }));
  }
}

