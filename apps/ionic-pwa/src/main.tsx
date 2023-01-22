import { defineCustomElements } from "@ionic/pwa-elements/loader";
import React from "react";
import { createRoot } from "react-dom/client";
import { FirebaseAppProvider } from "reactfire";
import App from "./App";
import "./index.css";
import FirebaseSdkProviders from "./state/FirebaseSdkProviders";
import "./theme/fonts.css";
import environment from "./utilities/environment";

const r = React;

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <FirebaseAppProvider firebaseConfig={environment().firebaseConfig()}>
    <FirebaseSdkProviders>
      <App />
    </FirebaseSdkProviders>
  </FirebaseAppProvider>,
);

defineCustomElements(window);
