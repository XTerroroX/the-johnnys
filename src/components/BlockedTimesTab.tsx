
import { BlockTimeDialog } from './BlockTimeDialog';
import { BlockedTimesList } from './BlockedTimesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockedTimesTabProps {
  barberId: string;
}

export function BlockedTimesTab({ barberId }: BlockedTimesTabProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Time Off Management</h1>
        <BlockTimeDialog barberId={barberId} onSuccess={() => {}} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Times</CardTitle>
          <CardDescription>
            Manage your blocked time slots and days off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedTimesList barberId={barberId} />
        </CardContent>
      </Card>
    </div>
  );
}
