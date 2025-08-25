"use client";

import React from 'react';
import { SearchPageContent } from '@/app/components/search-page-content';

export function SearchPageWrapper() {
  return <SearchPageContent searchParams={{
    q: undefined,
    page: undefined
  }} />;
}
