import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export type ApiLoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

export function useApiData<T>(path: string): ApiLoadState<T> {
  const [state, setState] = useState<ApiLoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ status: 'success', data });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [path]);

  return state;
}