// Copied from https://github.com/jamiebuilds/unstated-next/blob/master/src/unstated-next.tsx
import React from "react";

export const EMPTY: unique symbol = Symbol("empty");

export interface ContainerProviderProps<State = void> {
  initialState?: State;
  children?: React.ReactNode;
}

export interface Container<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>;
  useContainer: () => Value;
}

export interface TestContainer<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>;
  useContainer: () => Value;
  Context: React.Context<Value | typeof EMPTY>;
}

export function createContainer<Value, State = void>(
  useHook: (initialState?: State) => Value,
): Container<Value, State> {
  const Context = React.createContext<Value | typeof EMPTY>(EMPTY);

  const Provider = ({
    initialState,
    children,
  }: {
    initialState?: State;
    children?: React.ReactNode;
  }) => {
    const value = useHook(initialState);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  function useContainer(): Value {
    const value = React.useContext(Context);
    if (value === EMPTY) {
      throw new Error("Component must be wrapped with <Container.Provider>");
    }
    return value;
  }

  if (process.env.NODE_ENV === "test") {
    return { Context, Provider, useContainer } as Container<Value, State>;
  }

  return { Provider, useContainer };
}
