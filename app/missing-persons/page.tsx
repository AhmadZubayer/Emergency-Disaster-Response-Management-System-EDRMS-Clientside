'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import SearchBar from '@/components/searchbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import SleekCard from '@/components/sleekCard';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import MissingPersonDetailsDrawer from '@/components/missing-persons/missing-person-details-drawer';
import AddMissingPersonDrawer from '@/components/missing-persons/add-missing-person-drawer';

const MissingPersonsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<MissingPerson | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMissingPersons = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search?.trim()
        ? `/missing-persons?search=${encodeURIComponent(search.trim())}`
        : '/missing-persons';
      const res = await publicApi.get(url);
      const data = res.data?.data || res.data || [];
      setPersons(Array.isArray(data) ? data : []);
    } catch {
      setPersons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissingPersons();
  }, [fetchMissingPersons]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchMissingPersons(val);
  };

  const handleAddClick = () => {
    if (user) {
      setEditingPerson(null);
      setIsDrawerOpen(true);
    } else {
      router.push('/sign-in?returnUrl=/missing-persons');
    }
  };

  const handleEdit = (person: MissingPerson) => {
    setSelectedPerson(null);
    setEditingPerson(person);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground">
              Missing Persons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Help locate missing individuals or report updates to aid rescue operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleAddClick}

            >
              <Plus className="size-4" />
              Add Missing Person
            </Button>

            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={() => fetchMissingPersons(searchTerm)}
              placeholder="Search by name, location..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : persons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-muted/10 space-y-3">
            <AlertCircle className="size-10 text-muted-foreground/60" />
            <h3 className="text-sm font-medium">No missing person reports found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? 'Try adjusting your search term to find matching records.'
                : 'There are currently no active missing person reports in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {persons.map((person) => (
              <SleekCard
                key={person.id}
                person={person}
                onClick={() => router.push(`/missing-persons/${person.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <MissingPersonDetailsDrawer
        person={selectedPerson}
        open={!!selectedPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
        onEdit={handleEdit}
        onRefresh={() => fetchMissingPersons(searchTerm)}
      />

      <AddMissingPersonDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setEditingPerson(null);
        }}
        onSuccess={() => {
          fetchMissingPersons(searchTerm);
          setEditingPerson(null);
        }}
        editPerson={editingPerson}
      />
    </div>
  );
};

export default MissingPersonsPage;
