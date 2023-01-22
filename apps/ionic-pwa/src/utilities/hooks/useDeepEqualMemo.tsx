import isEqual from "lodash/isEqual";
import { useEffect, useState } from "react";

/**
 * Same as useMemo() but performs a deep equality check on the dependencies array using Lodash's isEqual().
 *
 * Note the limitations of isEqual() comparisons: https://lodash.com/docs/4.17.15#isEqual
 */
export default function useDeepEqualMemo<T>(factoryFn: () => T, dependencies: unknown[]): T {
  const [, setPreviousDependencies] = useState(dependencies);
  const [result, setResult] = useState(factoryFn);

  useEffect(() => {
    setPreviousDependencies(previousDependencies => {
      if (!isEqual(previousDependencies, dependencies)) {
        setResult(factoryFn());
        return dependencies;
      }
      return previousDependencies;
    });
  }, [dependencies, factoryFn]);

  return result;
}
