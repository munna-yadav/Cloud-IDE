import { io, Socket } from 'socket.io-client';

type CodeUpdatePayload = {
  fileId: string;
  content: string;
};

type CursorUpdatePayload = {
  userId: string;
  cursor: {
    lineNumber: number;
    column: number;
  };
};

type CodeChangePayload = {
  projectId: string;
  fileId: string;
  content: string;
};

type CursorMovePayload = CursorUpdatePayload & {
  projectId: string;
};

type ServerToClientEvents = {
  'code-update': (payload: CodeUpdatePayload) => void;
  'cursor-update': (payload: CursorUpdatePayload) => void;
};

type ClientToServerEvents = {
  'join-project': (projectId: string) => void;
  'leave-project': (projectId: string) => void;
  'code-change': (payload: CodeChangePayload) => void;
  'cursor-move': (payload: CursorMovePayload) => void;
};

const deriveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (typeof apiUrl === 'string') {
    try {
      const url = new URL(apiUrl);
      // Strip trailing /api if present to point to the same origin as the API.
      const pathname = url.pathname.replace(/\/api\/?$/, '/');
      url.pathname = pathname;
      return url.toString().replace(/\/$/, '');
    } catch (error) {
      console.warn('[socket] Failed to derive socket URL from VITE_API_URL', error);
    }
  }

  return 'http://localhost:4000';
};

const SOCKET_URL = deriveSocketUrl();

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function ensureSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket'],
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export const socketClient = {
  joinProject(projectId: string) {
    const s = ensureSocket();
    s.emit('join-project', projectId);
    return s;
  },
  leaveProject(projectId: string) {
    socket?.emit('leave-project', projectId);
  },
  emitCodeChange(payload: CodeChangePayload) {
    ensureSocket().emit('code-change', payload);
  },
  emitCursorMove(payload: CursorMovePayload) {
    ensureSocket().emit('cursor-move', payload);
  },
  onCodeUpdate(handler: (payload: CodeUpdatePayload) => void) {
    const s = ensureSocket();
    s.on('code-update', handler);
    return () => s.off('code-update', handler);
  },
  onCursorUpdate(handler: (payload: CursorUpdatePayload) => void) {
    const s = ensureSocket();
    s.on('cursor-update', handler);
    return () => s.off('cursor-update', handler);
  },
  disconnect() {
    socket?.disconnect();
    socket = null;
  },
};

export type { CodeUpdatePayload, CursorUpdatePayload };

