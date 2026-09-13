'use client';

import React from 'react';
import Error from '@/components/Error';

const NotFound = () => {
  return (
    <Error
      title="Page Not Found"
      description="The page you are looking for does not exist or has been moved."
      code="404"
    />
  );
};

export default NotFound;
