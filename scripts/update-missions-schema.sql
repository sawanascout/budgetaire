-- Update Mission table structure
ALTER TABLE Mission RENAME TO Mission_old;

CREATE TABLE Mission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATETIME NOT NULL,
  nomMissionnaire TEXT NOT NULL,
  montantParJour REAL NOT NULL,
  nombreJours INTEGER NOT NULL,
  modePaiement TEXT NOT NULL,
  reference TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'En Attente',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data if any (adjust as needed)
-- INSERT INTO Mission (id, date, nomMissionnaire, montantParJour, nombreJours, modePaiement, reference, statut, createdAt, updatedAt)
-- SELECT id, dateDebut, nom, budget/duree, duree, modePaiement, 'REF-' || id, statutValidation, createdAt, updatedAt
-- FROM Mission_old;

-- Drop old table
DROP TABLE Mission_old;

-- Update foreign key references in other tables
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate tables with foreign keys

-- Update Activite table to make missionId optional
CREATE TABLE Activite_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  responsable TEXT,
  description TEXT NOT NULL,
  dateDebut DATETIME NOT NULL,
  dateFin DATETIME NOT NULL,
  budgetPrevu REAL NOT NULL,
  budgetConsomme REAL NOT NULL DEFAULT 0,
  region TEXT NOT NULL,
  nombreParticipants INTEGER,
  objectifs TEXT,
  resultatsAttendus TEXT,
  methodologie TEXT,
  rubriqueId INTEGER NOT NULL,
  missionId INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rubriqueId) REFERENCES Rubrique (id),
  FOREIGN KEY (missionId) REFERENCES Mission (id)
);

-- Copy data from old Activite table
INSERT INTO Activite_new SELECT * FROM Activite;

-- Replace old table
DROP TABLE Activite;
ALTER TABLE Activite_new RENAME TO Activite;

-- Update Depense table
CREATE TABLE Depense_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  libelle TEXT NOT NULL,
  montant REAL NOT NULL,
  date DATETIME NOT NULL,
  type TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'En Attente',
  rubriqueId INTEGER NOT NULL,
  missionId INTEGER,
  activiteId INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rubriqueId) REFERENCES Rubrique (id),
  FOREIGN KEY (missionId) REFERENCES Mission (id),
  FOREIGN KEY (activiteId) REFERENCES Activite (id)
);

-- Copy data from old Depense table
INSERT INTO Depense_new SELECT * FROM Depense;

-- Replace old table
DROP TABLE Depense;
ALTER TABLE Depense_new RENAME TO Depense;

-- Update Document table
CREATE TABLE Document_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  chemin TEXT NOT NULL,
  categorie TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'En Attente',
  description TEXT,
  par TEXT NOT NULL,
  televerseLe DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rubriqueId INTEGER NOT NULL,
  missionId INTEGER,
  activiteId INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rubriqueId) REFERENCES Rubrique (id),
  FOREIGN KEY (missionId) REFERENCES Mission (id),
  FOREIGN KEY (activiteId) REFERENCES Activite (id)
);

-- Copy data from old Document table if exists
-- INSERT INTO Document_new SELECT * FROM Document;

-- Replace old table
-- DROP TABLE Document;
-- ALTER TABLE Document_new RENAME TO Document;

-- Insert some sample missions for testing
INSERT INTO Mission (date, nomMissionnaire, montantParJour, nombreJours, modePaiement, reference, statut) VALUES
('2024-01-15', 'Dr. Ahmed Ould Mohamed', 5000, 3, 'Virement', 'MISS-2024-001', 'Terminé'),
('2024-02-10', 'Mme. Fatima Mint Salem', 4500, 5, 'Chèque', 'MISS-2024-002', 'En Cours'),
('2024-03-05', 'M. Sidi Ould Baba', 6000, 2, 'Virement', 'MISS-2024-003', 'En Attente');
