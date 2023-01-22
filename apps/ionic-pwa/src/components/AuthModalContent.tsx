import {
  IonButton,
  IonContent,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonToolbar,
} from "@ionic/react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useAuth } from "reactfire";
import isFirebaseError from "../utilities/firebase/client/isFirebaseError";
import { getStringLiteral } from "../utilities/firebase/firestore/dataHelpers";
import { useFieldInputs } from "../utilities/formState/useFieldInputs";
import useFormState, {
  useFieldStates,
  useForm,
  useFormErrors,
} from "../utilities/formState/useFormState";
import validate from "../utilities/validate/validate";
import FormErrors from "./form/FormErrors";
import FormTextInput from "./form/FormTextInput";

export type LoginFormProps = {};

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const auth = useAuth();
  const formState = useFormState<LoginFormValues>({
    initial: {
      email: "",
      password: "",
    },
    validate: {
      fields: {
        email: validate.string.isPresent({ isRequired: "is required" }),
        password: validate.string.isPresent({ isRequired: "is required" }),
      },
    },
  });

  const fields = useFieldInputs(formState, useFieldStates(formState));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form } = useForm(formState, {
    onSubmit: useCallback(async (values) => {
      try {
        setIsSubmitting(true);
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } catch (error) {
        if (isFirebaseError(error)) {
          formState.setFormErrors([
            { message: `${error.message} (${error.code})` },
          ]);
          return;
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }, []),
  });
  const formErrors = useFormErrors(formState);

  return (
    <form {...form}>
      <FormTextInput label="Email" {...fields.email} />
      <FormTextInput label="Password" {...fields.password} type="password" />

      <FormErrors {...formErrors} />

      <div className="ion-padding-horizontal">
        <IonButton
          type="submit"
          color="primary"
          fill="solid"
          expand="block"
          data-cy="InviteCodeFormCard-join-button"
          className="ion-margin-top"
        >
          <span>{isSubmitting ? <IonSpinner /> : "Log In"}</span>
        </IonButton>
      </div>
    </form>
  );
};

export type RegisterFormProps = {};

type RegisterFormValues = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

const RegisterForm: React.FC<RegisterFormProps> = (props) => {
  const auth = useAuth();
  const formState = useFormState<RegisterFormValues>({
    initial: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validate: {
      fields: {
        email: validate.string.isPresent({ isRequired: "is required" }),
        password: validate.string.length(
          { min: 8 },
          {
            characterMinimum: (min) => `must be at least ${min} characters`,
          },
        ),
        passwordConfirmation: (fieldState) => {
          if (fieldState.value === fields.password.value) return [];
          return [
            {
              message: "must match password",
            },
          ];
        },
      },
    },
  });

  const fields = useFieldInputs(formState, useFieldStates(formState));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form } = useForm(formState, {
    onSubmit: useCallback(async (values) => {
      try {
        setIsSubmitting(true);

        await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password,
        );
      } catch (error) {
        if (isFirebaseError(error)) {
          formState.setFormErrors([
            { message: `${error.message} (${error.code})` },
          ]);
          return;
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }, []),
  });
  const formErrors = useFormErrors(formState);

  return (
    <form {...form}>
      <FormTextInput label="Email" {...fields.email} />
      <FormTextInput label="Password" {...fields.password} type="password" />
      <FormTextInput
        label="Confirm Password"
        {...fields.passwordConfirmation}
        type="password"
      />

      <FormErrors {...formErrors} />

      <div className="ion-padding-horizontal">
        <IonButton
          type="submit"
          color="primary"
          fill="solid"
          expand="block"
          data-cy="InviteCodeFormCard-join-button"
          className="ion-margin-top"
        >
          <span>{isSubmitting ? <IonSpinner /> : "Create Account"}</span>
        </IonButton>
      </div>
    </form>
  );
};

export type AuthModalContentProps = {};

const AuthModalContent: React.FC<AuthModalContentProps> = (props) => {
  const [selectedSegment, setSelectedSegment] = useState<"logIn" | "register">(
    "logIn",
  );

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonSegment
            value={selectedSegment}
            onIonChange={(event) => {
              const newSelectedSegment = getStringLiteral(event.detail.value, {
                permitted: ["logIn", "register"],
                fallback: "logIn",
              });
              setSelectedSegment(newSelectedSegment);
            }}
          >
            <IonSegmentButton value="logIn">Log In</IonSegmentButton>
            <IonSegmentButton value="register">Register</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {selectedSegment === "logIn" ? <LoginForm /> : <RegisterForm />}
      </IonContent>
    </>
  );
};

export default AuthModalContent;
