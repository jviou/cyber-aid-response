# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/501cc756-8303-48e6-89c5-ca74b9ce5150

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/501cc756-8303-48e6-89c5-ca74b9ce5150) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/501cc756-8303-48e6-89c5-ca74b9ce5150) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Run everything with Docker Compose

Build and run the multi-user stack (frontend + state API) locally with Docker Compose:

```sh
docker compose up --build
```

This will expose the Crisis Labs UI on port `8080` and the shared state API on port `4000`. The session state is stored inside a named Docker volume (`crisis_state_data`) so restarting the stack on a Linux server preserves previously recorded crises.

### Configuration clés

- `VITE_CRISIS_API_URL` : URL publique du service `crisis-api` (ex : `http://crisis-api:4000`). Elle est injectée au build (`docker-compose` la configure déjà) et sert aussi de valeur par défaut à l'exécution.
- `VITE_DEFAULT_SESSION_ID` : identifiant de session partagé. Quand il est défini (ex : `default`), tous les navigateurs utilisent automatiquement cette session commune : parfait pour un poste de commandement multi-utilisateurs.

Lors d'un déploiement manuel (sans Docker) pensez à exporter ces variables avant `npm run build` :

```sh
export VITE_CRISIS_API_URL="https://mon-api-crise.exemple.com"
export VITE_DEFAULT_SESSION_ID="default"
npm run build
```

### Synchronisation temps réel

Le frontend interroge l'API `GET /api/state?sessionId=...` toutes les 5 secondes. Chaque sauvegarde met à jour `meta.updatedAt` et le polling applique automatiquement les états plus récents sans écraser les formulaires en cours. Si l'API n'est plus accessible, l'interface affiche un toast explicite, garde les données dans `localStorage` et retentera la synchronisation dès que possible.

### Scénario de test recommandé

1. `docker compose up --build -d`.
2. Ouvrir l'interface depuis deux navigateurs/PC distincts.
3. Ajouter une décision sur le navigateur A et cliquer sur « Sauvegarder ».
4. Vérifier que la décision apparaît sur B en moins de 5 à 10 secondes sans rechargement.
5. Arrêter temporairement le conteneur `crisis-api` : les navigateurs affichent alors un toast d'erreur et basculent sur le cache local. Au redémarrage, la synchronisation se réactive automatiquement.
