import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request) {
  try {
    const { to, message } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Il numero di telefono destinatario è richiesto' },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: 'Configurazione Twilio mancante. Controlla le variabili d\'ambiente.' },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    const twimlMessage = message || 'Ahoy, World';
    const twiml = `<Response><Say language="it-IT">${twimlMessage}</Say></Response>`;

    const call = await client.calls.create({
      from: fromNumber,
      to: to,
      twiml: twiml,
    });

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: 'Chiamata avviata con successo',
    });
  } catch (error) {
    console.error('Errore nella chiamata Twilio:', error);
    return NextResponse.json(
      {
        error: 'Errore durante l\'avvio della chiamata',
        details: error.message
      },
      { status: 500 }
    );
  }
}
