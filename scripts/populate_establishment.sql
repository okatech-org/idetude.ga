-- Script de population complète de l'établissement
-- Part 1: Noms gabonais pour génération aléatoire

-- Prénoms masculins gabonais
-- Luc, Pierre, Jean, Paul, André, Marc, Philippe, Michel, François, Joseph, 
-- Robert, Henri, Charles, Alain, Bernard, Thierry, Patrick, Olivier, Sylvain, Emmanuel

-- Prénoms féminins gabonais
-- Marie, Jeanne, Anne, Sylvie, Françoise, Nicole, Monique, Christine, Patricia, 
-- Cécile, Lucie, Thérèse, Marguerite, Eugénie, Odette, Claudette, Bernadette, Rose, Grace, Hortense

-- Noms de famille gabonais courants
-- OBAME, MBOUMBA, NZENG, MOUSSAVOU, ONDO, NGUEMA, OBIANG, MBA, MINKO, ESSONO,
-- EVOUNA, NDONG, MEZUI, AYINGONE, MEBARA, BIBANG, EYANG, NTOUTOUME, ASSOUMOU, OVONO

-- 21 classes × 21 élèves en moyenne = 441 élèves
-- Génération avec pattern UUID prévisible pour les élèves

-- Clear existing students for this establishment
DELETE FROM class_students WHERE class_id LIKE '55555555-0001-0001-0001-%';
DELETE FROM students WHERE user_id LIKE '22222222-0001-0001-0002-%';
DELETE FROM profiles WHERE id LIKE '22222222-0001-0001-0002-%';

-- Clear existing class_teachers for this establishment
DELETE FROM class_teachers WHERE class_id LIKE '55555555-0001-0001-0001-%';
