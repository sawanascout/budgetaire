-- Mise à jour du schéma des activités pour correspondre aux captures d'écran

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE "Activite" 
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Modifier le type de budgetPrevu et budgetConsomme pour être des Float
ALTER TABLE "Activite" 
ALTER COLUMN "budgetPrevu" TYPE DOUBLE PRECISION USING "budgetPrevu"::DOUBLE PRECISION,
ALTER COLUMN "budgetConsomme" TYPE DOUBLE PRECISION USING "budgetConsomme"::DOUBLE PRECISION;

-- Ajouter les colonnes pour les nouveaux champs
ALTER TABLE "Activite" 
ADD COLUMN IF NOT EXISTS "objectifs" TEXT,
ADD COLUMN IF NOT EXISTS "resultatsAttendus" TEXT,
ADD COLUMN IF NOT EXISTS "methodologie" TEXT;

-- Supprimer les colonnes qui ne sont plus utilisées
ALTER TABLE "Activite" 
DROP COLUMN IF EXISTS "technologies",
DROP COLUMN IF EXISTS "fonctionnalites";

-- Mettre à jour la table Document pour le nouveau schéma
ALTER TABLE "Document"
ADD COLUMN IF NOT EXISTS "categorie" VARCHAR(255) NOT NULL DEFAULT 'Justificatif',
ADD COLUMN IF NOT EXISTS "statut" VARCHAR(255) NOT NULL DEFAULT 'En Attente',
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "televerseLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "par" VARCHAR(255) NOT NULL DEFAULT 'Système',
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rendre activiteId optionnel
ALTER TABLE "Document" 
ALTER COLUMN "activiteId" DROP NOT NULL;

-- Ajouter missionId optionnel
ALTER TABLE "Document"
ADD COLUMN IF NOT EXISTS "missionId" INTEGER;

-- Ajouter la contrainte de clé étrangère pour missionId
ALTER TABLE "Document" 
ADD CONSTRAINT "Document_missionId_fkey" 
FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
