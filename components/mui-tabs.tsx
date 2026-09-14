'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabItem {
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface MuiTabsProps {
  tabs: TabItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (newValue: number) => void;
  className?: string;
}

const MuiTabs = ({ tabs, value, defaultValue = 0, onChange, className }: MuiTabsProps) => {
  return (
    <Tabs value={value} defaultValue={defaultValue} onValueChange={(nextValue) => onChange?.(Number(nextValue))} className={className}>
      <TabsList>
        {tabs.map((tab, index) => (
          <TabsTrigger key={index} value={index} disabled={tab.disabled}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={index} value={index}>{tab.content}</TabsContent>
      ))}
    </Tabs>
  );
};

export default MuiTabs;
