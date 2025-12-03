import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const to = formData.get('To');

    console.log('[Twilio Voice] Richiesta ricevuta:', {
      to,
      callSid: formData.get('CallSid'),
      from: formData.get('From'),
      accountSid: formData.get('AccountSid'),
    });

    const response = new VoiceResponse();

    if (!to) {
      response.say({ language: 'it-IT' }, 'Errore: nessun numero di telefono specificato');
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Configura Media Stream URL per trascrizione AI
    // In production su Vercel, usa wss:// con il dominio personalizzato
    const host = process.env.MEDIA_STREAM_HOST || process.env.VERCEL_URL || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'ws' : 'wss';
    const streamUrl = `${protocol}://${host}/media-stream`;

    console.log('[Twilio Voice] Configurazione Media Stream:', streamUrl);

    // Avvia Media Stream per catturare audio bidirezionale
    response.start().stream({
      url: streamUrl,
      track: 'both_tracks' // Cattura sia caller che operator
    });

    // Dial collega la chiamata dal browser al numero di telefono
    const dial = response.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
    });

    dial.number(to);

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Errore nella gestione TwiML:', error);

    const response = new VoiceResponse();
    response.say({ language: 'it-IT' }, 'Si è verificato un errore');

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
