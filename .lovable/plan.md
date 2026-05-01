

## Phân tích yêu cầu

Bạn muốn thêm hệ thống **Voucher/Mã giảm giá** cho Store với các tính năng:
- Admin tạo/quản lý voucher codes
- Khách hàng nhập mã giảm giá khi thanh toán
- Tính toán logic giảm giá (% hoặc số tiền cố định)
- Hiển thị giá sau giảm trong QR payment

---

## Kế hoạch triển khai

### 1. Database: Tạo bảng `vouchers`

```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,           -- Mã voucher (VD: SALE20, FREESHIP)
  description TEXT,                     -- Mô tả
  discount_type TEXT NOT NULL DEFAULT 'percent', -- 'percent' hoặc 'fixed'
  discount_value NUMERIC NOT NULL,      -- Giá trị giảm (20 = 20% hoặc 50000 = 50k)
  min_order_amount NUMERIC DEFAULT 0,   -- Đơn tối thiểu để áp dụng
  max_discount NUMERIC,                 -- Giảm tối đa (cho % discount)
  usage_limit INTEGER,                  -- Số lần sử dụng tối đa
  used_count INTEGER DEFAULT 0,         -- Đã sử dụng bao nhiêu lần
  valid_from TIMESTAMPTZ,               -- Bắt đầu hiệu lực
  valid_until TIMESTAMPTZ,              -- Hết hạn
  product_types TEXT[],                 -- Áp dụng cho loại nào (null = tất cả)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

RLS Policies:
- Admin: Full CRUD
- Public: Chỉ SELECT active vouchers

### 2. API Layer: `src/lib/supabase/vouchers.ts`

- `validateVoucher(code, orderAmount, productType)` - Kiểm tra mã hợp lệ
- `calculateDiscount(voucher, amount)` - Tính số tiền giảm
- CRUD functions cho admin

### 3. Hooks: `src/hooks/useVouchers.ts`

- `useVouchers()` - Lấy tất cả vouchers (admin)
- `useValidateVoucher()` - Mutation validate mã
- `useCreateVoucher()`, `useUpdateVoucher()`, `useDeleteVoucher()`

### 4. StoreDetail.tsx - Thêm voucher UI

**Cập nhật trang thanh toán:**
- Input nhập mã giảm giá + nút "Áp dụng"
- Hiển thị voucher đã áp dụng (tên, giá trị giảm)
- Nút xóa voucher
- Tính lại totalPrice sau khi áp dụng voucher
- QR code tự động cập nhật với giá mới

**Logic tính toán:**
```
subtotal = discountedPrice × quantity  (giá sau giảm sản phẩm)
voucherDiscount = calculateDiscount(voucher, subtotal)
finalPrice = subtotal - voucherDiscount
```

### 5. Admin: `src/pages/admin/VouchersManager.tsx`

**Giao diện quản lý voucher:**
- Danh sách voucher với status (active/expired/used up)
- Form tạo/sửa voucher:
  - Mã code (auto-uppercase)
  - Loại giảm giá (% / số tiền cố định)
  - Giá trị giảm
  - Đơn tối thiểu, giảm tối đa
  - Giới hạn số lần sử dụng
  - Thời gian hiệu lực
  - Loại sản phẩm áp dụng
- Toggle active/inactive
- Thống kê sử dụng (used/limit)

### 6. Routes & Navigation

- Thêm `/admin/vouchers` route
- Thêm menu item trong AdminLayout

---

## Chi tiết kỹ thuật

### Voucher Validation Logic

```typescript
function validateVoucher(voucher, orderAmount, productType) {
  if (!voucher.active) return { valid: false, error: 'Mã không còn hiệu lực' };
  if (voucher.valid_from && new Date() < voucher.valid_from) return { valid: false, error: 'Mã chưa có hiệu lực' };
  if (voucher.valid_until && new Date() > voucher.valid_until) return { valid: false, error: 'Mã đã hết hạn' };
  if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) return { valid: false, error: 'Mã đã hết lượt sử dụng' };
  if (orderAmount < voucher.min_order_amount) return { valid: false, error: `Đơn tối thiểu ${formatPrice(voucher.min_order_amount)}` };
  if (voucher.product_types?.length && !voucher.product_types.includes(productType)) return { valid: false, error: 'Mã không áp dụng cho sản phẩm này' };
  return { valid: true };
}
```

### Discount Calculation

```typescript
function calculateDiscount(voucher, amount) {
  if (voucher.discount_type === 'percent') {
    const discount = amount * (voucher.discount_value / 100);
    return voucher.max_discount ? Math.min(discount, voucher.max_discount) : discount;
  }
  return Math.min(voucher.discount_value, amount); // Fixed: không giảm quá tổng tiền
}
```

---

## Tóm tắt Files

| File | Mô tả |
|------|-------|
| `supabase/migrations/...` | Tạo bảng vouchers + RLS |
| `src/lib/supabase/vouchers.ts` | API functions |
| `src/hooks/useVouchers.ts` | React Query hooks |
| `src/pages/StoreDetail.tsx` | Thêm voucher input + logic tính tiền |
| `src/pages/admin/VouchersManager.tsx` | Trang quản lý voucher |
| `src/App.tsx` | Thêm route admin/vouchers |
| `src/components/admin/AdminLayout.tsx` | Thêm menu item |

