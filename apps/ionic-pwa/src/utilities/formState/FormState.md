Library goals:

- Represent state of a form independent of its display
- Strict type checking of all form fields' state at all times
- Make it difficult for future developers to fuck up the form, e.g. by:
  - Changing the API request structure but not updating the form
  - Changing the input components' behavior

State is maintained in the FormState class. To make sure React components are updated correctly, the current form state is only ever accessible through hooks, but operations that change state are exposed more readily. I.e. the library consumer is permitted to modify state how they like, but may only read it via interfaces returned by hooks.

Of course, for edge cases where you need complete control over the FormState you can create your own instance.

We keep field values' handling very simple:

- every field has a known value at all times
- every value is strictly typed
- for this reason, the initial value of all fields must be passed to the FormState constructor
- you can only ever set a field's value to the correct type

HTML form inputs have an initial "unset" state not representable in this way. If you want a field to have a possible empty state, you must make its value optionally `null` or `undefined` and the corresponding input component must support this value.

Mapping of a user's input to the internally stored state (e.g. a user writes text but it should be stored as a number) is expected to happen in the input component, and only the final parsed result should be stored in the FormState. This makes validations very simple.

Because field values are stored in their correct type, there's no reason to have validations that check type (e.g. validate a field value is a number). Validations should check the content of a value, e.g. that a number is greater than the minimum, less than the maximum, or relationships between values in a form.

Validations on an input will be performed when its value is committed (usually on blur or submit).

- The `FormState` class:
  - Maintains state of all fields and provides methods to modify state
  - Emits events when fields change
  - Must be instantiated with the initial state of all fields
  - Not usually accessible; instantiated by `useFormState()` and then stored internally
- Hooks:
  - Are used to access form state and manage subscriptions to changes
  - `useFormState(initialFieldValues, validations): formStateRef & methods`
    - Creates a FormState instance
    - Returns a reference to the FormState which can be passed to other hooks or stored in context
    - Returns methods for manipulating the FormState
    - Does not return the FormState instance or provide access to the current state
    - The returned object is stable for the lifetime of the component, i.e. it never changes
  - `useFieldStates(formState)`
    - Returns a dictionary of field ID to state objects (`name`, `value`, `errors`) and maintains a subscription to the underlying `FormState` to keep it up-to-date
    - Takes as input the formState, output from `useFormState()`, and optionally the list of fields to subscribe to (defaults to all fields)
    - Note that only the subscribed fields will be available in the output, preventing you from accidentally using values without subscribing to updates to them
  - `useFieldInputs(formState, fieldStates)`
    - Takes a subscribed set of fields, the output of `useFieldStates()`
    - Returns a dictionary of field ID to spreadable input interface, including the props `id`, `onChange` and `onBlur`
  - `useForm(formState, submitHandler)`
    - Returns a spreadable object intended for a `<form>` input which provides the `onSubmit()` handler for the form
    - Calls the provided `submitHandler` if validations pass

Validations are implemented by the `validate` microlib.
