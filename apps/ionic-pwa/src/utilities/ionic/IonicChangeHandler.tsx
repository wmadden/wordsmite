export type IonicChangeHandler = (
  event: CustomEvent<{
    value: string | undefined | null;
  }>,
) => void;
