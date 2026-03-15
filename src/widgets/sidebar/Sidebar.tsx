"use client";

import React from 'react';
// Reuse existing Sidebar under components/layout - wrapper for new architecture
import { Sidebar as LegacySidebar } from '@/components/layout/Sidebar';

export function Sidebar() {
  return <LegacySidebar />;
}

export default Sidebar;
