# Demarrage Rapide

Architecture actuelle:
- Frontend Angular (4200)
- Backend Spring Boot (8083)
- IA externe via Groq API

## 1) Lancer les services

Windows:

cd Gestion-de-Stock
START_ALL_SERVICES.bat

Linux/Mac:

cd Gestion-de-Stock
chmod +x START_ALL_SERVICES.sh
./START_ALL_SERVICES.sh

## 2) Ouvrir l application

Frontend: http://localhost:4200

## 3) Tester l IA

1. Aller a AI Predictions
2. Cliquer Analyze sur une ligne d article
3. Voir l analyse retournee pour cet article

## 4) Endpoints utiles

- Health backend IA: http://localhost:8083/api/ai/health
- Analyse article: http://localhost:8083/api/ai/analyze/{articleId}

## 5) Notes

- Le microservice Python local a ete retire.
- La cle Groq est configuree dans backend/src/main/resources/application.properties.
