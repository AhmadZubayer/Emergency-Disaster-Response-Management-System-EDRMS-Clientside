'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import DisasterCard from '@/components/disaster/disaster-card';
import { Disaster } from '@/components/disaster/types';
import AddDisasterDrawer from '@/components/disaster/add-disaster-drawer';

const DisasterPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDisasters = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search?.trim()
        ? `/disaster?search=${encodeURIComponent(search.trim())}`
        : '/disaster';
      const res = await publicApi.get(url);
      const data = res.data?.data || res.data || [];
      setDisasters(Array.isArray(data) ? data : []);
    } catch {
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();
  }, [fetchDisasters]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchDisasters(val);
  };

  const handleAddClick = () => {
    if (user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') {
      setIsDrawerOpen(true);
    } else {
      router.push('/manage-disaster');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Disaster Warnings & Alerts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time emergency disaster alerts, warning levels, and affected regions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {(user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') && (
              <Button
                onClick={handleAddClick}
                className="h-10 gap-2 font-medium"
              >
                <Plus className="size-4" />
                Add Alert
              </Button>
            )}

            <Search
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={() => fetchDisasters(searchTerm)}
              placeholder="Search disasters, location..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : disasters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-3">
            <AlertTriangle className="size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold">No disaster alerts found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? 'Try adjusting your search term to find matching alerts.'
                : 'There are currently no active disaster warnings in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disasters.map((disaster) => (
              <DisasterCard
                key={disaster.id}
                disaster={disaster}
                onClick={() => router.push(`/disaster/${disaster.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <AddDisasterDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => fetchDisasters(searchTerm)}
      />
    </div>
  );
};

export default DisasterPage;
