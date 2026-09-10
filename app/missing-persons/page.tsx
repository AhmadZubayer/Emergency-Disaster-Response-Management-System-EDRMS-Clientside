import api from '../lib/useAxios';
import { ENDPOINTS } from '../lib/endpoints';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

type MissingPerson = {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  contact_phone: string;
  status: string;
};

export default async function MissingPersonsPage() {
  let persons: MissingPerson[] = [];
  let error = '';

  try {
    const response = await api.get(ENDPOINTS.MISSING_PERSONS.LIST);
    persons = response.data.data;
  } catch {
    error = 'Unable to load missing person reports. Please try again later.';
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-2xl">
              Missing Persons
            </CardTitle>

            {!error && (
              <Badge variant="secondary">
                {persons.length} reports
              </Badge>
            )}
          </div>

          <CardDescription>
            View missing person reports, last known locations, and current
            status.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <p role="alert" className="py-6 text-sm text-destructive">
              {error}
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Last Seen Location</TableHead>
                    <TableHead>Last Seen Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="pr-4 text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {persons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No missing person reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    persons.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="pl-4 font-medium">
                          {person.full_name}
                        </TableCell>

                        <TableCell>{person.age}</TableCell>

                        <TableCell className="capitalize">
                          {person.gender}
                        </TableCell>

                        <TableCell>
                          {person.last_seen_location}
                        </TableCell>

                        <TableCell>
                          {person.last_seen_date}
                        </TableCell>

                        <TableCell>
                          <a
                            href={`tel:${person.contact_phone}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {person.contact_phone}
                          </a>
                        </TableCell>

                        <TableCell className="pr-4 text-right">
                          <Badge
                            variant={
                              person.status === 'MISSING'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {person.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}