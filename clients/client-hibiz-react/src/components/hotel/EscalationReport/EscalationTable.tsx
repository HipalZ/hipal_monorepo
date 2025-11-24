import type { EscalationItem } from '@/components/types/hotelTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Download } from 'lucide-react';

const formatDate = (ts: number) => format(new Date(ts), 'MMM dd, HH:mm');
const msToMin = (ms: number) => (ms / 60000).toFixed(1);

interface EscalationTableProps {
  isLoading: boolean;
  data: EscalationItem[];
  pageNumber: number;
  setPageNumber: (page: number) => void;
  onExport: () => void;
}

export default function EscalationTable({ isLoading, data, pageNumber, setPageNumber, onExport }: EscalationTableProps) {
  const renderEmpty = (msg: string) => (
    <div className="text-muted-foreground flex h-64 flex-col items-center justify-center">
      <AlertTriangle className="mb-3 h-10 w-10 opacity-50" />
      <p>{msg}</p>
      <Button variant="outline" size="sm" className="mt-3">
        Try Again
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Escalation Details</CardTitle>
            <CardDescription>Full history with delay & severity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport} disabled={data.length === 0} className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Export ({data.length})</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden rounded-md border">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-background sticky top-0 z-10">
                  <TableRow>
                    {['#', 'Date', 'Service', 'User', 'Room', 'Status', 'Delay', 'Level'].map((h) => (
                      <TableHead key={h} className="font-semibold">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => {
                    const delayMin = item.deliveredAt && item.createdAt ? msToMin(item.deliveredAt - item.createdAt) : null;

                    const isDelayed = delayMin && Number.parseFloat(delayMin) > 5;
                    const isPending = item.alertProgress.includes('NON_ACCEPTED');

                    return (
                      <TableRow key={item._id} className="hover:bg-muted/50 transition-colors duration-200">
                        {/* # */}
                        <TableCell className="font-medium">{i + 1}</TableCell>

                        {/* Date */}
                        <TableCell className="whitespace-nowrap">{formatDate(item.createdAt)}</TableCell>

                        {/* Services */}
                        <TableCell>
                          <div className="flex max-w-[180px] flex-wrap gap-1">
                            {item.serviceIds.map((s) => (
                              <Badge key={s._id} variant="secondary" className="whitespace-nowrap text-xs">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* User */}
                        <TableCell>{item.userId?.name || '-'}</TableCell>

                        {/* Room */}
                        <TableCell>{item.roomId?.name || '-'}</TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={isPending ? 'destructive' : 'default'} className="text-xs">
                            {isPending ? 'Pending' : 'Delivered'}
                          </Badge>
                        </TableCell>

                        {/* Delay */}
                        <TableCell>
                          {delayMin ? (
                            <div className="flex items-center gap-1">
                              <Clock className="text-muted-foreground h-3 w-3" />
                              <span className={isDelayed ? 'text-destructive font-medium' : ''}>{delayMin} min</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Level */}
                        <TableCell>
                          <Badge variant={item.level >= 3 ? 'destructive' : item.level === 2 ? 'default' : 'secondary'} className="text-xs">
                            L{item.level}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            renderEmpty('No escalation data for selected period')
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="text-muted-foreground text-sm">
          Showing {data.length} record{data.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Page {pageNumber}</span>
          <Button variant="outline" size="sm" onClick={() => setPageNumber(pageNumber + 1)} disabled={data.length === 0 || isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
