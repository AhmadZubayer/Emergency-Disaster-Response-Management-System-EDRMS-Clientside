'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export interface TabItem {
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface MuiTabsProps {
  tabs: TabItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (newValue: number) => void;
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mui-tabpanel-${index}`}
      aria-labelledby={`mui-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `mui-tab-${index}`,
    'aria-controls': `mui-tabpanel-${index}`,
  };
};

const MuiTabs = ({
  tabs,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  className,
}: MuiTabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <Box sx={{ width: '100%' }} className={className}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="tabs"
          variant="standard"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              backgroundColor: '#059669',
              height: 2.5,
              borderRadius: '2px 2px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              minHeight: 44,
              px: 2,
              '&.Mui-selected': {
                color: '#059669',
              },
            },
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.label}
              disabled={tab.disabled}
              {...a11yProps(idx)}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, idx) => (
        <CustomTabPanel key={idx} value={activeTab} index={idx}>
          {tab.content}
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default MuiTabs;
