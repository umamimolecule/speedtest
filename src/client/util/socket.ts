import { CloseEvent, MessageEvent } from 'ws';

export type WebsocketEvent = (event: Event) => any;

export const connectToWebSocketServer = async (
  url: string,
  onOpen: (event: Event) => any,
  onMessage: (event: MessageEvent) => any,
  onClose: (event: CloseEvent) => any,
  onError: (event: Event) => any
) => {
  const socket = new WebSocket(url);
  socket.addEventListener('open', onOpen.bind(socket));
  socket.addEventListener('message', onMessage.bind(socket));
  socket.addEventListener('close', onClose.bind(socket));
  socket.addEventListener('error', onError.bind(socket));

  // Wait until socket server ready
  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (socket.readyState === 1) {
        clearInterval(timer);
        resolve(socket);
      }
    }, 10);
  });

  return socket;
};
