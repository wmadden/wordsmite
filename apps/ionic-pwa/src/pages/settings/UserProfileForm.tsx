import { useIonToast } from "@ionic/react";
import { DocumentSnapshot, setDoc } from "firebase/firestore";
import { get } from "lodash";
import React from "react";
import { useUser } from "reactfire";
import FormErrors from "../../components/form/FormErrors";
import FormTextInput from "../../components/form/FormTextInput";
import { UserProfile } from "../../models/UserProfile";
import { useFieldInputs } from "../../utilities/formState/useFieldInputs";
import useFormState, {
  useFieldStates,
  useForm,
  useFormErrors,
} from "../../utilities/formState/useFormState";
import validate from "../../utilities/validate/validate";

export type UserProfileFormProps = {
  userProfileDoc: DocumentSnapshot<UserProfile>;
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  userProfileDoc,
}) => {
  const { data: authUser } = useUser();
  const formState = useFormState({
    initial: {
      name: userProfileDoc.data()?.name || "",
    },
    validate: {
      fields: {
        name: validate.string.isPresent({ isRequired: "is required" }),
      },
    },
  });

  const fields = useFieldInputs(formState, useFieldStates(formState));

  const [presentToast] = useIonToast();
  const { form, submit } = useForm(formState, {
    onSubmit: async (values) => {
      if (!authUser) {
        presentToast({
          message: "You must be logged in to create a new game",
          color: "danger",
          duration: 3000,
        });
        return;
      }

      try {
        await setDoc(
          userProfileDoc.ref,
          { name: values.name },
          { merge: true },
        );

        presentToast({
          message: `Profile updated`,
          color: "success",
          duration: 1000,
        });
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
    <form {...form}>
      <FormTextInput {...fields.name} label="Name" onBlur={submit} />

      <FormErrors {...{ formErrors }} />
    </form>
  );
};

export default UserProfileForm;
