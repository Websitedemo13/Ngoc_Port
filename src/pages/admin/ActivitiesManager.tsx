import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useAllActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from '@/hooks/useActivities';
import type { ActivityInsert } from '@/lib/supabase/activities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ActivitiesManager() {
  const navigate = useNavigate();
  const { data: activities, isLoading } = useAllActivities();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý hoạt động</h1>
            <Button variant="link" onClick={() => navigate('/admin/dashboard')} className="px-0">
              ← Quay lại Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Tính năng đang được phát triển</p>
              <p className="text-sm">Bảng hoạt động chưa được tạo trong cơ sở dữ liệu. Vui lòng tạo migration trước.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
