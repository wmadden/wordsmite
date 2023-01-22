import { isPlatform } from "@ionic/react";
import { getAuth } from "firebase/auth/cordova";
import {
  enableIndexedDbPersistence,
  initializeFirestore,
} from "firebase/firestore";
import React, { PropsWithChildren } from "react";
import {
  AuthProvider,
  FirestoreProvider,
  useFirebaseApp,
  useInitFirestore,
} from "reactfire";

type FirestoreLayerProps = PropsWithChildren<{}>;

type FirestoreInternalProperties = {
  _initialized: boolean;
};

const FirestoreLayer: React.FC<FirestoreLayerProps> = ({ children }) => {
  const {
    status: firestoreStatus,
    error,
    data: firestore,
  } = useInitFirestore(async (firebaseApp) => {
    const db = initializeFirestore(firebaseApp, {});
    if (isPlatform("capacitor")) {
      if (!(db as unknown as FirestoreInternalProperties)._initialized) {
        await enableIndexedDbPersistence(db);
      }
    }
    return db;
  });

  if (firestoreStatus === "loading") {
    return <></>;
  }

  if (firestoreStatus === "error") {
    return <div>ERROR: {error?.message}</div>;
  }

  return <FirestoreProvider sdk={firestore}>{children}</FirestoreProvider>;
};
export type FirebaseSdkComponentsProps = PropsWithChildren<{}>;

const FirebaseSdkProviders: React.FC<FirebaseSdkComponentsProps> = ({
  children,
}) => {
  const app = useFirebaseApp();
  const auth = getAuth(app);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreLayer>{children}</FirestoreLayer>
    </AuthProvider>
  );
};

export default FirebaseSdkProviders;
