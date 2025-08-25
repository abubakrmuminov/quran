"use client";

import React from 'react';
import { HomePageContent } from '@/app/components/home-page-content';

export function HomePageContentWrapper({ chapters }: { chapters: any[] }) {
  return <HomePageContent chapters={chapters} />;
}
