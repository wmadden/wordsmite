import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getString,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import { UserProfile } from "../UserProfile";

function userProfileToFirestoreData(
  userProfile: PartialWithFieldValue<UserProfile>,
): Record<string, unknown> {
  return userProfile;
}

function firestoreDataToUserProfile(data: StrictDocumentData): UserProfile {
  return {
    name: getString(data.name),
  };
}

const UserProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (userProfile) => userProfileToFirestoreData(userProfile),
  fromFirestore: (snapshot) => firestoreDataToUserProfile(snapshot.data()),
};

export default UserProfileConverter;
