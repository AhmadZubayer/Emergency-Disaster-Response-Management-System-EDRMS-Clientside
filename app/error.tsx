'use client';

import React from 'react';
import ErrorComponent from '@/components/Error';

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <ErrorComponent
      title="Something went wrong"
      description={error?.message || 'A sudden server disconnect or error occurred.'}
      code={error?.digest || '500'}
      onAction={reset}
      actionText="Try Again"
    />
  );
};

export default GlobalError;
