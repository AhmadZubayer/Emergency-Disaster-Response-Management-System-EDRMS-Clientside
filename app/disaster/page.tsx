'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertTriangle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/app/lib/public-api';
import useAuth from '@/app/hooks/useAuth';
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

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/disaster');
      const data = res.data?.data || res.data || [];
      setDisasters(Array.isArray(data) ? data : []);
    } catch {
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  const handleAddClick = () => {
    if (user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') {
      setIsDrawerOpen(true);
    } else {
      router.push('/manage-disaster');
    }
  };

  const filteredDisasters = disasters.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.disaster_name?.toLowerCase().includes(term) ||
      d.impacted_location?.toLowerCase().includes(term) ||
      d.type?.toLowerCase().includes(term)
    );
  });

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

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search disasters, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-card border-border/60"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-32 rounded-xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : filteredDisasters.length === 0 ? (
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
            {filteredDisasters.map((disaster) => (
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
        onSuccess={fetchDisasters}
      />
    </div>
  );
};

export default DisasterPage;
