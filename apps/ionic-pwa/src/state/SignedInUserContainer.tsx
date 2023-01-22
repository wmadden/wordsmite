import { User } from "firebase/auth";

import React, { useMemo } from "react";

export type SignedInUser = {
  authUser: User;
  userId: string;
};

export const EMPTY: unique symbol = Symbol("empty");

const Context = React.createContext<SignedInUser | typeof EMPTY>(EMPTY);

type ProviderProps = React.PropsWithChildren<{
  authUser: User;
}>;

const SignedInUserProvider: React.FC<ProviderProps> = ({
  authUser,
  children,
}) => {
  const value = useMemo<SignedInUser>(
    () => ({
      authUser,
      userId: authUser.uid,
    }),
    [authUser],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

function useSignedInUserContainer(): SignedInUser {
  const value = React.useContext(Context);
  if (value === EMPTY) {
    throw new Error("Component must be wrapped with <Container.Provider>");
  }
  return value;
}

const SignedInUserContainer = {
  Provider: SignedInUserProvider,
  useContainer: useSignedInUserContainer,
};

export default SignedInUserContainer;
