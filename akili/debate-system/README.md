# 🎭 Système de Débat Multi-Agents avec Tri-Protocol SDK

## 📁 Structure du Projet

```
debate-system/
├── backend/               # Backend TypeScript avec Express + Socket.io
│   ├── server.ts         # Serveur principal
│   ├── agents/           # Agents IA (Modérateur, Expert, Critique)
│   ├── orchestrator/     # Orchestrateur de débat
│   ├── services/         # Services (Gemini, LLM, etc.)
│   └── utils/            # Utilitaires (MessageQueue, etc.)
├── frontend/             # Frontend React avec Vite
│   ├── src/              # Code source React
│   ├── public/           # Assets publics
│   └── vite.config.ts    # Configuration Vite
├── shared/               # Types TypeScript partagés
└── tri-protocol/         # SDK Tri-Protocol

```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- Clé API Gemini (dans `.env`)

### Installation

```bash
# Installer les dépendances backend
npm install

# Installer les dépendances frontend
cd frontend
npm install
```

### Configuration

Créer un fichier `.env` à la racine:
```env
GEMINI_API_KEY=votre_cle_api
GEMINI_MODEL=gemini-2.0-flash
PORT=3001
```

### Démarrage

**Backend (port 3001):**
```bash
cd backend
npx tsx server.ts
```

**Frontend (port 4000):**
```bash
cd frontend
npm run dev
```

## 🎨 Fonctionnalités

- **3 Agents IA** en français:
  - 🎙️ Sophie Dubois (Modératrice)
  - 👨‍🔬 Dr. Alexandre Chen (Expert)
  - 🤔 Jordan Rivière (Critique)

- **Interface Web Moderne**:
  - Animation de frappe
  - Cartes d'agents
  - Thème gradient
  - Sans scroll automatique

- **Synchronisation Parfaite**:
  - MessageQueue avec sémaphore
  - Agents parlent séquentiellement
  - Délais réalistes

## 🛠️ Technologies

- **Backend**: TypeScript, Express, Socket.io, Tri-Protocol SDK
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **IA**: Gemini 2.0 Flash
- **SDK**: Tri-Protocol (A2A, MCP, LangGraph)

## 📊 Architecture

Le système utilise le **Tri-Protocol SDK** avec:
- **A2A Protocol**: Communication inter-agents
- **MCP Protocol**: Gestion du contexte
- **LangGraph**: Orchestration des workflows
- **Persistence Layer**: Stockage intégré

## 🔄 Développement

Voir [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) pour la feuille de route complète.

### Prochaines Étapes
1. Configuration de la persistence layer SDK
2. Implémentation du cache intelligent
3. Ajout de nouveaux agents spécialisés
4. Dashboard analytics

## 📝 Documentation

- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) - Rapport d'implémentation complet
- [TRI_PROTOCOL_SDK_EVALUATION.md](TRI_PROTOCOL_SDK_EVALUATION.md) - Évaluation du SDK
- [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) - Plan de développement
- [SDK_INTEGRATION_REPORT.md](SDK_INTEGRATION_REPORT.md) - Intégration SDK

## 🐛 Bugs Corrigés

✅ **Synchronisation des messages** - Implémentation de MessageQueue
✅ **Scroll automatique** - Suppression complète
✅ **Structure frontend** - Élimination de la duplication `frontend/frontend`

## 📄 Licence

MIT

---

*Développé avec le Tri-Protocol SDK*
*Dernière mise à jour: 25/09/2025*