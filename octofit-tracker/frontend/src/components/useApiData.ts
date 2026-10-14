import { useEffect, useState } from 'react';

export type ApiLoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

export function useApiData<T>(path: string, load: (path: string) => Promise<T>): ApiLoadState<T> {
  const [state, setState] = useState<ApiLoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    load(path)
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [load, path]);

  return state;
}