import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { doc, DocumentSnapshot } from "firebase/firestore";
import { arrowBackOutline } from "ionicons/icons";
import { get } from "lodash";
import React, { useCallback } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useRouteMatch } from "react-router";
import { useFirestore, useFirestoreDoc, useUser } from "reactfire";
import GameBoard from "../../components/GameBoard";
import { gamesDocPath } from "../../firebase/firestorePathBuilders";
import GameConverter from "../../models/dataConverters/GameConverter";
import { Game } from "../../models/Game";
import { GamesDetailUrlParams, gamesListUrl } from "../../urls";
import css from "./GamesDetailPage.module.css";

export type GameNotFoundProps = {};

const GameNotFound: React.FC<GameNotFoundProps> = (props) => {
  return (
    <div className={css.fullscreenContainer}>
      <div className={css.centeredContent}>
        Can't find that game. Broken link?
      </div>
    </div>
  );
};

export type NoGameStateSelectedProps = {
  game: DocumentSnapshot<Game>;
};

const NoGameStateSelected: React.FC<NoGameStateSelectedProps> = ({ game }) => {
  const firestore = useFirestore();
  const routeMatch = useRouteMatch<GamesDetailUrlParams>();
  const gameId = routeMatch.params.gameId;
  const { data: authUser } = useUser();
  const [presentToast] = useIonToast();

  const onPlayGameClick = useCallback(async () => {
    try {
      window.alert("TO DO");
    } catch (error) {
      presentToast({
        message: `Error: ${get(error, "message")}`,
        color: "danger",
      });
    }
  }, [presentToast]);

  return (
    <div className={css.fullscreenContainer}>
      <IonButton onClick={onPlayGameClick} className={css.centeredContent}>
        Play Game
      </IonButton>
    </div>
  );
};

export type ErrorContentProps = FallbackProps & {};

const ErrorContent: React.FC<ErrorContentProps> = ({ error }) => {
  return (
    <div>
      <p>An error occurred:</p>
      <pre>
        {error.message}
        {error.stack}
      </pre>
    </div>
  );
};

const GamesDetailPage: React.FC = () => {
  const firestore = useFirestore();
  const routeMatch = useRouteMatch<GamesDetailUrlParams>();
  const gameId = routeMatch.params.gameId;
  const { data: authUser } = useUser();

  const gameDoc = useFirestoreDoc(
    doc(firestore, gamesDocPath({ gameId })).withConverter(GameConverter),
  );

  const isLoaded = gameDoc.status === "success";

  return (
    <IonPage>
      <ErrorBoundary FallbackComponent={ErrorContent}>
        <IonHeader translucent>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink={gamesListUrl()} routerDirection="back">
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>

            <IonTitle>
              {isLoaded ? "Game" : <IonSkeletonText animated />}
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          {!isLoaded ? (
            <IonProgressBar type="indeterminate" />
          ) : !gameDoc.data.exists() ? (
            <GameNotFound />
          ) : (
            <GameBoard game={gameDoc.data!.data()} />
          )}
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default GamesDetailPage;
