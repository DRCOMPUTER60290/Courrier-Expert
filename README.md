# Courrier-Expert

Courrier-Expert is a React Native application built with **Expo Router** for generating and managing professional letters. It includes a set of screens to create letters from templates, preview them and manage user information.

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

### Using React Native DevTools

To enable the React Native DevTools, add the following to `app.json` under the `expo` key and rebuild:

```json
  "jsEngine": "hermes"
```

After rebuilding the native project (`npx expo prebuild && npx expo run:ios` or `npx expo run:android`), the DevTools will be available.

## Major screens

- **Home** – choose a letter type and view app statistics.
- **Create Letter** – fill in recipient information and form fields; uses `DatePicker` and `CitySelector` components.
- **Letter Preview** – view the generated letter and share, download, email or print it.
- **History** – list of previously created letters with actions to share, download, email or delete.
- **Profile** – manage user information such as name, company, address and avatar.
- **Settings** – adjust app theme and view legal information.

## Components

- `DatePicker` – modal date selector with formatted output.
- `CitySelector` – choose a city based on postal code with search filtering.

## Letter generation API

Letters are generated using a remote service hosted at
`https://assistant-backend-yrbx.onrender.com`. The app sends a single
`prompt` string to the endpoint `/api/generate-letter`. The prompt contains the
full text of the letter to be refined by ChatGPT. The server returns the letter
content in a formal style with a header and signature. If the request fails, an
error message is displayed to the user.

