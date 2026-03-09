import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useStore';
import { useLanguage } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag, Package, BookOpen, FileText, QrCode, Copy, Check, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: allSettings } = useSettings();
  const { language } = useLanguage();

  // Bank settings from admin
  const settingsMap = allSettings?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>) || {};
  const bankName = settingsMap.bank_name || 'MB Bank';
  const bankCode = settingsMap.bank_code || '970422';
  const bankAccount = settingsMap.bank_account || '0123456789';
  const bankOwner = settingsMap.bank_owner || '';
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Đang tải...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <Button asChild><Link to="/store"><ArrowLeft size={16} className="mr-1" />Quay lại</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const discountedPrice = product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const totalPrice = discountedPrice * quantity;

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];

  const typeIcons: Record<string, any> = { product: Package, course: BookOpen, ebook: FileText };
  const typeLabels: Record<string, string> = { product: 'Vật phẩm', course: 'Khóa học', ebook: 'Tài liệu' };
  const TypeIcon = typeIcons[product.product_type] || Package;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Đã sao chép');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/store"><ArrowLeft size={16} className="mr-1" />{language === 'en' ? 'Back to Store' : 'Quay lại cửa hàng'}</Link>
        </Button>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              {allImages.length > 0 ? (
                <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1">
                  <TypeIcon size={12} />
                  {typeLabels[product.product_type]}
                </Badge>
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>
              <h1 className="font-serif text-3xl font-bold mb-3">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(discountedPrice)}</span>
              {product.discount_percent && product.discount_percent > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge className="bg-destructive text-destructive-foreground">-{product.discount_percent}%</Badge>
                </>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Màu sắc</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Kích thước</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSize === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium mb-2">Số lượng</p>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></Button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <Button size="icon" variant="outline" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></Button>
              </div>
            </div>

            {/* Total + Buy */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowPayment(true)}
                  disabled={product.product_type === 'product' && product.stock_quantity <= 0}
                >
                  <QrCode size={18} className="mr-2" />
                  {product.stock_quantity <= 0 && product.product_type === 'product' ? 'Hết hàng' : 'Mua ngay - Chuyển khoản'}
                </Button>
              </CardContent>
            </Card>

            {product.stock_quantity > 0 && product.product_type === 'product' && (
              <p className="text-sm text-muted-foreground">Còn {product.stock_quantity} sản phẩm</p>
            )}
          </div>
        </div>

        {/* Full description */}
        {product.full_description && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="font-serif text-2xl font-bold mb-6">Chi tiết sản phẩm</h2>
            <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.full_description }} />
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode size={20} /> Thanh toán chuyển khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <img
                src={`https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.jpg?amount=${Math.round(totalPrice)}&addInfo=${encodeURIComponent(`Mua ${product.name} x${quantity}`)}&accountName=${encodeURIComponent(bankOwner)}`}
                alt="QR Chuyển khoản"
                className="mx-auto rounded-lg max-w-[250px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Quét mã QR bằng app ngân hàng</p>
            </div>

            <div className="space-y-2 text-sm">
              {bankName && (
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Ngân hàng:</span>
                  <span className="font-medium">{bankName}</span>
                </div>
              )}
              {bankOwner && (
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Chủ TK:</span>
                  <span className="font-medium">{bankOwner}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">STK:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono">{bankAccount}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(bankAccount)}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Nội dung:</span>
                <span className="font-medium text-xs">Mua {product.name} x{quantity}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Sau khi chuyển khoản, vui lòng liên hệ qua Zalo/Facebook để xác nhận đơn hàng.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
