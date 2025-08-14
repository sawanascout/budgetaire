-- Mise à jour du schéma pour correspondre à la nouvelle logique

-- Ajouter les nouveaux champs à la table Activite
ALTER TABLE "Activite" 
ADD COLUMN IF NOT EXISTS "dateDebut" DATE,
ADD COLUMN IF NOT EXISTS "dateFin" DATE,
ADD COLUMN IF NOT EXISTS "responsable" TEXT,
ADD COLUMN IF NOT EXISTS "region" TEXT,
ADD COLUMN IF NOT EXISTS "nombreParticipants" INTEGER,
ADD COLUMN IF NOT EXISTS "technologies" TEXT,
ADD COLUMN IF NOT EXISTS "fonctionnalites" TEXT,
ADD COLUMN IF NOT EXISTS "objectifs" TEXT,
ADD COLUMN IF NOT EXISTS "resultatsAttendus" TEXT,
ADD COLUMN IF NOT EXISTS "methodologie" TEXT;

-- Modifier le type de budgetPrevu pour les calculs
ALTER TABLE "Activite" 
ALTER COLUMN "budgetPrevu" TYPE DOUBLE PRECISION USING "budgetPrevu"::DOUBLE PRECISION;

-- Ajouter budgetConsomme avec valeur par défaut 0
ALTER TABLE "Activite" 
ADD COLUMN IF NOT EXISTS "budgetConsomme" DOUBLE PRECISION DEFAULT 0;

-- Ajouter le budget à la table Rubrique
ALTER TABLE "Rubrique" 
ADD COLUMN IF NOT EXISTS "budget" DOUBLE PRECISION DEFAULT 0;

-- Insérer les 8 rubriques avec leurs budgets
INSERT INTO "Rubrique" (nom, description, budget) VALUES
('Mission et Planification', 'Planification et coordination des missions d''identification', 2395000),
('Mise en place d''une plateforme numérique et préparation des contenus éducatifs et pédagogiques', 'Conception et développement de la plateforme numérique', 420000),
('Formation Formateurs et Administrateurs de la Plateforme', 'Formation des formateurs et administrateurs', 4526000),
('Opérationnalisation des centres Locaux', 'Installation et opérationnalisation des centres', 7493000),
('Coaching des inspecteurs Pédagogiques', 'Accompagnement des inspecteurs pédagogiques', 0),
('Formation des enseignants', 'Formation continue des enseignants', 0),
('Certification & Suivi et Evaluation', 'Certification et évaluation du projet', 823000),
('Charge Siège Fonctionnement et Gestion', 'Charges de fonctionnement du siège', 5490000)
ON CONFLICT (nom) DO UPDATE SET 
  budget = EXCLUDED.budget,
  description = EXCLUDED.description;
