import { IonText } from "@ionic/react";
import classnames from "classnames";
import React from "react";
import { FormError } from "../../utilities/formState/FormState";
import css from "./FormErrors.module.css";

export type FormErrorsProps = {
  formErrors: readonly FormError[];
  className?: string;
};

const FormErrors: React.FC<FormErrorsProps> = ({ formErrors, className }) => {
  return (
    <ul className={classnames(css.list, "ion-padding-horizontal", className)}>
      {formErrors.map((formError) => {
        return (
          <li key={formError.message}>
            <IonText color="danger">{formError.message}</IonText>
          </li>
        );
      })}
    </ul>
  );
};

export default FormErrors;
