# 📋 Guide Complet d'Installation et de Lancement - Gestion de Stock

Ce guide vous permet de démarrer l'application **Gestion de Stock** sur votre machine locale. Suivez chaque étape attentivement.

---

## Table des Matières

1. [Prérequis](#prérequis)
2. [Installation des Dépendances](#installation-des-dépendances)
3. [Configuration du Projet](#configuration-du-projet)
4. [Lancement de l'Application](#lancement-de-lapplication)
5. [Accès à l'Application Web](#accès-à-lapplication-web)
6. [Troubleshooting](#troubleshooting)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants:

### 1. **Git**
- Téléchargez depuis: https://git-scm.com/
- **Windows**: Exécutez l'installateur et acceptez les paramètres par défaut
- **macOS**: Via Homebrew: `brew install git`
- **Linux**: `sudo apt-get install git`

### 2. **Node.js et npm** (pour le frontend Angular)
- Téléchargez depuis: https://nodejs.org/ (version LTS recommandée)
- **Vérification**: Ouvrez un terminal/PowerShell et tapez:
  ```bash
  node --version
  npm --version
  ```
  Vous devez voir les numéros de version affichés

### 3. **Java 17+**
- Téléchargez depuis: https://www.oracle.com/java/technologies/downloads/
  - Ou utilisez: https://adoptium.net/ (recommandé, gratuit)
- **Vérification**:
  ```bash
  java -version
  ```
  Vous devez voir "Java 17" ou supérieur

### 4. **MySQL Server**
- Téléchargez depuis: https://dev.mysql.com/downloads/mysql/
- **Windows**: Utilisez l'installateur MSI
- **macOS**: Via Homebrew: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`
- **Vérification**: 
  ```bash
  mysql --version
  ```

### 5. **Éditeur de Code (Optionnel)**
- **VS Code** (recommandé): https://code.visualstudio.com/
- Extensões utiles: 
  - "Angular Language Service" pour Angular
  - "Extension Pack for Java" pour Java

---

## Installation des Dépendances

### Étape 1: Cloner le Référentiel GitHub

Ouvrez un terminal/PowerShell et exécutez:

```bash
git clone https://github.com/abdelfatah-chaib/Stock-Management.git
cd Stock-Management
```

Remplacez `abdelfatah-chaib` par le propriétaire réel du repo si différent.

### Étape 2: Configurer MySQL

#### Vérifier que MySQL est en Cours d'Exécution

**Windows**: Vérifiez dans "Services" (Ctrl+R, `services.msc`) que MySQL est "Running"

**macOS/Linux**:
```bash
mysql --version
# ou pour vérifier le démarrage:
ps aux | grep mysql
```

#### Se Connecter à MySQL

```bash
mysql -u root -p
# Entrez votre mot de passe MySQL
```

#### Créer la Base de Données

Une fois connecté à MySQL, tapez:

```sql
CREATE DATABASE IF NOT EXISTS gestion;
EXIT;
```

**NOTE**: Le projet crée automatiquement les tables. Vous n'avez besoin que de créer la base de données.

### Étape 3: Installer les Dépendances du Frontend

Naviguez dans le dossier frontend:

```bash
cd frontend
npm install
```

Cela télécharge toutes les dépendances Angular. La première fois, cela peut prendre 2-5 minutes.

**Vérification**: Vérifiez qu'aucune erreur n'est affichée. Des avertissements sont normaux.

---

## Configuration du Projet

### Étape 1: Configurer la Clé Groq API

Le projet utilise l'API Groq pour l'IA. Vous devez définir une variable d'environnement.

#### Sur Windows (PowerShell)

```powershell
# Ouvrez PowerShell en tant qu'Administrateur
$env:GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"

# Vérification:
Write-Output $env:GROQ_API_KEY
```

**Remplacez `YOUR_GROQ_API_KEY_HERE` par votre vraie clé API Groq.**

#### Sur macOS/Linux (Terminal)

```bash
export GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"

# Vérification:
echo $GROQ_API_KEY
```

**Remplacez `YOUR_GROQ_API_KEY_HERE` par votre vraie clé API Groq.**

**Alternative Permanente** (pour ne pas refaire à chaque ouverture):

**Windows**: Ajouter une variable d'environnement système
- Clic droit sur "Ce PC" → Propriétés → Variables d'environnement → Nouvelle variable
- Nom: `GROQ_API_KEY`
- Valeur: `YOUR_GROQ_API_KEY_HERE` (remplacez par votre vraie clé)
- Redémarrez votre terminal après

**macOS/Linux**: Ajouter à `~/.bashrc` ou `~/.zshrc`:
```bash
export GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
```
*(Remplacez `YOUR_GROQ_API_KEY_HERE` par votre vraie clé)*

Puis: `source ~/.bashrc` ou redémarrer le terminal

### Étape 2: Vérifier la Configuration MySQL

Accédez à `backend/src/main/resources/application.properties` et vérifiez:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gestion?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=Root123
```

**Si votre mot de passe MySQL est différent**, modifiez `Root123` en conséquence.

---

## Lancement de l'Application

### Structure de Lancement

L'application se compose de deux services:

1. **Backend** (Spring Boot) - Écoute sur le port 8080
2. **Frontend** (Angular) - Sert depuis le backend (inclus dans le JAR)

### Lancement Rapide (Recommandé - Tout en Un)

#### Windows

Depuis le répertoire racine du projet:

```powershell
.\START_ALL_SERVICES.bat
```

Cela:
- Compile le frontend Angular en production
- Démarre le backend Spring Boot
- Sert l'application depuis `http://localhost:8080`

#### macOS/Linux

```bash
chmod +x START_ALL_SERVICES.sh
./START_ALL_SERVICES.sh
```

### Lancement Manuel (Étape par Étape)

#### Étape 1: Construire le Frontend

```bash
cd frontend
npm run build
cd ..
```

Cela crée `frontend/dist/gestion-stock-frontend/browser/`

#### Étape 2: Lancer le Backend

**Windows**:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**macOS/Linux**:
```bash
cd backend
./mvnw spring-boot:run
```

Le backend compilera le tout (y compris les assets frontend) et démarrera.

**Sortie Attendue**:
```
...
INFO: Started Test1Application in X.XXX seconds
```

---

## Accès à l'Application Web

### Une Fois le Serveur Lancé

1. **Ouvrez votre navigateur**
2. **Allez à**: http://localhost:8080

### Page d'Accueil

Vous devez voir:
- Interface de **Gestion de Stock** chargée
- Barre de navigation en haut
- Authentification requise (si appliquée)

### Routes Principales

- **Tableau de Bord**: `http://localhost:8080/dashboard`
- **Articles**: `http://localhost:8080/articles`
- **Catégories**: `http://localhost:8080/categories`
- **Utilisateurs**: `http://localhost:8080/users`
- **IA/Prédictions**: `http://localhost:8080/ai-predictions`

### Test de l'API Backend (Optionnel)

Ouvrez un terminal et testez une route API:

```bash
curl http://localhost:8080/api/articles
```

Ou avec cURL sur Windows:
```powershell
curl.exe http://localhost:8080/api/articles
```

---

## Troubleshooting

### Problème: Le Port 8080 est Déjà Utilisé

**Solution**: Changez le port dans `backend/src/main/resources/application.properties`:
```properties
server.port=8081
```
Puis accédez à `http://localhost:8081`

---

### Problème: Erreur de Connexion à MySQL

**Message d'Erreur**:
```
Could not get a resource from the pool
Communications link failure
```

**Solutions**:
1. Vérifiez que MySQL est en cours d'exécution
   - **Windows**: `services.msc` → MySQL Server
   - **macOS**: `brew services list | grep mysql`
   - **Linux**: `sudo systemctl status mysql`

2. Vérifiez les identifiants dans `application.properties`:
   ```bash
   mysql -u root -p
   # Entrez votre mot de passe
   ```

3. Créez la base de données:
   ```sql
   CREATE DATABASE IF NOT EXISTS gestion;
   ```

---

### Problème: `node: command not found` ou `npm: command not found`

**Solution**: Node.js n'est pas installé ou non ajouté au PATH
1. Installez Node.js depuis https://nodejs.org/
2. Redémarrez votre terminal
3. Vérifiez: `node --version`

---

### Problème: `java: command not found`

**Solution**: Java n'est pas installé ou non configuré
1. Installez Java 17+ depuis https://adoptium.net/
2. Configurez `JAVA_HOME`:
   - **Windows**: Ajoutez une variable d'environnement `JAVA_HOME` pointant vers le répertoire Java
   - **macOS/Linux**: Ajoutez à `~/.bashrc`: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`

---

### Problème: `npm install` échoue

**Message Typique**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency peer
```

**Solution**:
```bash
npm install --legacy-peer-deps
```

---

### Problème: Application Très Lente au Démarrage (Première Fois)

C'est normal. À la première exécution:
- Maven télécharge tous les plugins et dépendances (~200 MB)
- Angular construit le bundle frontend
- Hibernate crée/met à jour le schéma de base de données

Cela peut prendre **5-15 minutes**.

---

### Problème: Port 3306 (MySQL) est Inaccessible

**Solution**:
1. Vérifiez que MySQL écoute sur le port 3306:
   ```bash
   mysql -u root -p -h 127.0.0.1
   ```

2. Si MySQL utilise un port différent, mettez à jour `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:PORT/gestion?createDatabaseIfNotExist=true
   ```

---

### Problème: `GROQ_API_KEY` Non Reconnu

**Erreur Possible**:
```
Cannot determine value from expression groq.api.key
```

**Solution**:
1. Vérifiez que la variable d'environnement est définie:
   - **Windows**: `Write-Output $env:GROQ_API_KEY`
   - **macOS/Linux**: `echo $GROQ_API_KEY`

2. Redémarrez le terminal et le backend si nécessaire

3. Vérifiez la clé est correcte (format: `gsk_...`)

4. Si la clé est expirée ou invalide, demandez une nouvelle clé d'API à l'administrateur

---

## Commandes Utiles

### Frontend (Angular)

```bash
cd frontend

# Installer les dépendances
npm install

# Développement avec rechargement automatique
npm start

# Construire pour production
npm run build

# Exécuter les tests
npm test

# Vérifier le linting
npm run lint
```

### Backend (Spring Boot)

```bash
cd backend

# Compiler et lancer
./mvnw spring-boot:run

# Compiler seulement
./mvnw clean compile

# Empaqueter en JAR
./mvnw clean package

# Nettoyer les fichiers compilés
./mvnw clean
```

---

## Structure du Projet

```
Gestion-de-Stock/
├── backend/                          # API Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/stock/test1/
│   │   │   │   ├── config/           # Configurations (WebConfig.java)
│   │   │   │   ├── entities/         # Modèles de données
│   │   │   │   ├── security/         # Authentification/Autorisation
│   │   │   │   └── web/              # Contrôleurs REST
│   │   │   └── resources/
│   │   │       ├── application.properties   # Configuration
│   │   │       └── static/           # Assets frontend servés (index.html, JS, CSS)
│   │   └── test/
│   ├── pom.xml                       # Dépendances Maven
│   └── mvnw (Linux/Mac) / mvnw.cmd (Windows)
│
├── frontend/                         # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/           # Composants réutilisables
│   │   │   ├── pages/                # Pages principales
│   │   │   ├── core/services/        # Services API
│   │   │   ├── models/               # Types TypeScript
│   │   │   └── app.ts                # Composant racine
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── environments/             # Configuration d'environnement
│   ├── package.json                  # Dépendances npm
│   ├── angular.json                  # Configuration Angular
│   └── dist/                         # Build output (après npm run build)
│
├── Dockerfile                        # Configuration Docker pour Railway
├── .dockerignore                     # Fichiers à ignorer pour Docker
├── START_ALL_SERVICES.bat (Windows)  # Script de démarrage
├── START_ALL_SERVICES.sh (macOS/Linux)
├── README.md
└── SETUP_GUIDE.md (ce fichier)
```

---

## Variables d'Environnement (Résumé)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `GROQ_API_KEY` | `YOUR_GROQ_API_KEY_HERE` | Clé API pour le service IA Groq (remplacez par votre vraie clé) |
| `PORT` | `8080` (défaut) | Port sur lequel le serveur écoute (optionnel, utilisé par Railway) |
| `JAVA_HOME` | Chemin vers Java | Optionnel si Java est dans le PATH |

---

## Prochaines Étapes

Une fois l'application démarrée:

1. **Authentification**: 
   - Créez un compte utilisateur via l'interface ou utilisez les credentials de test

2. **Exploration**:
   - Consultez l'interface du tableau de bord
   - Testez la gestion des articles, catégories, etc.
   - Explorez la fonctionnalité IA

3. **Développement**:
   - Modifiez le frontend dans `frontend/src/`
   - Modifiez le backend dans `backend/src/`
   - Les rechargements automatiques fonctionnent pendant le développement

4. **Déploiement**:
   - Pour déployer sur Railway, poussez vers GitHub
   - Railway détecte automatiquement le `Dockerfile`

---

## Support et Questions

Si vous rencontrez des problèmes:

1. **Vérifiez les logs du backend**:
   - Cherchez les messages d'erreur rouges dans la console

2. **Consultez le fichier README.md**:
   - Instructions supplémentaires spécifiques au projet

3. **Vérifiez les ports TCP**:
   - Port 8080 (backend)
   - Port 3306 (MySQL)

---

## Checklist Finale

Avant de commencer le développement, vérifiez:

- [ ] Git est installé et configuré
- [ ] Node.js v16+ est installé
- [ ] Java 17+ est installé
- [ ] MySQL Server est en cours d'exécution
- [ ] Base de données `gestion` est créée
- [ ] Variable `GROQ_API_KEY` est définie
- [ ] Dépendances npm sont installées (`npm install`)
- [ ] Frontend est construit (`npm run build`)
- [ ] Backend démarre sans erreurs (`./mvnw spring-boot:run`)
- [ ] Application charge à http://localhost:8080

---

**Bon développement! 🚀**
