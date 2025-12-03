/**
 * Server-Sent Events (SSE) endpoint per streaming trascrizioni in real-time
 * Alternativa a WebSocket che funziona attraverso HTTP standard
 */

// Map globale per tenere traccia delle connessioni SSE attive
// Questo deve essere condiviso con il Media Stream handler
if (!global.sseConnections) {
  global.sseConnections = new Map();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('callSid');

  if (!callSid) {
    return new Response('Missing callSid parameter', { status: 400 });
  }

  console.log(`[SSE] Client connected for call ${callSid}`);

  // Setup SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  };

  // Create readable stream for SSE
  const encoder = new TextEncoder();

  let intervalId;
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = {
        type: 'connected',
        timestamp: new Date().toISOString(),
        callSid
      };

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      // Store controller in global map so we can send messages later
      global.sseConnections.set(callSid, {
        controller,
        encoder,
        callSid,
        connectedAt: Date.now()
      });

      // Send keep-alive ping every 15 seconds
      intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (error) {
          console.error(`[SSE] Error sending ping for ${callSid}:`, error);
          clearInterval(intervalId);
        }
      }, 15000);

      console.log(`[SSE] Stream started for call ${callSid}`);
    },

    cancel() {
      console.log(`[SSE] Client disconnected for call ${callSid}`);
      global.sseConnections.delete(callSid);
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  });

  return new Response(stream, { headers });
}

/**
 * Helper function to send data to SSE client
 * Called from other parts of the app (e.g., Media Stream handler)
 */
export function sendToSSEClient(callSid, data) {
  const connection = global.sseConnections.get(callSid);

  if (!connection) {
    console.warn(`[SSE] No active connection for call ${callSid}`);
    return false;
  }

  try {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    connection.controller.enqueue(connection.encoder.encode(message));
    return true;
  } catch (error) {
    console.error(`[SSE] Error sending to ${callSid}:`, error);
    global.sseConnections.delete(callSid);
    return false;
  }
}
