import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  collection,
  collectionGroup,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { compact } from "lodash";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useFirestore, useFirestoreCollection, useUser } from "reactfire";
import {
  gamesCollectionPath,
  gameStatesCollectionGroupPath,
} from "../../firebase/firestorePathBuilders";
import GameConverter from "../../models/dataConverters/GameConverter";
import GameStateConverter from "../../models/dataConverters/GameStateConverter";
import { gamesNewUrl } from "../../urls";
import GamesList from "./GamesList";

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

const GamesListPage: React.FC = () => {
  const firestore = useFirestore();
  const authUser = useUser();
  const myGamesCollection = useFirestoreCollection(
    query(
      collection(firestore, gamesCollectionPath()).withConverter(GameConverter),
      ...compact([
        authUser.data && where("creatorId", "==", authUser.data?.uid),
        orderBy("createdAt", "desc"),
      ]),
    ),
  );
  const myGameStatesCollection = useFirestoreCollection(
    query(
      collectionGroup(firestore, gameStatesCollectionGroupPath()).withConverter(
        GameStateConverter,
      ),
      orderBy("createdAt", "desc"),
    ),
  );

  return (
    <IonPage>
      <ErrorBoundary FallbackComponent={ErrorContent}>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>My Games</IonTitle>

            <IonButtons slot="end">
              <IonButton routerLink={gamesNewUrl()}>New</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">My Games</IonTitle>
            </IonToolbar>
          </IonHeader>

          {authUser.data && <GamesList userId={authUser.data.uid} />}
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default GamesListPage;
