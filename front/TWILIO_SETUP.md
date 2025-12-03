# Guida Configurazione Twilio Voice Real-Time

Questa guida ti aiuterà a configurare Twilio per effettuare chiamate in tempo reale direttamente dal browser.

## Prerequisiti

- Account Twilio attivo
- Numero di telefono Twilio verificato
- Accesso alla Console Twilio

## Step 1: Ottieni Account SID e Auth Token

1. Vai su [Twilio Console](https://www.twilio.com/console)
2. Trovi **Account SID** e **Auth Token** nella sezione "Account Info"
3. Copia questi valori nel file `.env.local`

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Step 2: Crea API Key e Secret

Le API Keys sono necessarie per generare i token di accesso per il Voice SDK.

1. Vai su [API Keys & Tokens](https://console.twilio.com/us1/account/keys-credentials/api-keys)
2. Clicca su **Create API Key**
3. Inserisci un nome descrittivo (es. "Voice SDK Key")
4. Seleziona il tipo: **Standard**
5. Clicca su **Create**
6. **IMPORTANTE**: Copia il **SID** e il **Secret** subito (non potrai più visualizzare il secret)
7. Aggiungi al `.env.local`:

```env
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Crea TwiML App

La TwiML App gestisce il routing delle chiamate.

1. Vai su [TwiML Apps](https://console.twilio.com/us1/develop/voice/manage/twiml-apps)
2. Clicca su **Create new TwiML App**
3. Inserisci un nome (es. "Voice Real-Time App")
4. In **Voice Configuration**:
   - **Request URL**:
     - Per sviluppo locale: usa ngrok (vedi sotto)
     - Per produzione: `https://tuo-dominio.com/api/twilio/voice`
   - **HTTP Method**: POST
5. Clicca su **Create**
6. Copia il **SID** della TwiML App
7. Aggiungi al `.env.local`:

```env
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Configurazione per Sviluppo Locale (ngrok)

Per testare in locale, devi esporre il tuo server locale a Internet usando ngrok:

1. Installa [ngrok](https://ngrok.com/download)
2. Avvia il server Next.js:
   ```bash
   npm run dev
   ```
3. In un altro terminale, avvia ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copia l'URL HTTPS fornito da ngrok (es. `https://abc123.ngrok.io`)
5. Vai sulla TwiML App creata prima
6. Modifica il **Request URL** con: `https://abc123.ngrok.io/api/twilio/voice`
7. Salva

## Step 5: Verifica la Configurazione

Il tuo file `.env.local` dovrebbe avere questo formato:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# API Key e Secret per Twilio Voice SDK
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx

# TwiML App SID per Voice
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 6: Avvia l'Applicazione

1. Riavvia il server Next.js (se già in esecuzione):
   ```bash
   npm run dev
   ```
2. Apri il browser su `http://localhost:3000`
3. Dovresti vedere "Status: Pronto per chiamare" con un indicatore verde
4. Permetti l'accesso al microfono quando richiesto
5. Inserisci un numero di telefono e clicca su "Chiama"

## Troubleshooting

### Errore: "Configurazione Twilio incompleta"
- Verifica che tutte le variabili d'ambiente siano impostate correttamente
- Riavvia il server dopo aver modificato `.env.local`

### Errore: "Device error" o "Connection error"
- Controlla che la TwiML App abbia il Request URL corretto
- Se usi ngrok, verifica che sia ancora attivo (l'URL cambia ad ogni riavvio)
- Controlla i log della console del browser per dettagli

### La chiamata non si connette
- Verifica che il numero Twilio sia verificato e abbia credito
- Controlla che il numero destinatario sia in formato internazionale (es. +393331234567)
- Verifica che ngrok sia attivo e il webhook funzioni

### Errore "TwiML" nella console Twilio
- Vai su [Debugger](https://console.twilio.com/us1/monitor/debugger) per vedere dettagli dell'errore
- Verifica che l'endpoint `/api/twilio/voice` risponda correttamente

## Note Importanti

- **Costi**: Le chiamate VoIP Twilio hanno un costo. Controlla [i prezzi](https://www.twilio.com/voice/pricing)
- **Microfono**: Il browser chiederà permessi per accedere al microfono
- **HTTPS**: In produzione, il sito deve essere servito via HTTPS
- **ngrok**: Gli URL gratuiti di ngrok cambiano ad ogni riavvio. Per URL fissi, considera un piano a pagamento
- **Sicurezza**: Non committare mai il file `.env.local` su Git (è già nel `.gitignore`)

## Risorse Utili

- [Twilio Voice JavaScript SDK Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- [TwiML Voice Documentation](https://www.twilio.com/docs/voice/twiml)
- [Twilio Console](https://www.twilio.com/console)
- [Twilio Support](https://support.twilio.com)
