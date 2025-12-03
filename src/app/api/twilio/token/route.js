import { NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET(request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      return NextResponse.json(
        { error: 'Configurazione Twilio incompleta. Controlla le variabili d\'ambiente.' },
        { status: 500 }
      );
    }

    // Genera un identity univoco per questo client
    const identity = `user_${Date.now()}`;

    // Crea un Access Token
    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
      ttl: 3600, // Token valido per 1 ora
    });

    // Crea un Voice Grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    // Aggiungi il grant al token
    token.addGrant(voiceGrant);

    return NextResponse.json({
      token: token.toJwt(),
      identity: identity,
    });
  } catch (error) {
    console.error('Errore nella generazione del token:', error);
    return NextResponse.json(
      {
        error: 'Errore durante la generazione del token',
        details: error.message
      },
      { status: 500 }
    );
  }
}
