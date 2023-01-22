import React, { ReactElement } from "react";
import { useSigninCheck, useUser } from "reactfire";
import SignedInUserContainer from "../state/SignedInUserContainer";

export type RequireSignedInUserProps = React.PropsWithChildren<{
  fallback: ReactElement | null;
}>;

const RequireSignedInUser: React.FC<RequireSignedInUserProps> = ({
  children,
  fallback,
}) => {
  const { status, data: signInCheckResult } = useSigninCheck();
  const authUser = useUser();

  if (signInCheckResult.signedIn === true && authUser.data) {
    return (
      <SignedInUserContainer.Provider authUser={authUser.data}>
        {children}
      </SignedInUserContainer.Provider>
    );
  } else {
    return fallback;
  }
};

export default RequireSignedInUser;
