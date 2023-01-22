import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import AuthModalProvider from "./state/AuthModalProvider";
import { gamesListUrl, myUserProfileUrl } from "./urls";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import GamesDetailPage from "./pages/games/GamesDetailPage";
import GamesListPage from "./pages/games/GamesListPage";
import GamesNewPage from "./pages/games/GamesNewPage";
import MyUserProfilePage from "./pages/settings/MyProfilePage";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthModalProvider>
      {/* Strict mode is wreaking havoc on the AuthModal, move this up the tree once this is fixed */}
      <React.StrictMode>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/:tab(games)">
                <GamesListPage />
              </Route>
              <Route exact path="/:tab(games)/:gameId">
                <GamesDetailPage />
              </Route>
              <Route exact path="/:tab(games)/new">
                <GamesNewPage />
              </Route>

              <Route exact path="/:tab(settings)/profile">
                <MyUserProfilePage />
              </Route>

              <Route exact path="/">
                <Redirect to={gamesListUrl()} />
              </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="games" href={gamesListUrl()}>
                <IonLabel>Games</IonLabel>
              </IonTabButton>

              <IonTabButton tab="profile" href={myUserProfileUrl()}>
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </React.StrictMode>
    </AuthModalProvider>
  </IonApp>
);

export default App;
