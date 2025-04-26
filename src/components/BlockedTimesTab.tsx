
import { BlockTimeDialog } from './BlockTimeDialog';
import { BlockedTimesList } from './BlockedTimesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlockedTimesTabProps {
  barberId: string;
}

export function BlockedTimesTab({ barberId }: BlockedTimesTabProps) {
  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold truncate">Time Off Management</h1>
        <div className="w-full sm:w-auto">
          <BlockTimeDialog barberId={barberId} onSuccess={() => {}} />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Blocked Times</CardTitle>
          <CardDescription>
            Manage your blocked time slots and days off
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <BlockedTimesList barberId={barberId} />
        </CardContent>
      </Card>
    </div>
  );
}
