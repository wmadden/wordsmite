import { useIonModal } from "@ionic/react";
import React, { PropsWithChildren, useEffect, useReducer } from "react";
import { useSigninCheck } from "reactfire";
import AuthModalContent from "../components/AuthModalContent";

export type AuthModalProps = PropsWithChildren<{}>;

type AuthModalProviderState = {
  presentModal: () => void;
  dismissModal: () => void;
  isSignedIn: boolean | undefined;
  modalIsOpen: boolean;
};

type AuthModalProviderAction = {
  type: "signInCheckResultReceived";
  signedIn: boolean;
};

function authModalProviderStateReducer(
  currentState: AuthModalProviderState,
  action: AuthModalProviderAction,
): AuthModalProviderState {
  const newSignedInValue = action.signedIn;

  if (currentState.isSignedIn === newSignedInValue) return currentState;

  if (
    (currentState.isSignedIn && !newSignedInValue) ||
    (currentState.isSignedIn === undefined && !newSignedInValue)
  ) {
    if (!currentState.modalIsOpen) {
      currentState.presentModal();
      return {
        ...currentState,
        isSignedIn: newSignedInValue,
        modalIsOpen: true,
      };
    }
  } else if (!currentState.isSignedIn && newSignedInValue) {
    if (currentState.modalIsOpen) {
      currentState.dismissModal();
      return {
        ...currentState,
        isSignedIn: newSignedInValue,
        modalIsOpen: false,
      };
    }
  }

  return {
    ...currentState,
    isSignedIn: newSignedInValue,
  };
}

const AuthModalProvider: React.FC<AuthModalProps> = ({ children }) => {
  const { data: signInCheckResult } = useSigninCheck();

  // TODO: render the modal inline and use isOpen to control its visibility once https://github.com/ionic-team/ionic-framework/issues/26410 is addressed
  const [presentModal, dismissModal] = useIonModal(AuthModalContent, {});
  const [, dispatch] = useReducer(authModalProviderStateReducer, {
    isSignedIn: undefined,
    modalIsOpen: false,
    presentModal,
    dismissModal,
  });

  useEffect(() => {
    dispatch({
      type: "signInCheckResultReceived",
      signedIn: signInCheckResult?.signedIn,
    });
  }, [signInCheckResult?.signedIn]);

  if (!children) {
    throw new Error("Children must be provided");
  }

  return <>{children}</>;
};

export default AuthModalProvider;
