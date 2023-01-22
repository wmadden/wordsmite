import {
  IonChip,
  IonCol,
  IonGrid,
  IonItem,
  IonList,
  IonProgressBar,
  IonRow,
  IonSkeletonText,
} from "@ionic/react";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import { compact, uniqBy } from "lodash";
import React from "react";
import {
  useFirestore,
  useFirestoreCollection,
  useFirestoreDoc,
  useUser,
} from "reactfire";
import {
  gamesCollectionPath,
  gamesDocPath,
  userProfilesDocPath,
} from "../../firebase/firestorePathBuilders";
import GameConverter from "../../models/dataConverters/GameConverter";
import UserProfileConverter from "../../models/dataConverters/UserProfileConverter";
import { gamesDetailUrl } from "../../urls";
import css from "./GamesList.module.css";

export type UserChipProps = { userId: string; color?: string };

const UserChip: React.FC<UserChipProps> = ({ userId, color }) => {
  const firestore = useFirestore();
  const authUser = useUser();

  const userProfile = useFirestoreDoc(
    doc(firestore, userProfilesDocPath({ userId })).withConverter(
      UserProfileConverter,
    ),
  );

  const isLoggedInUser = authUser.data?.uid === userId;
  const userName = userProfile.data?.data()?.name || "(?)";

  return (
    <IonChip color={color} className={css.chip}>
      {isLoggedInUser ? "me" : userName}
    </IonChip>
  );
};

type GameListItemProps = {
  gameId: string;
};

const GameListItem: React.FC<GameListItemProps> = ({ gameId }) => {
  const firestore = useFirestore();
  const authUser = useUser();
  const authUserId = authUser.data?.uid;
  const gameDoc = useFirestoreDoc(
    doc(firestore, gamesDocPath({ gameId })).withConverter(GameConverter),
  );

  const gameDetailLink =
    gameDoc.data && gameDoc.data.exists()
      ? gamesDetailUrl({ gameId: gameDoc.data.ref.id })
      : undefined;

  const gameDocData = gameDoc.data?.data();
  const creatorUserProfile = useFirestoreDoc(
    doc(
      firestore,
      userProfilesDocPath({ userId: gameDocData?.creatorId || "-" }),
    ).withConverter(UserProfileConverter),
  );

  const userCreatedGame =
    authUserId && gameDoc.data?.data()?.creatorId === authUserId;

  return (
    <IonItem routerLink={gameDetailLink} lines="full" detail={false}>
      <IonGrid className={css.gameListItem__grid}>
        <IonRow>
          <IonCol className={css.timestamp} size="auto">
            <strong>
              {gameDoc.data ? (
                gameDoc.data.data()?.createdAt.toDate().toLocaleDateString()
              ) : (
                <IonSkeletonText />
              )}
            </strong>
          </IonCol>
          <IonCol>
            {gameDoc.status === "loading" ||
            creatorUserProfile.status === "loading" ? (
              <IonSkeletonText />
            ) : (
              gameDocData && (
                <UserChip
                  userId={gameDocData.creatorId}
                  color={userCreatedGame ? "primary" : "secondary"}
                />
              )
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{gameDoc.data?.data()?.name}</IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};

export type GamesListProps = {
  userId: string;
};

const GamesList: React.FC<GamesListProps> = ({ userId }) => {
  const firestore = useFirestore();
  const myGamesCollection = useFirestoreCollection(
    query(
      collection(firestore, gamesCollectionPath()).withConverter(GameConverter),
      ...compact([
        where("creatorId", "==", userId),
        orderBy("createdAt", "desc"),
      ]),
    ),
  );

  const allRelevantGames = uniqBy(
    [
      ...((myGamesCollection.data && myGamesCollection.data.docs) || []).map(
        (doc) => ({
          gameId: doc.id,
          createdAt: doc.data().createdAt.toDate(),
        }),
      ),
    ],
    ({ gameId }) => gameId,
  ).sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());

  return (
    <>
      <IonList>
        {myGamesCollection.status === "loading" && (
          <IonProgressBar type="indeterminate" />
        )}

        {allRelevantGames.map(({ gameId }) => (
          <GameListItem key={gameId} gameId={gameId} />
        ))}
      </IonList>
    </>
  );
};

export default GamesList;
