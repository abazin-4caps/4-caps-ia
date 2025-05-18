-- Mettre à jour les données existantes
UPDATE public.projects
SET status = 'en cours'
WHERE status = 'en_cours';

-- Supprimer l'ancienne contrainte
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_status_check;

-- Ajouter la nouvelle contrainte
ALTER TABLE public.projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('actif', 'en cours', 'terminé')); 