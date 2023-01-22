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
} from "@ionic/react";
import { collection, doc } from "firebase/firestore";
import { arrowBackOutline } from "ionicons/icons";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useRouteMatch } from "react-router";
import {
  useFirestore,
  useFirestoreCollection,
  useFirestoreDoc,
  useUser,
} from "reactfire";
import {
  gameEventsCollectionPath,
  gamesDocPath,
} from "../../firebase/firestorePathBuilders";
import GameConverter from "../../models/dataConverters/GameConverter";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import { ActionType } from "../../models/Game";
import { GamesDetailUrlParams, gamesListUrl } from "../../urls";
import GameInProgress from "./GameInProgress";
import GameNotStarted from "./GameNotStarted";
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

  const targetPlayerId = authUser?.uid;

  const isLoaded = gameDoc.status === "success" && targetPlayerId;

  const gameEventsCollection = useFirestoreCollection(
    collection(firestore, gameEventsCollectionPath({ gameId })).withConverter(
      GameEventConverter,
    ),
  );

  const gameStartEvent = gameEventsCollection.data?.docs.find((eventDoc) => {
    return eventDoc.data().action.type === ActionType.GAME_START;
  });

  const initEvent = gameEventsCollection.data?.docs.find((eventDoc) => {
    return eventDoc.data().action.type === ActionType.GAME_START;
  });

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
          ) : !gameStartEvent || !initEvent ? (
            <GameNotStarted
              game={gameDoc.data}
              started={!!gameStartEvent}
              joined={!!initEvent}
              targetPlayerId={authUser?.uid || ""}
            />
          ) : (
            <GameInProgress
              game={gameDoc.data}
              authUserId={authUser.uid}
              {...{ targetPlayerId }}
              className={css.gameInProgress}
            />
          )}
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default GamesDetailPage;
