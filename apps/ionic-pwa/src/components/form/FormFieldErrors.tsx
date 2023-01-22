import { IonText } from "@ionic/react";
import React from "react";
import { FieldError } from "../../utilities/formState/FormState";
import css from "./FormFieldErrors.module.css";

export type FormFieldErrorsProps = { errors: FieldError[] };

const FormFieldErrors: React.FC<FormFieldErrorsProps> = ({ errors }) => (
  <div className={css.container} data-cy="FormFieldError">
    {errors.length === 0 && <small>&nbsp;</small>}
    {errors.map(({ message }, index) => (
      <IonText color="danger" key={message}>
        <small>
          {index > 0 && ", "}
          {message}
        </small>
      </IonText>
    ))}
  </div>
);

export default FormFieldErrors;
