'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, User, Search, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { publicApi } from '@/app/lib/public-api';
import MissingPersonDialog, { MissingPerson } from '@/components/missing-persons/missing-person-dialog';

const MissingPersonsPage = () => {
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Missing Persons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Help locate missing individuals or report updates to aid rescue operations.
            </p>
          </div>

          <div className="relative w-full md:w-72">
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersons.map((person) => {
              const isMissing = person.status?.toUpperCase() === 'MISSING';

              return (
                <Card
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 w-full bg-muted flex items-center justify-center overflow-hidden">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="size-12 text-muted-foreground/40" />
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={isMissing ? 'destructive' : 'default'}
                          className="text-[10px] font-bold uppercase tracking-wider shadow-sm"
                        >
                          {person.status}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2 space-y-1">
                      <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                        {person.full_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {person.gender} • {person.age} years old
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground/80" />
                        <span className="line-clamp-1">{person.last_seen_location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 shrink-0 text-muted-foreground/80" />
                        <span>{person.last_seen_date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/90 line-clamp-2 pt-1">
                        {person.description || 'No description provided.'}
                      </p>
                    </CardContent>
                  </div>

                  <CardFooter className="p-4 pt-0 text-xs text-primary font-medium group-hover:underline underline-offset-4">
                    View Details &rarr;
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <MissingPersonDialog
        person={selectedPerson}
        open={!!selectedPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
      />
    </div>
  );
};

export default MissingPersonsPage;
