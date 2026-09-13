'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Error from '@/components/Error';

const ErrorContent = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || undefined;
  const description = searchParams.get('description') || undefined;
  const code = searchParams.get('code') || undefined;

  return (
    <Error
      title={title}
      description={description}
      code={code}
    />
  );
};

const ErrorPage = () => {
  return (
    <Suspense fallback={<Error />}>
      <ErrorContent />
    </Suspense>
  );
};

export default ErrorPage;
