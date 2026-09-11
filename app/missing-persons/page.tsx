'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/app/lib/public-api';
import useAuth from '@/app/hooks/useAuth';
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

  const fetchMissingPersons = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/missing-persons');
      const data = res.data?.data || res.data || [];
      setPersons(Array.isArray(data) ? data : []);
    } catch {
      setPersons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissingPersons();
  }, []);

  const handleAddClick = () => {
    if (user) {
      setEditingPerson(null);
      setIsDrawerOpen(true);
    } else {
      router.push('/sign-in');
    }
  };

  const handleEdit = (person: MissingPerson) => {
    setSelectedPerson(null);
    setEditingPerson(person);
    setIsDrawerOpen(true);
  };

  const filteredPersons = persons.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(term) ||
      p.last_seen_location?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Missing Persons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Help locate missing individuals or report updates to aid rescue operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleAddClick}
              className="h-10 rounded-xl gap-2 font-medium"
            >
              <Plus className="size-4" />
              Add Missing Person
            </Button>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, location..."
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
        ) : filteredPersons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-3">
            <AlertCircle className="size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold">No missing person reports found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? 'Try adjusting your search term to find matching records.'
                : 'There are currently no active missing person reports in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersons.map((person) => (
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
        onRefresh={fetchMissingPersons}
      />

      <AddMissingPersonDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setEditingPerson(null);
        }}
        onSuccess={() => {
          fetchMissingPersons();
          setEditingPerson(null);
        }}
        editPerson={editingPerson}
      />
    </div>
  );
};

export default MissingPersonsPage;

