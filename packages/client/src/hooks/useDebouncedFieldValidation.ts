import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 300;

export function useDebouncedFieldValidation<T>(
  value: T,
  validate: (value: T) => string | undefined,
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const [error, setError] = useState<string | undefined>();
  const [showError, setShowError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleValidation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setError(validate(value));
      setShowError(true);
    }, debounceMs);
  }, [debounceMs, validate, value]);

  const onBlur = useCallback(() => {
    scheduleValidation();
  }, [scheduleValidation]);

  useEffect(() => {
    if (!showError) return undefined;
    scheduleValidation();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleValidation, showError]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    error: showError ? error : undefined,
    onBlur,
    isInvalid: showError && Boolean(error),
  };
}
