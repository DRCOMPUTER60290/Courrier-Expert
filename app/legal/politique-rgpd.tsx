import LegalPage from '@/components/LegalPage';
import React from 'react';

export default function PolitiqueRGPD() {
  return (
    <LegalPage title="Politique RGPD">
      {`Courrier-Expert ne collecte pas de données personnelles sans votre consentement. Les informations saisies sont enregistrées localement sur votre appareil. Seules les données nécessaires à la génération du courrier sont transmises au serveur configuré dans l'application.

Aucune information n'est exploitée à des fins commerciales. Conformément au règlement (UE) 2016/679, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Pour toute demande, écrivez à webmaster@drcomputer60290.fr.

Vous pouvez effacer l'ensemble de vos données en vidant le stockage de l'application ou en la désinstallant.`}
    </LegalPage>
  );
}
