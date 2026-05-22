import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { env } from '../config/env';
import axios from 'axios';

export const initWebSocketServer = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, pathname);
    });
  });

  wss.on('connection', (ws: WebSocket, request: any, pathname: string) => {
    console.log(`🔌 WebSocket connection established on path: ${pathname}`);

    if (pathname.includes('/ws/nova')) {
      handleNovaSocket(ws);
    } else if (pathname.includes('/ws/teacher')) {
      handleTeacherSocket(ws);
    } else {
      // Default fallback messaging channel
      ws.on('message', (message: string) => {
        ws.send(JSON.stringify({ status: 'echo', data: message.toString() }));
      });
    }

    ws.on('close', () => {
      console.log(`🔌 WebSocket connection closed on path: ${pathname}`);
    });
  });

  return wss;
};

// Handle real-time Socratic feedback token streaming for NovaChat
const handleNovaSocket = (ws: WebSocket) => {
  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const { text, studentId } = data;

      if (!text) {
        ws.send(JSON.stringify({ error: 'Text prompt is required' }));
        return;
      }

      // Socratic streaming connection to FastAPI AI engine
      ws.send(JSON.stringify({ type: 'start' }));

      // Synchronous wait generator simulating streamed chunks
      const sendToken = (token: string, delay: number) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            ws.send(JSON.stringify({ type: 'token', token }));
            resolve();
          }, delay);
        });
      };

      let reply = '';
      try {
        const response = await axios.post(`${env.AI_ENGINE_URL}/nova/chat`, {
          student_id: studentId || 'student_123',
          text: text,
          current_theta: 0.0,
          recent_errors: []
        }, { timeout: 15000 });
        
        reply = response.data.response;
        console.log(`[Nova WS] Successfully fetched Socratic response from AI Engine.`);
      } catch (aiErr: any) {
        console.warn(`[WARN] Failed to contact AI Engine: ${aiErr.message}. Dropping to local fallback.`);
        // Fallback to local high-premium templates
        if (text.toLowerCase().includes('normal') || text.toLowerCase().includes('database')) {
          reply = "A great question! In Professor Sharma's DBMS Slide 14, he describes Normalization as organizing data to reduce redundancy. Instead of giving you the formula, let me ask: what structural problems arise if we store a student's address repeatedly alongside every single quiz grade?";
        } else if (text.toLowerCase().includes('cricket')) {
          reply = "Ah! Since you mentioned cricket, database normalization is like organizing a kit bag. Instead of dumping widgets, pads, and balls together, we segregate them into specific compartments. What kinds of compartments should we build for bowlers vs batsmen?";
        } else {
          reply = `I hear you! To connect this to your GATE prep: how does this concept relate to functional dependencies, or should we review Professor Sharma's class slides first?`;
        }
      }

      // Stream the response word by word (split by spaces) to show high-premium fluid micro-interactions
      const tokens = reply.split(' ');
      for (const token of tokens) {
        await sendToken(token + ' ', 50);
      }

      ws.send(JSON.stringify({ type: 'end' }));
    } catch (err: any) {
      ws.send(JSON.stringify({ error: 'Failed to process socket message: ' + err.message }));
    }
  });
};

// Handle real-time alert broadcasts for teachers
const handleTeacherSocket = (ws: WebSocket) => {
  // Push a welcome message or alerts
  ws.send(JSON.stringify({
    type: 'alert_feed',
    alerts: [
      { id: 'a1', studentName: 'Priya Sharma', riskLevel: 'low', message: 'Priya has completed the normalization quiz with advanced ability +1.45 θ!', timestamp: new Date() }
    ]
  }));

  ws.on('message', (message: string) => {
    console.log('[Teacher WS] Message received:', message.toString());
  });
};
