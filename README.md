## Principaux écrans

* **Accueil** – choisissez un type de lettre et affichez les statistiques de l’application.
 
* **Créer une lettre** – remplissez les informations du destinataire et les champs du formulaire ; utilise les composants « DatePicker » et « CitySelector » .
 
* **Aperçu de la lettre** – visualisez la lettre générée et partagez-la, téléchargez-la, envoyez-la par e-mail ou imprimez-la.
 
* **Historique** – liste des lettres précédemment créées avec des actions pour partager, télécharger, envoyer par e-mail ou supprimer.
 
* **Profil** – gérer les informations utilisateur telles que le nom, l'entreprise, l'adresse et l'avatar.
 
* **Paramètres** – ajustez le thème de l’application et affichez les informations légales.
 

## Composants

* `DatePicker` – sélecteur de date modal avec sortie formatée.
 
* `CitySelector` – choisissez une ville en fonction du code postal avec filtrage de recherche.
 

## API de génération de lettres

Les lettres sont générées à l'aide d'un service d'IA distant hébergé sur https://assistant-backend-yrbx.onrender.com . L'application envoie les **données brutes du formulaire** au point de terminaison /api/generate-letter . Le serveur utilise ChatGPT pour générer un contenu professionnel et personnalisé en fonction du type de lettre, des informations du destinataire et des données du formulaire.

### Exigences de l'API

- **Connexion Internet requise** : L'application nécessite une connexion Internet active pour générer des lettres
 
- **Pas de mode hors ligne** : Toute la génération de lettres est gérée par le serveur distant à l'aide de l'IA
 
- **Gestion des erreurs** : L'application fournit un retour clair lorsque la génération échoue en raison de problèmes de réseau ou d'erreurs de serveur
 

### Format de requête API

Le backend attend une chaîne « prompt » construite à partir des informations de la lettre :

```tapuscrit
PUBLICATION https://assistant-backend-yrbx.onrender.com/api/generate-letter
Type de contenu : application/json

{
  "prompt": "R\u00e9dige une lettre professionnelle de type ...",
  "type": "motivation", // Type de lettre
  "destinataire": {
    "prénom": "Jean",
    "lastName": "Dupont",
    "status": "Monsieur",
    "address": "123 Rue de la Paix",
    "code postal": "75001",
    "ville": "Paris",
    "email": "jean.dupont@email.com",
    "téléphone": "01 23 45 67 89"
  },
  "données": {
    "position": "Développeur Full-Stack",
    "entreprise": "TechCorp",
    "expérience": "3",
    "motivation": "Passion pour l'innovation..."
  }
}
```

### Format de réponse de l'API

```tapuscrit
{
  "content": "Contenu de la lettre généré sous forme de chaîne par ChatGPT"
}
```

Le serveur traite ces données avec ChatGPT pour générer une lettre professionnelle et personnalisée qui est ensuite formatée et affichée dans l'aperçu de la lettre avec les informations appropriées sur l'expéditeur/destinataire, la date et la signature.

### Débogage

L'application inclut la journalisation de la console pour aider à déboguer l'intégration de l'API :
- Demande de données envoyées au serveur
- État de réponse du serveur
- Contenu généré reçu
- Détails de l'erreur si la génération échoue
