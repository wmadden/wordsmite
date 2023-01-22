import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { compact, get, uniq } from "lodash";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useHistory } from "react-router-dom";
import { useFirestore, useUser } from "reactfire";
import FormErrors from "../../components/form/FormErrors";
import FormTextInput from "../../components/form/FormTextInput";
import FiveLetterWords from "../../data/FiveLetterWords";
import createGame from "../../models/operations/createGame";
import { gamesDetailUrl, gamesListUrl } from "../../urls";
import { FieldError } from "../../utilities/formState/FormState";
import { useFieldInputs } from "../../utilities/formState/useFieldInputs";
import useFormState, {
  useFieldStates,
  useForm,
  useFormErrors,
} from "../../utilities/formState/useFormState";
import validate from "../../utilities/validate/validate";

const wordInputValidators = validate.all([
  validate.string.isPresent({ isRequired: "required" }),
  validate.string.length(
    { min: 5, max: 5 },
    {
      characterMinimum: (min) => `must be a 5 letter word`,
      characterMaximum: (max) => `must be a 5 letter word`,
    },
  ),
  ({ value }: { value: string }): FieldError[] => {
    if (!FiveLetterWords.has(value)) {
      return [{ message: "must be a recognized English word" }];
    }
    return [];
  },
]);

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

const GamesNewPage: React.FC = () => {
  const firestore = useFirestore();
  const formState = useFormState({
    initial: {
      word1: "",
      word2: "",
      word3: "",
      word4: "",
    },
    validate: {
      fields: {
        word1: wordInputValidators,
        word2: wordInputValidators,
        word3: wordInputValidators,
        word4: wordInputValidators,
      },
      form: (values) => {
        const words = [values.word1, values.word2, values.word3, values.word4];
        if (compact(words).length !== words.length) return [];
        if (uniq(words).length !== words.length) {
          return [{ message: `all ${words.length} words must be different` }];
        }
        return [];
      },
    },
  });

  const fields = useFieldInputs(formState, useFieldStates(formState));

  const authUser = useUser();
  const history = useHistory();
  const [presentToast] = useIonToast();

  const { form } = useForm(formState, {
    onSubmit: async (values) => {
      if (!authUser.data) {
        presentToast({
          message: "You must be logged in to create a new game",
          color: "danger",
          duration: 3000,
        });
        return;
      }

      try {
        const gameDoc = await createGame({
          firestore,
          game: {
            creatorId: authUser.data.uid,
            targetWords: [
              values.word1,
              values.word2,
              values.word3,
              values.word4,
            ],
          },
        });
        history.replace(gamesDetailUrl({ gameId: gameDoc.id }));
      } catch (e) {
        presentToast({
          message: `Error: ${get(e, "message")}`,
          color: "danger",
          duration: 3000,
        });
      }
    },
  });

  const { formErrors } = useFormErrors(formState);

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

            <IonTitle>New Game</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <form {...form}>
            <FormTextInput {...fields.word1} label="Word 1" />
            <FormTextInput {...fields.word2} label="Word 2" />
            <FormTextInput {...fields.word3} label="Word 3" />
            <FormTextInput {...fields.word4} label="Word 4" />

            <FormErrors {...{ formErrors }} />

            <div className="ion-padding">
              <IonButton type="submit">Create Game</IonButton>
            </div>
          </form>
        </IonContent>
      </ErrorBoundary>
    </IonPage>
  );
};

export default GamesNewPage;
