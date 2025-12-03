import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request) {
  console.log('[Twilio Voice] Webhook chiamato');
  console.log('[Twilio Voice] Headers:', Object.fromEntries(request.headers.entries()));

  try {
    // Twilio invia i dati come application/x-www-form-urlencoded
    const contentType = request.headers.get('content-type') || '';
    let params = new URLSearchParams();

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      params = new URLSearchParams(text);
      console.log('[Twilio Voice] Form Data:', Object.fromEntries(params.entries()));
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      // Convert FormData to URLSearchParams for uniform handling
      formData.forEach((value, key) => params.set(key, value));
      console.log('[Twilio Voice] Multipart Data:', Object.fromEntries(params.entries()));
    } else {
      console.log('[Twilio Voice] Unknown content type:', contentType);
    }

    // Estrai parametri (sia standard Twilio che custom)
    const to = params.get('To');
    const callSid = params.get('CallSid');
    const from = params.get('From');
    const accountSid = params.get('AccountSid');
    const apiVersion = params.get('ApiVersion');

    console.log('[Twilio Voice] Parametri estratti:', {
      to,
      callSid,
      from,
      accountSid,
      apiVersion,
      allParams: Object.fromEntries(params.entries())
    });
    console.log('[Twilio Voice] TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);

    const response = new VoiceResponse();

    // Validazione parametro To
    if (!to) {
      console.error('[Twilio Voice] Errore: numero destinatario mancante');
      console.error('[Twilio Voice] Parametri disponibili:', Object.fromEntries(params.entries()));
      response.say({ language: 'it-IT' }, 'Errore: nessun numero di telefono specificato');
      return new NextResponse(response.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Validazione formato numero (E.164: +[country code][number])
    if (!to.startsWith('+')) {
      console.error('[Twilio Voice] Errore: numero non in formato E.164:', to);
      response.say(
        { language: 'it-IT' },
        'Errore: il numero di telefono deve iniziare con il prefisso internazionale, ad esempio più tre nove tre'
      );
      return new NextResponse(response.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Verifica che TWILIO_PHONE_NUMBER sia configurato
    const callerId = process.env.TWILIO_PHONE_NUMBER;
    if (!callerId) {
      console.error('[Twilio Voice] Errore: TWILIO_PHONE_NUMBER non configurato');
      response.say({ language: 'it-IT' }, 'Errore di configurazione del sistema. Contattare l\'amministratore.');
      return new NextResponse(response.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    console.log('[Twilio Voice] Validazione completata. Connessione chiamata da', callerId, 'a', to);

    // NOTA: Media Stream disabilitato su Vercel (non supporta WebSocket)
    // Per abilitarlo, usa un server custom con `npm run dev:phone`
    // const host = process.env.MEDIA_STREAM_HOST || 'localhost:3000';
    // const protocol = host.includes('localhost') ? 'ws' : 'wss';
    // const streamUrl = `${protocol}://${host}/media-stream`;
    // response.start().stream({ url: streamUrl, track: 'both_tracks' });

    // Dial collega la chiamata dal browser al numero di telefono
    const dial = response.dial({
      callerId: callerId,
    });

    dial.number(to);

    const twiml = response.toString();
    console.log('[Twilio Voice] TwiML generato:', twiml);

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('[Twilio Voice] Errore:', error);
    console.error('[Twilio Voice] Stack trace:', error.stack);

    // IMPORTANTE: Restituire sempre un TwiML valido, mai un errore HTTP
    const response = new VoiceResponse();
    response.say(
      { language: 'it-IT' },
      `Si è verificato un errore nel sistema. ${error.message || 'Errore sconosciuto'}`
    );

    const twiml = response.toString();
    console.log('[Twilio Voice] TwiML di errore:', twiml);

    return new NextResponse(twiml, {
      status: 200, // SEMPRE 200, mai 500!
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

// Aggiungi validazione delle variabili d'ambiente all'avvio
if (!process.env.TWILIO_ACCOUNT_SID) {
  console.warn('[Twilio Voice] ATTENZIONE: TWILIO_ACCOUNT_SID non configurato');
}
if (!process.env.TWILIO_AUTH_TOKEN) {
  console.warn('[Twilio Voice] ATTENZIONE: TWILIO_AUTH_TOKEN non configurato');
}
if (!process.env.TWILIO_PHONE_NUMBER) {
  console.warn('[Twilio Voice] ATTENZIONE: TWILIO_PHONE_NUMBER non configurato');
}

// Twilio può anche fare GET per verificare l'endpoint
export async function GET() {
  const response = new VoiceResponse();
  response.say({ language: 'it-IT' }, 'Endpoint Twilio Voice attivo');
  
  return new NextResponse(response.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
