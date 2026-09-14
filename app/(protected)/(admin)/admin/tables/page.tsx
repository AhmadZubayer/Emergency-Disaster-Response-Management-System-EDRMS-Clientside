'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Database,
  Table as TableIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileJson,
  Layers,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface TableMeta {
  tableName: string;
  name: string;
  count: number;
}

export default function AdminDatabaseExplorerPage() {
  const axiosSecure = useAxiosSecure();
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTable, setSearchTable] = useState('');

  // Pagination for table rows
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  // JSON View Drawer
  const [inspectRow, setInspectRow] = useState<any | null>(null);

  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    try {
      const res = await axiosSecure.get('/admin/tables');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setTables(data);
        if (data.length > 0 && !selectedTable) {
          setSelectedTable(data[0].tableName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch database tables:', error);
    } finally {
      setLoadingTables(false);
    }
  }, [axiosSecure, selectedTable]);

  const fetchTableData = useCallback(async (tableName: string, p = 1) => {
    setLoadingData(true);
    try {
      const res = await axiosSecure.get(`/admin/tables/${tableName}`, {
        params: { page: p, limit: 10 },
      });
      const responseData = res.data?.data || res.data;
      if (responseData?.data) {
        setTableData(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotalRows(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setTableData(responseData);
        setTotalPages(1);
        setTotalRows(responseData.length);
      }
    } catch (error) {
      console.error(`Failed to fetch records for table ${tableName}:`, error);
      setTableData([]);
    } finally {
      setLoadingData(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, page);
    }
  }, [selectedTable, page, fetchTableData]);

  const filteredTables = tables.filter((t) =>
    t.tableName.toLowerCase().includes(searchTable.toLowerCase()) ||
    t.name.toLowerCase().includes(searchTable.toLowerCase())
  );

  // Extract column keys dynamically from first row
  const tableColumns = tableData.length > 0 ? Object.keys(tableData[0]).slice(0, 6) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Database className="size-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-foreground">Database & API Inspector</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            View raw database tables, inspect system schemas, and query live table records.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTables}
          disabled={loadingTables}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 ${loadingTables ? 'animate-spin' : ''}`} />
          <span>Refresh Tables</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table Selector Sidebar */}
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader className="p-4 border-b border-border/40 space-y-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600" />
              <span>Database Tables ({tables.length})</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter tables..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </CardHeader>
          <CardContent className="p-1.5 max-h-[500px] overflow-y-auto space-y-1">
            {loadingTables ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-medium">Loading tables...</div>
            ) : filteredTables.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-medium">No tables found.</div>
            ) : (
              filteredTables.map((t) => {
                const isSelected = selectedTable === t.tableName;
                return (
                  <button
                    key={t.tableName}
                    onClick={() => {
                      setSelectedTable(t.tableName);
                      setPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-300/40 shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TableIcon className="size-3.5 shrink-0 text-emerald-600" />
                      <span className="truncate">{t.tableName}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {t.count}
                    </Badge>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Table Data Viewer */}
        <Card className="border-border/60 lg:col-span-3">
          <CardHeader className="p-4 sm:p-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground font-mono">
                  <TableIcon className="size-5 text-emerald-600" />
                  <span>Table: {selectedTable || 'None Selected'}</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing raw database records for table <code className="bg-muted px-1.5 py-0.5 rounded text-emerald-600 font-mono">{selectedTable}</code>
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-mono font-bold px-3 py-1">
                {totalRows} Rows Total
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6 pt-4">
            <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {tableColumns.map((col) => (
                      <th key={col} className="p-3">
                        {col}
                      </th>
                    ))}
                    <th className="p-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {loadingData ? (
                    <tr>
                      <td colSpan={tableColumns.length + 1} className="p-8 text-center text-muted-foreground font-sans font-medium">
                        Fetching raw table records...
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + 1} className="p-8 text-center text-muted-foreground font-sans font-medium">
                        No rows stored in table <code className="text-emerald-600">{selectedTable}</code>.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                        {tableColumns.map((col) => {
                          const val = row[col];
                          const displayVal =
                            typeof val === 'object' && val !== null
                              ? JSON.stringify(val)
                              : String(val ?? 'NULL');
                          return (
                            <td key={col} className="p-3 max-w-[180px] truncate text-foreground">
                              {displayVal}
                            </td>
                          );
                        })}
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] font-sans font-semibold gap-1"
                            onClick={() => setInspectRow(row)}
                          >
                            <FileJson className="size-3.5 text-emerald-600" />
                            <span>JSON</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border/40 mt-4">
              <span className="text-xs text-muted-foreground font-medium">
                Page {page} of {totalPages} ({totalRows} Total Rows)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON Inspection Dialog */}
      {inspectRow && (
        <Dialog open={!!inspectRow} onOpenChange={() => setInspectRow(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="size-5 text-emerald-600" />
                <span>Raw Record Inspector</span>
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono max-h-96 overflow-y-auto border border-border/60">
              <pre>{JSON.stringify(inspectRow, null, 2)}</pre>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setInspectRow(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
