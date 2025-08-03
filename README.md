# MagicRoute Frontend

MagicRoute uygulamasının React frontend'i.

## 🚀 Deployment

Bu proje Vercel'de ayrı bir proje olarak deploy edilir.

### Environment Variables

Vercel'de aşağıdaki environment variable'ları ayarlayın:

- `REACT_APP_MAPBOX_TOKEN`: Mapbox API token
- `NODE_ENV`: production

### Backend Connection

Frontend, backend'e `https://magicroute-backend.vercel.app` adresinden bağlanır.

## 🔧 Local Development

```bash
npm install
npm start
```

Frontend `http://localhost:3000` adresinde çalışacak.

## 📱 Features

- Route planning ve optimizasyon
- Sipariş yönetimi
- Müşteri yönetimi
- Analitik dashboard
- Real-time updates (Socket.IO)
