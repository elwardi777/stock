# 🥬 DFL Fresh — Plateforme E-commerce & Gestion Fruits & Légumes

Plateforme full-stack de vente en ligne et gestion centralisée pour **DFL Fresh**, configurée pour un **environnement de développement natif Windows (sans Docker)**.

> **Architecture locale :** `MongoDB Community Server (Service Windows)` → `FastAPI (Python 3.11+)` → `React + TypeScript (Vite)`

---

## 1. Prérequis

Installez ces outils nativement sur Windows (Docker Desktop / Docker Compose **ne sont pas requis**) :

1. **Python 3.11+** : [python.org/downloads/windows](https://www.python.org/downloads/windows/) *(cochez "Add Python to PATH")*
2. **Node.js 18+ (LTS) & npm** : [nodejs.org](https://nodejs.org/)
3. **MongoDB Community Server** : [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) *(installez en tant que Service Windows)*
4. **MongoDB Compass** : [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass) *(inclus avec l'installeur Community ou téléchargeable séparément)*

---

## 2. Vérification des Outils sous PowerShell

```powershell
# Vérifier Python
python --version
# ou via le lanceur Windows :
py --version

# Vérifier Node.js et npm
node --version
npm --version
```

---

## 3. Configuration de MongoDB Community Server & Compass

### Service Windows MongoDB

Lors de l'installation de MongoDB Community Server, laissez l'option **"Install MongoD as a Service"** cochée (nom du service : `MongoDB`, stockage local persistant dans `C:\Program Files\MongoDB\Server\<version>\data\`).

Commandes de gestion du service (PowerShell Administrateur si nécessaire) :

```powershell
# Vérifier l'état du service MongoDB
Get-Service MongoDB

# Démarrer MongoDB
Start-Service MongoDB

# Arrêter MongoDB
Stop-Service MongoDB

# Tester la connexion (si mongosh est installé)
mongosh "mongodb://127.0.0.1:27017"
```

### MongoDB Compass

1. Ouvrez **MongoDB Compass**.
2. Connectez-vous avec l'URI : `mongodb://127.0.0.1:27017`
3. Au premier démarrage du backend FastAPI, la base **`dfl_fresh`** ainsi que les collections (`users`, `categories`, `settings`, etc.) et les index sont créés automatiquement sans écraser les données existantes.

---

## 4. Configuration du Backend (FastAPI)

```powershell
cd C:\Users\PC\.gemini\antigravity\scratch\dfl-fresh\backend

# Créer l'environnement virtuel Python
python -m venv venv
# (ou: py -3 -m venv venv)

# Activer l'environnement virtuel
.\venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
copy .env.example .env
```

### Démarrer le backend manuellement

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **API Base URL** : `http://127.0.0.1:8000`
- **Documentation Swagger** : `http://127.0.0.1:8000/docs`

---

## 5. Configuration du Frontend (React + TypeScript + Vite)

```powershell
cd C:\Users\PC\.gemini\antigravity\scratch\dfl-fresh\frontend

# Installer les dépendances npm
npm install

# Configurer les variables d'environnement
copy .env.example .env

# Démarrer le serveur de développement
npm run dev
```

- **Frontend URL** : `http://localhost:5173`

---

## 6. Variables d'Environnement

### `backend/.env` (modèle : `backend/.env.example`)
```env
MONGODB_URL=mongodb://127.0.0.1:27017
DATABASE_NAME=dfl_fresh
MONGODB_DATABASE=dfl_fresh
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
```

### `frontend/.env` (modèle : `frontend/.env.example`)
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_NAME=DFL Fresh
```

> ⚠️ Ne commitez jamais les fichiers `.env` réels (ils sont ignorés dans `.gitignore`).

---

## 7. Scripts PowerShell de Démarrage Rapide

Des scripts prêts à l'emploi sont disponibles à la racine du projet :

| Script | Rôle |
|---|---|
| `.\start-backend.ps1` | Vérifie Python, active `venv`, vérifie les dépendances et MongoDB, puis lance FastAPI sur le port `8000`. |
| `.\start-frontend.ps1` | Vérifie Node/npm, installe `node_modules` si absent, puis lance Vite sur le port `5173`. |
| `.\stop-development.ps1` | Arrête proprement les processus écoutant sur les ports `8000` et `5173`. |

Ouvrez **deux terminaux PowerShell distincts** :
- Terminal 1 : `.\start-backend.ps1`
- Terminal 2 : `.\start-frontend.ps1`

*(Si PowerShell bloque l'exécution de scripts, exécutez une fois : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`)*

---

## 8. Compte Super Administrateur par défaut

Initialisé automatiquement au premier démarrage si aucun administrateur n'existe :

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrator** | `admin@dflfresh.ma` | `Admin@2024!` |

---

## 9. Dépannage (Troubleshooting)

- **`Impossible de se connecter à MongoDB (127.0.0.1:27017)`** : Vérifiez que le service Windows `MongoDB` est démarré (`Get-Service MongoDB`, puis `Start-Service MongoDB` en PowerShell Administrateur).
- **`python` non reconnu** : Utilisez `py -3` ou ajoutez le dossier Python à la variable d'environnement `PATH`.
- **Erreur CORS dans le navigateur** : Vérifiez que `CORS_ORIGINS` dans `backend/.env` contient bien `http://localhost:5173` et `http://127.0.0.1:5173`.
- **Images produits non affichées** : Vérifiez que le dossier `backend/uploads` existe et que `VITE_API_URL=http://127.0.0.1:8000` est défini dans `frontend/.env`.
"# stock" 
