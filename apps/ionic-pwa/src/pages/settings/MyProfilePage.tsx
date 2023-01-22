import {
  IonContent,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { doc } from "firebase/firestore";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useFirestore, useFirestoreDoc, useUser } from "reactfire";
import { userProfilesDocPath } from "../../firebase/firestorePathBuilders";
import UserProfileConverter from "../../models/dataConverters/UserProfileConverter";
import UserProfileForm from "./UserProfileForm";

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

const MyUserProfilePage: React.FC = () => {
  const firestore = useFirestore();
  const { data: authUser } = useUser();

  const userProfileDoc = useFirestoreDoc(
    doc(
      firestore,
      userProfilesDocPath({ userId: authUser?.uid || "" }),
    ).withConverter(UserProfileConverter),
  );

  return (
    <IonPage>
      <ErrorBoundary FallbackComponent={ErrorContent}>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>My Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">My Profile</IonTitle>
            </IonToolbar>
          </IonHeader>

          {userProfileDoc.status === "loading" && (
            <IonProgressBar type="indeterminate" />
          )}

          {userProfileDoc.data && (
            <UserProfileForm userProfileDoc={userProfileDoc.data} />
          )}
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default MyUserProfilePage;
