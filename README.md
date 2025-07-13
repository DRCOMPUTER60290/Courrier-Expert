# Courrier-Expert

Courrier-Expert is a React Native application built with **Expo Router** for generating and managing professional letters. It uses AI-powered letter generation through a remote server to create personalized, professional correspondence.

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   # or
   expo start
   ```

   The app can then be opened in Expo Go or a simulator.

3. Create an `.env` file at the project root and define the backend URL used during development:

   ```bash
   BACKEND_URL=https://assistant-backend-yrbx.onrender.com
   ```

   For production builds, set `BACKEND_URL` to the appropriate server URL in your deployment environment.

### Using React Native DevTools

To enable the React Native DevTools, add the following to `app.json` under the `expo` key and rebuild:

```json
  "jsEngine": "hermes"
```

After rebuilding the native project (`npx expo prebuild && npx expo run:ios` or `npx expo run:android`), the DevTools will be available.

## Major screens

* **Home** – choose a letter type and view app statistics.
* **Create Letter** – fill in recipient information and form fields; uses `DatePicker` and `CitySelector` components.
* **Letter Preview** – view the generated letter and share, download, email or print it.
* **History** – list of previously created letters with actions to share, download, email or delete.
* **Profile** – manage user information such as name, company, address and avatar.
* **Settings** – adjust app theme and view legal information.

## Components

* `DatePicker` – modal date selector with formatted output.
* `CitySelector` – choose a city based on postal code with search filtering.

## Letter generation API

Letters are generated using a remote AI service whose base URL is defined by the `BACKEND_URL` environment variable. The API prompt now starts with:

```
Tu es un assistant qui rédige des lettres officielles au format administratif français
```

The app sends structured data to `/api/generate-letter` which the server turns into a detailed prompt including the letter type, recipient, subject, body and sender profile.

### API Requirements

* **Internet connection required**: The app requires an active internet connection to generate letters.
* **No offline mode**: All letter generation is handled by the remote server using AI.
* **Error handling**: The app provides clear feedback when generation fails due to network issues or server errors.

### API Request Format

The client sends the following JSON payload in the `POST` body to the endpoint `${BACKEND_URL}/api/generate-letter`:

```json
{
  "type": "motivation",                // Letter type identifier
  "subject": "Objet du courrier",      // Objet de la lettre (facultatif)
  "body": "Texte libre saisi par l'utilisateur", // Contenu principal (facultatif)
  "recipient": {                         // Coordonnées du destinataire
    "firstName": "Jean",
    "lastName": "Dupont",
    "status": "Monsieur",
    "address": "123 Rue de la Paix",
    "postalCode": "75001",
    "city": "Paris",
    "email": "jean.dupont@email.com",
    "phone": "01 23 45 67 89"
  },
  "profile": {                           // Coordonnées de l'expéditeur (profil utilisateur)
    "firstName": "Alice",
    "lastName": "Martin",
    "company": "InnoTech",            // Facultatif
    "address": "42 Avenue du Code",
    "postalCode": "75002",
    "city": "Paris",
    "email": "alice.martin@example.com",
    "phone": "06 01 02 03 04"
  },
  "data": {                              // Champs personnalisés (formulaires dynamiques)
    "position": "Développeur Full-Stack",
    "company": "TechCorp",
    "experience": "3",
    "motivation": "Passion pour l'innovation..."
  },
  "prompt": "Rédige une lettre professionnelle de type \"motivation\"..." // Prompt brut optionnel
}
```

### API Response Format

```json
{
  "content": "Generated letter content as a string by ChatGPT"
}
```

The server processes this data with ChatGPT to generate a professional, personalized letter that is then formatted and displayed in the letter preview with proper sender/recipient information, date, and signature.

### Debugging

The app includes console logging to help debug the API integration:

* Request data sent to server
* Server response status
* Generated content received
* Error details if generation fails
