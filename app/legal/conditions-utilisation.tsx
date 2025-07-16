import LegalPage from '@/components/LegalPage';
import React from 'react';

export default function ConditionsUtilisation() {
  return (
    <LegalPage title="Conditions d'utilisation">
      {`L'utilisation de l'application Courrier-Expert implique l'acceptation sans réserve des conditions ci-dessous.

1. L'application est destinée à un usage personnel et non commercial.
2. L'utilisateur s'engage à fournir des informations exactes et à respecter la législation française lors de la rédaction des courriers.
3. Les courriers générés sont fournis à titre indicatif et ne constituent pas un conseil juridique. L'éditeur décline toute responsabilité quant à leur utilisation.
4. L'éditeur peut modifier ou mettre à jour l'application sans préavis.
5. En cas de non-respect des présentes conditions, l'accès à l'application pourra être suspendu ou supprimé.`}
    </LegalPage>
  );
}
