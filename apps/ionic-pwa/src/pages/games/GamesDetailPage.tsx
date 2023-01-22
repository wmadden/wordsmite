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
import {
  collection,
  doc,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { arrowBackOutline } from "ionicons/icons";
import { get } from "lodash";
import React, { useCallback, useMemo } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useRouteMatch } from "react-router";
import {
  useFirestore,
  useFirestoreCollection,
  useFirestoreDoc,
  useUser,
} from "reactfire";
import GameBoard from "../../components/GameBoard";
import {
  gameEventsCollectionPath,
  gamesDocPath,
} from "../../firebase/firestorePathBuilders";
import GameConverter from "../../models/dataConverters/GameConverter";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import {
  Cell,
  Game,
  GameEvent,
  GameState,
  PowerupType,
} from "../../models/Game";
import { GamesDetailUrlParams, gamesListUrl } from "../../urls";
import times from "../../utilities/times";
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

export type GameInProgressProps = {
  game: QueryDocumentSnapshot<Game>;
  authUserId: string;
  targetPlayerId: string;
};

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function calculateGameState({
  game,
  gameEvents,
}: {
  game: QueryDocumentSnapshot<Game>;
  gameEvents: QueryDocumentSnapshot<GameEvent>[];
}): GameState {
  // TODO: calculate me
  const gameData = game.data();
  const grid: Cell[][] = times(gameData.boardSize, () => {
    return times(gameData.boardSize, () => ({
      letter: alphabet[Math.floor(Math.random() * alphabet.length)],
      hits: 0,
      powerup: PowerupType.NONE,
    }));
  });
  return {
    grid,
    words: [],
    score: 0,
  };
}

const GameInProgress: React.FC<GameInProgressProps> = ({ game }) => {
  const firestore = useFirestore();
  const gameEventsCollection = useFirestoreCollection(
    collection(
      firestore,
      gameEventsCollectionPath({ gameId: game.id }),
    ).withConverter(GameEventConverter),
  );

  const gameState = useMemo(() => {
    return (
      game &&
      calculateGameState({
        game,
        gameEvents: gameEventsCollection.data?.docs || [],
      })
    );
  }, [game, gameEventsCollection.data]);

  return <GameBoard game={game.data()} gameState={gameState} />;
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
            <GameInProgress
              game={gameDoc.data!.data()}
              authUserId={authUser.uid}
              {...{ targetPlayerId }}
            />
          )}
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default GamesDetailPage;
