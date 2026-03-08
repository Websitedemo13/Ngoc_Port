import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  useAllActivities,
} from '@/hooks/useActivities';

export default function ActivitiesManager() {
  const { data: activities, isLoading } = useAllActivities();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý hoạt động</h1>
        <p className="text-sm text-muted-foreground">Thêm và chỉnh sửa các hoạt động</p>
      </div>

      <Card className="rounded-2xl">
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
  );
}
