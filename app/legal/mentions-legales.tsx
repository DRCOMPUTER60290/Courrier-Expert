import LegalPage from '@/components/LegalPage';
import React from 'react';

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales">
      {`Société éditrice : drcomputer60290 - Benjamin Albert
Entreprise individuelle immatriculée au RCS sous le n° 804 581 437
Adresse e-mail : webmaster@drcompurter60290.fr
Directeur de la publication : Benjamin Albert

L'application Courrier-Expert et l'ensemble de ses contenus sont la propriété exclusive de leur éditeur. Toute reproduction ou représentation, totale ou partielle, est interdite sans autorisation préalable.

L'éditeur s'efforce d'assurer l'exactitude des informations diffusées mais ne peut en garantir l'exhaustivité ni l'actualité. Sa responsabilité ne saurait être engagée pour tout dommage direct ou indirect résultant de l'utilisation de l'application.`}
    </LegalPage>
  );
}
