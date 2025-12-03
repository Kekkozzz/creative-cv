# Phone Assistant - Integrazione Twilio + AI

Questa sezione del progetto integra un centralino telefonico automatizzato con AI per trascrizione real-time.

## Funzionalità

- **Chiamate VoIP dal browser** tramite Twilio Voice SDK
- **Trascrizione real-time** con Google Gemini AI
- **Analisi sentiment e intent** della conversazione
- **Suggerimenti AI** per l'operatore in tempo reale
- **Storage locale** delle trascrizioni

## Requisiti

### Variabili d'ambiente

Crea un file `.env.local` nella root del progetto con:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_PHONE_NUMBER=+1234567890

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Media Stream Configuration
MEDIA_STREAM_HOST=francescoromito.dev
```

### Configurazione Twilio

1. Crea un account su [Twilio Console](https://console.twilio.com)
2. Acquista un numero di telefono
3. Crea una TwiML App con Voice Request URL: `https://francescoromito.dev/api/twilio/voice`
4. Genera API Key e Secret dalle impostazioni account

## Scripts

### Development

```bash
# Standard Next.js (senza WebSocket - solo frontend)
npm run dev

# Con WebSocket per Phone Assistant (server custom)
npm run dev:phone
```

### Production

```bash
npm run build
npm run start

# O con server custom per WebSocket
npm run start:phone
```

## Architettura

```
/phone                    → UI Phone Assistant
/api/twilio/token         → Genera token Twilio per client
/api/twilio/voice         → TwiML per gestione chiamate
/api/twilio/call          → Avvia chiamate programmatiche
/api/transcriptions/stream → SSE per trascrizioni real-time
/media-stream             → WebSocket per Twilio Media Streams
```

## Note su Vercel

⚠️ **WebSocket non supportati nativamente su Vercel**

Per il deploy su Vercel, hai due opzioni:

1. **Solo UI senza trascrizione AI**: Funziona, ma la trascrizione real-time non sarà disponibile
2. **Server separato**: Deploya `server.js` su Railway, Render, o un VPS per gestire i WebSocket

### Configurazione per Vercel (senza WebSocket)

Le chiamate Twilio funzioneranno, ma senza trascrizione real-time. Per abilitare la trascrizione:

1. Deploya il server su un servizio che supporta WebSocket
2. Aggiorna `MEDIA_STREAM_HOST` con l'URL del server WebSocket
3. Configura la TwiML App di Twilio con il nuovo URL

## Troubleshooting

### Errore "Configurazione Twilio incompleta"
Verifica che tutte le variabili d'ambiente siano configurate in `.env.local`

### WebSocket connection failed
- In development: Usa `npm run dev:phone` invece di `npm run dev`
- In production: Assicurati che il server WebSocket sia raggiungibile

### Nessuna trascrizione durante la chiamata
- Verifica che `GEMINI_API_KEY` sia configurata
- Controlla i log del server per errori Gemini API
