'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/app/lib/public-api';
import useAuth from '@/app/hooks/useAuth';
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

  const fetchRescueRequests = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/rescue-requests');
      const data = res.data?.data || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescueRequests();
  }, []);

  const handleAddClick = () => {
    if (user) {
      setEditingRequest(null);
      setIsDrawerOpen(true);
    } else {
      router.push('/sign-in');
    }
  };

  const handleEdit = (request: RescueRequest) => {
    setSelectedRequest(null);
    setEditingRequest(request);
    setIsDrawerOpen(true);
  };

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.address?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term) ||
      r.status?.toLowerCase().includes(term) ||
      r.urgency_level?.toLowerCase().includes(term) ||
      r.contact_phone?.toLowerCase().includes(term) ||
      String(r.latitude).includes(term) ||
      String(r.longitude).includes(term)
    );
  });

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

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by address, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-card border-border/60 rounded-xl"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
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
            {filteredRequests.map((request) => (
              <RescueRequestCard
                key={request.id}
                request={request}
                onClick={() => setSelectedRequest(request)}
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
        onRefresh={fetchRescueRequests}
      />

      <AddRescueRequestDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setEditingRequest(null);
        }}
        onSuccess={() => {
          fetchRescueRequests();
          setEditingRequest(null);
        }}
        editRequest={editingRequest}
      />
    </div>
  );
};

export default RescueRequestsPage;
