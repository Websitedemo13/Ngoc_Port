import { useState } from 'react';
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/hooks/useVouchers';
import { Voucher } from '@/lib/supabase/vouchers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ticket, Search } from 'lucide-react';
import { format } from 'date-fns';

const emptyForm: Partial<Voucher> = {
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: 0,
  min_order_amount: 0,
  max_discount: undefined,
  usage_limit: undefined,
  valid_from: undefined,
  valid_until: undefined,
  product_types: [],
  active: true,
};

const productTypeOptions = [
  { value: 'product', label: 'Vật phẩm' },
  { value: 'course', label: 'Khóa học' },
  { value: 'ebook', label: 'Tài liệu' },
];

export default function VouchersManager() {
  const { data: vouchers, isLoading } = useVouchers();
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Voucher>>(emptyForm);
  const [search, setSearch] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description || '',
      discount_type: v.discount_type,
      discount_value: v.discount_value,
      min_order_amount: v.min_order_amount ?? 0,
      max_discount: v.max_discount ?? undefined,
      usage_limit: v.usage_limit ?? undefined,
      valid_from: v.valid_from ? v.valid_from.slice(0, 16) : undefined,
      valid_until: v.valid_until ? v.valid_until.slice(0, 16) : undefined,
      product_types: v.product_types || [],
      active: v.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code?.trim()) { toast.error('Vui lòng nhập mã voucher'); return; }
    if (!form.discount_value || form.discount_value <= 0) { toast.error('Giá trị giảm phải > 0'); return; }

    const payload = {
      ...form,
      code: form.code!.toUpperCase().trim(),
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      product_types: form.product_types && form.product_types.length > 0 ? form.product_types : null,
      max_discount: form.max_discount || null,
      usage_limit: form.usage_limit || null,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success('Đã cập nhật voucher');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Đã tạo voucher mới');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa voucher này?')) return;
    await deleteMutation.mutateAsync(id);
    toast.success('Đã xóa voucher');
  };

  const handleToggleActive = async (v: Voucher) => {
    await updateMutation.mutateAsync({ id: v.id, data: { active: !v.active } });
  };

  const getStatus = (v: Voucher) => {
    if (!v.active) return { label: 'Tắt', variant: 'secondary' as const };
    if (v.valid_until && new Date(v.valid_until) < new Date()) return { label: 'Hết hạn', variant: 'destructive' as const };
    if (v.usage_limit && (v.used_count ?? 0) >= v.usage_limit) return { label: 'Hết lượt', variant: 'destructive' as const };
    return { label: 'Hoạt động', variant: 'default' as const };
  };

  const formatDiscount = (v: Voucher) =>
    v.discount_type === 'percent'
      ? `${v.discount_value}%`
      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discount_value);

  const filtered = vouchers?.filter(v => v.code.toLowerCase().includes(search.toLowerCase())) || [];

  const toggleProductType = (type: string) => {
    const current = form.product_types || [];
    setForm({
      ...form,
      product_types: current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket size={24} /> Quản lý Voucher</h1>
          <p className="text-muted-foreground text-sm">Tạo và quản lý mã giảm giá</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> Tạo voucher</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <Input placeholder="Tìm mã voucher..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">Chưa có voucher nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(v => {
                  const status = getStatus(v);
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <span className="font-mono font-bold">{v.code}</span>
                        {v.description && <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>}
                      </TableCell>
                      <TableCell>{formatDiscount(v)}</TableCell>
                      <TableCell>{v.used_count ?? 0}{v.usage_limit ? `/${v.usage_limit}` : ''}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell>
                        <Switch checked={v.active ?? false} onCheckedChange={() => handleToggleActive(v)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil size={14} /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa voucher' : 'Tạo voucher mới'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Mã voucher *</Label>
              <Input
                value={form.code || ''}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="VD: SALE20, GIAM50K"
                className="font-mono"
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả voucher..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Loại giảm giá</Label>
                <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giá trị giảm *</Label>
                <Input
                  type="number"
                  value={form.discount_value || ''}
                  onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}
                  placeholder={form.discount_type === 'percent' ? 'VD: 20' : 'VD: 50000'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={form.min_order_amount || ''}
                  onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              {form.discount_type === 'percent' && (
                <div>
                  <Label>Giảm tối đa (VNĐ)</Label>
                  <Input
                    type="number"
                    value={form.max_discount || ''}
                    onChange={e => setForm({ ...form, max_discount: Number(e.target.value) || undefined })}
                    placeholder="Không giới hạn"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Giới hạn sử dụng</Label>
              <Input
                type="number"
                value={form.usage_limit || ''}
                onChange={e => setForm({ ...form, usage_limit: Number(e.target.value) || undefined })}
                placeholder="Không giới hạn"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={form.valid_from || ''}
                  onChange={e => setForm({ ...form, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label>Hết hạn</Label>
                <Input
                  type="datetime-local"
                  value={form.valid_until || ''}
                  onChange={e => setForm({ ...form, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Áp dụng cho loại sản phẩm</Label>
              <div className="flex gap-2 mt-1">
                {productTypeOptions.map(opt => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={form.product_types?.includes(opt.value) ? 'default' : 'outline'}
                    onClick={() => toggleProductType(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Không chọn = áp dụng tất cả</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
