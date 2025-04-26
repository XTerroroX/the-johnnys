
import { format } from 'date-fns';
import { useBlockedTimes } from '@/hooks/useBlockedTimes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X } from 'lucide-react';

interface BlockedTimesListProps {
  barberId: string;
}

export function BlockedTimesList({ barberId }: BlockedTimesListProps) {
  const { data: blockedTimes = [], isLoading, refetch } = useBlockedTimes(barberId);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Time block removed successfully');
      refetch();
    } catch (error: any) {
      toast.error('Failed to remove time block: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (blockedTimes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No blocked times found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blockedTimes.map((block) => (
        <Card key={block.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{block.title}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(block.start_datetime), 'MMMM d, yyyy')}
              </p>
              {block.all_day ? (
                <p className="text-sm">All Day</p>
              ) : (
                <p className="text-sm">
                  {format(new Date(block.start_datetime), 'h:mm a')} - {format(new Date(block.end_datetime), 'h:mm a')}
                </p>
              )}
              {block.notes && (
                <p className="text-sm text-muted-foreground mt-2">{block.notes}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(block.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
