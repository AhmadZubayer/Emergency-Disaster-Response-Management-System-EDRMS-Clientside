'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { X } from 'lucide-react';

interface MuiDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number | string;
  anchor?: 'left' | 'right';
}

const MuiDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 460,
  anchor = 'right',
}: MuiDrawerProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SwipeableDrawer
      anchor={isMobile ? 'bottom' : anchor}
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableEnforceFocus={true}
      disableBackdropTransition={false}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#ffffff',
            color: '#0f172a',
            backgroundImage: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...(isMobile
              ? {
                  height: '88vh',
                  maxHeight: '90vh',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }
              : {
                  width: width,
                  maxWidth: '92vw',
                  height: '100vh',
                }),
          },
        },
      }}
    >
      <div className="flex items-center gap-3 p-4 pb-3 border-b border-gray-200 shrink-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className="text-base font-bold text-gray-900 truncate">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white flex flex-col">
        {children}
      </div>
    </SwipeableDrawer>
  );
};

export default MuiDrawer;
