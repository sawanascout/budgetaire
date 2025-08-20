# Étape 1 : image de base
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml ./

# Installer PNPM
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Copier le reste du projet
COPY . .

# Construire l'application Next.js
RUN pnpm build

# Étape 2 : image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copier uniquement les fichiers nécessaires depuis l'étape builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Définir la variable d'environnement pour la base de données
ENV DATABASE_URL=${DATABASE_URL}

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Lancer l'application en production
CMD ["pnpm", "start"]
