"use client";

import React from 'react';
// Reuse existing Header under components/layout - wrapper for new architecture
import { Header as LegacyHeader } from '@/components/layout/Header';

export function Header() {
  return <LegacyHeader />;
}

export default Header;
