'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import RescueRequestCard from '@/components/rescue-requests/rescue-request-card';
import { RescueRequest } from '@/components/rescue-requests/types';
import RescueRequestDetailsDrawer from '@/components/rescue-requests/rescue-request-details-drawer';
import AddRescueRequestDrawer from '@/components/rescue-requests/add-rescue-request-drawer';

const RescueRequestsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<RescueRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRescueRequests = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search?.trim()
        ? `/rescue-requests?search=${encodeURIComponent(search.trim())}`
        : '/rescue-requests';
      const res = await publicApi.get(url);
      const data = res.data?.data || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRescueRequests();
  }, [fetchRescueRequests]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchRescueRequests(val);
  };

  const handleAddClick = () => {
    if (user) {
      setEditingRequest(null);
      setIsDrawerOpen(true);
    } else {
      router.push('/sign-in?returnUrl=/rescue-requests');
    }
  };

  const handleEdit = (request: RescueRequest) => {
    setSelectedRequest(null);
    setEditingRequest(request);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Rescue Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Report emergencies and coordinate real-time rescue operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleAddClick}
              className="h-10 rounded-xl gap-2 font-medium"
            >
              <Plus className="size-4" />
              Add Rescue Request
            </Button>

            <Search
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={() => fetchRescueRequests(searchTerm)}
              placeholder="Search by address, description..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-3">
            <AlertCircle className="size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold">No rescue requests found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? 'Try adjusting your search term to find matching records.'
                : 'There are currently no active rescue requests in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((request) => (
              <RescueRequestCard
                key={request.id}
                request={request}
                onClick={() => router.push(`/rescue-requests/${request.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <RescueRequestDetailsDrawer
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
        onEdit={handleEdit}
        onRefresh={() => fetchRescueRequests(searchTerm)}
      />

      <AddRescueRequestDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setEditingRequest(null);
        }}
        onSuccess={() => {
          fetchRescueRequests(searchTerm);
          setEditingRequest(null);
        }}
        editRequest={editingRequest}
      />
    </div>
  );
};

export default RescueRequestsPage;
