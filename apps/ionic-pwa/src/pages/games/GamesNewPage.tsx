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
import { get } from "lodash";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useHistory } from "react-router-dom";
import { useFirestore, useUser } from "reactfire";
import FormErrors from "../../components/form/FormErrors";
import FormNumberInput from "../../components/form/FormNumberInput";
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
      name: "",
      boardSize: 4,
    },
    validate: {
      fields: {
        name: validate.string.isPresent({ isRequired: "is required" }),
        boardSize: validate.all([
          validate.number.isInteger({
            mustBeWholeNumber: "must be a whole number",
          }),
          validate.number.within(
            { min: 4, max: 10 },
            {
              numberMinimum: (min) => `must be at least ${min}`,
              numberMaximum: (max) => `must be no more than ${max}`,
            },
          ),
        ]),
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
            name: values.name,
            boardSize: values.boardSize,
            creatorId: authUser.data.uid,
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
            <FormTextInput {...fields.name} label="Name" />
            <FormNumberInput {...fields.boardSize} label="Board Size" />

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
