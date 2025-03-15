
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Download } from 'lucide-react';
import { format } from 'date-fns';

type ExportType = 'activities' | 'badges' | 'media' | 'all';

export function DataExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('all');

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Get user's role and team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id, role')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'team_manager' && profile.role !== 'admin') {
        toast({
          title: 'Error',
          description: 'Only team managers and admins can export data',
          variant: 'destructive',
        });
        return;
      }

      // Prepare query conditions based on role
      const teamCondition = profile.role === 'admin' ? {} : { team_id: profile.team_id };

      // Fetch data based on export type
      let data: any[] = [];
      let filename = '';

      if (exportType === 'activities' || exportType === 'all') {
        const { data: activities } = await supabase
          .from('activities')
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .match(teamCondition);
        
        if (activities) {
          data.push({
            name: 'Activities',
            headers: ['User', 'Email', 'Type', 'Distance (m)', 'Duration (s)', 'Notes', 'Date'],
            rows: activities.map(a => [
              a.profiles.full_name,
              a.profiles.email,
              a.activity_type,
              a.distance || '',
              a.duration,
              a.notes || '',
              format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss')
            ])
          });
        }
      }

      if (exportType === 'badges' || exportType === 'all') {
        const { data: badges } = await supabase
          .from('user_badges')
          .select(`
            *,
            badges (
              name,
              description,
              tier,
              requirement_type,
              requirement_value
            ),
            profiles:user_id (
              full_name,
              email
            )
          `)
          .match(teamCondition);

        if (badges) {
          data.push({
            name: 'Badges',
            headers: ['User', 'Email', 'Badge', 'Description', 'Tier', 'Earned At'],
            rows: badges.map(b => [
              b.profiles.full_name,
              b.profiles.email,
              b.badges.name,
              b.badges.description,
              b.badges.tier,
              format(new Date(b.earned_at), 'yyyy-MM-dd HH:mm:ss')
            ])
          });
        }
      }

      if (exportType === 'media' || exportType === 'all') {
        const { data: media } = await supabase
          .from('media')
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .match(teamCondition);

        if (media) {
          data.push({
            name: 'Media',
            headers: ['User', 'Email', 'Type', 'URL', 'Caption', 'Uploaded At'],
            rows: media.map(m => [
              m.profiles.full_name,
              m.profiles.email,
              m.media_type,
              m.url,
              m.caption || '',
              format(new Date(m.created_at), 'yyyy-MM-dd HH:mm:ss')
            ])
          });
        }
      }

      // Generate Excel-compatible CSV content
      let csvContent = '';
      data.forEach(sheet => {
        csvContent += `${sheet.name}\n`;
        csvContent += sheet.headers.join(',') + '\n';
        sheet.rows.forEach((row: any[]) => {
          csvContent += row.map(cell => {
            // Escape cells containing commas or quotes
            if (cell.toString().includes(',') || cell.toString().includes('"')) {
              return `"${cell.toString().replace(/"/g, '""')}"`;
            }
            return cell;
          }).join(',') + '\n';
        });
        csvContent += '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      filename = `rowquest_export_${exportType}_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={exportType} onValueChange={(value) => setExportType(value as ExportType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select data to export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="activities">Activities Only</SelectItem>
              <SelectItem value="badges">Badges Only</SelectItem>
              <SelectItem value="media">Media Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            'Exporting...'
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export to CSV
            </>
          )}
        </Button>

        <p className="text-sm text-gray-600">
          Note: Team managers can only export their team's data, while admins can export data for all teams.
        </p>
      </CardContent>
    </Card>
  );
}
