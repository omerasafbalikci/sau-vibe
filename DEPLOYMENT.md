# SAU Vibe — Deployment Guide

## Yerel Geliştirme (Docker ile)

```bash
# 1. .env dosyasını oluştur
cp .env.example .env
# .env içindeki GOOGLE_API_KEY ve diğer değerleri doldur

# 2. Tüm servisleri başlat (tek komut)
docker compose up --build

# Servisler:
# Frontend  → http://localhost:3000
# Backend   → http://localhost:8080
# AI Model  → http://localhost:8000
# PostgreSQL→ localhost:5432
# Redis     → localhost:6379
```

## Canlı Ortam (Ücretsiz)

### Frontend → Vercel
1. [vercel.com](https://vercel.com) → "New Project" → GitHub repo seç
2. Root Directory: `apps/frontend`
3. Environment Variables ekle:
   - `NEXT_PUBLIC_API_URL` = Render backend URL'i
   - `NEXT_PUBLIC_WS_URL` = Render backend WS URL'i
   - `NEXT_PUBLIC_OPENWEATHER_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_PRESET`
4. Deploy → otomatik URL alırsın

### Database → Supabase
1. [supabase.com](https://supabase.com) → "New Project"
2. Settings → Database → Connection String kopyala
3. Backend'in `SPRING_DATASOURCE_URL`'ini bununla güncelle

### Redis → Upstash
1. [upstash.com](https://upstash.com) → "Create Database" → Redis
2. Host, Port, Password değerlerini al
3. Backend env'e ekle

### Backend → Render
1. [render.com](https://render.com) → "New Web Service"
2. Root Directory: `apps/backend`
3. Environment: Docker
4. Environment Variables ekle (Supabase + Upstash bilgileri)

### AI Model → Render
1. "New Web Service" → Root: `apps/CampusAssistantRag`
2. `GOOGLE_API_KEY` ekle
3. Disk ekle: `/app/chroma_db` (vektör DB kalıcı kalsın)

## Kubernetes (Lokal Demo)

```bash
# Minikube başlat
minikube start

# Secret oluştur
kubectl create secret generic sau-secret \
  --from-literal=POSTGRES_PASSWORD=sauvibe123 \
  --from-literal=GOOGLE_API_KEY=your_key

# Deploy et
kubectl apply -f k8s/

# Servisleri gör
kubectl get pods -n sau-vibe
kubectl get services -n sau-vibe

# Backend'e eriş
minikube service backend-service -n sau-vibe
```

## CI/CD (GitHub Actions)

`main` branch'e push edildiğinde otomatik:
1. Frontend build → Vercel'e deploy
2. Backend build + test (PostgreSQL + Redis test container ile)
3. AI model build + lint

### Gerekli GitHub Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WS_URL
OPENWEATHER_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_PRESET
```
