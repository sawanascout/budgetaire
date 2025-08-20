# Étape 1 : Builder l'application
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer pnpm globalement
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application Next.js pour la production
RUN pnpm build

# Étape 2 : Image finale légère pour exécution
FROM node:20-alpine

WORKDIR /app

# Copier uniquement ce qui est nécessaire depuis l'étape builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exposer le port (Railway utilise généralement 8080)
ENV PORT=8080
EXPOSE 8080

# Démarrer l'application
CMD ["pnpm", "start"]
