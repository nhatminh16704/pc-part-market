import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useMyAddresses } from '@/features/customer/hooks/useCustomer';
import {
  useCheckoutSession,
  useConfirmCheckoutSession,
  useUpdateCheckoutSession,
} from '@/features/checkout/hooks/useCheckout';
import type {
  CheckoutShippingAddress,
  ConfirmCheckoutResponse,
  PaymentMethod,
} from '@/features/checkout/types';
import { formatVND } from '@/utils/format';

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; desc: string }> = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi shipper giao hàng' },
  { value: 'VNPAY', label: 'VNPAY', desc: 'Thanh toán qua cổng VNPAY QR / Thẻ nội địa' },
  { value: 'MOMO', label: 'Ví MoMo', desc: 'Thanh toán nhanh qua ví điện tử MoMo' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trực tiếp qua QR ngân hàng' },
];

const EMPTY_ADDRESS: CheckoutShippingAddress = {
  receiverName: '',
  receiverPhone: '',
  province: '',
  district: '',
  ward: '',
  streetAddress: '',
  postalCode: '',
};

export const Checkout: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: session, isLoading, isError } = useCheckoutSession(sessionId);
  const { data: savedAddresses } = useMyAddresses();
  const updateSession = useUpdateCheckoutSession(sessionId || '');
  const confirmSession = useConfirmCheckoutSession(sessionId || '');

  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [addressForm, setAddressForm] = useState<CheckoutShippingAddress>(EMPTY_ADDRESS);
  const [voucherInput, setVoucherInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmCheckoutResponse | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const initializedAddressRef = useRef(false);
  const requestIdRef = useRef<string>(crypto.randomUUID());

  // Sync local form fields when session loads
  useEffect(() => {
    if (!session) return;
    setVoucherInput(session.voucherCode ?? '');
    setNoteInput(session.note ?? '');
    if (session.shippingAddress) {
      setAddressForm({
        ...EMPTY_ADDRESS,
        ...session.shippingAddress,
        postalCode: session.shippingAddress.postalCode ?? '',
      });
    }
  }, [session?.id]);

  // Auto-apply customer's default saved address if session has none yet
  useEffect(() => {
    if (!session || initializedAddressRef.current) return;
    if (session.shippingAddress) {
      initializedAddressRef.current = true;
      return;
    }
    if (!savedAddresses || savedAddresses.length === 0) return;

    const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    initializedAddressRef.current = true;
    setSelectedAddressId(defaultAddr.id);

    const mapped: CheckoutShippingAddress = {
      receiverName: defaultAddr.receiverName,
      receiverPhone: defaultAddr.receiverPhone,
      province: defaultAddr.province,
      district: defaultAddr.district,
      ward: defaultAddr.ward,
      streetAddress: defaultAddr.streetAddress,
      postalCode: defaultAddr.postalCode ?? '',
    };
    setAddressForm(mapped);
    updateSession.mutate({ shippingAddress: mapped });
  }, [session, savedAddresses]);

  // Countdown timer for 15-minute Redis TTL
  useEffect(() => {
    if (!session?.expiresAt) return;
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [session?.expiresAt]);

  if (!accessToken) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h1>
          <p className="text-sm text-slate-500 mb-6">
            Bạn cần đăng nhập để truy cập phiên thanh toán này.
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#ff5636] hover:bg-[#e63e1c] text-white">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-sm text-slate-600 mb-6">
            Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-bold text-slate-900">{confirmedOrder.orderNumber || `#${confirmedOrder.orderId}`}</span>
            </div>
            {confirmedOrder.orderId > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-semibold text-slate-700">#{confirmedOrder.orderId}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="bg-[#ff5636] hover:bg-[#e63e1c] text-white w-full sm:w-auto">
                Tiếp tục mua sắm
              </Button>
            </Link>
            <Link to="/account">
              <Button variant="outline" className="w-full sm:w-auto">
                Về trang tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !session || remainingSeconds === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Phiên thanh toán đã hết hạn hoặc không tồn tại
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Mỗi phiên thanh toán có hiệu lực trong 15 phút. Vui lòng quay lại giỏ hàng hoặc sản phẩm để tạo phiên mới.
          </p>
          <Link to="/">
            <Button className="bg-[#ff5636] hover:bg-[#e63e1c] text-white">
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    const found = savedAddresses?.find((a) => a.id === addrId);
    if (!found) return;
    const mapped: CheckoutShippingAddress = {
      receiverName: found.receiverName,
      receiverPhone: found.receiverPhone,
      province: found.province,
      district: found.district,
      ward: found.ward,
      streetAddress: found.streetAddress,
      postalCode: found.postalCode ?? '',
    };
    setAddressForm(mapped);
    setErrorMessage(null);
    updateSession.mutate({ shippingAddress: mapped });
  };

  const isAddressComplete = (addr: CheckoutShippingAddress) =>
    Boolean(
      addr.receiverName.trim() &&
        addr.receiverPhone.trim() &&
        addr.province.trim() &&
        addr.district.trim() &&
        addr.ward.trim() &&
        addr.streetAddress.trim()
    );

  const handleSaveAddress = async () => {
    if (!isAddressComplete(addressForm)) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin người nhận và địa chỉ giao hàng.');
      return false;
    }
    setErrorMessage(null);
    await updateSession.mutateAsync({ shippingAddress: addressForm });
    return true;
  };

  const handleConfirmOrder = async () => {
    setErrorMessage(null);
    try {
      const addressOk = await handleSaveAddress();
      if (!addressOk) return;

      if (noteInput !== (session.note ?? '') || voucherInput !== (session.voucherCode ?? '')) {
        await updateSession.mutateAsync({
          note: noteInput,
          voucherCode: voucherInput,
        });
      }

      const result = await confirmSession.mutateAsync(requestIdRef.current);
      setConfirmedOrder(result);
    } catch (err: any) {
      requestIdRef.current = crypto.randomUUID();
      const message =
        err?.response?.data ||
        err?.message ||
        'Đặt hàng thất bại. Vui lòng thử lại.';
      setErrorMessage(typeof message === 'string' ? message : 'Đặt hàng thất bại.');
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Thanh toán đơn hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nguồn: {session.source === 'BUY_NOW' ? 'Mua ngay' : 'Từ giỏ hàng'} • Mã phiên: {session.id.slice(0, 8)}
          </p>
        </div>

        {remainingSeconds !== null && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Phiên còn hiệu lực: {formatCountdown(remainingSeconds)}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#ff5636]" />
              <h2 className="text-base font-bold text-slate-900">Địa chỉ giao hàng</h2>
            </div>

            {savedAddresses && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr.id)}
                    className={`text-left p-3 rounded-xl border transition ${
                      selectedAddressId === addr.id
                        ? 'border-[#ff5636] bg-orange-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{addr.receiverName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-[#ff5636]">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{addr.receiverPhone}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Người nhận *</label>
                <Input
                  value={addressForm.receiverName}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, receiverName: e.target.value }));
                  }}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Số điện thoại *</label>
                <Input
                  value={addressForm.receiverPhone}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, receiverPhone: e.target.value }));
                  }}
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tỉnh / Thành phố *</label>
                <Input
                  value={addressForm.province}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, province: e.target.value }));
                  }}
                  placeholder="Hà Nội"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Quận / Huyện *</label>
                <Input
                  value={addressForm.district}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, district: e.target.value }));
                  }}
                  placeholder="Cầu Giấy"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phường / Xã *</label>
                <Input
                  value={addressForm.ward}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, ward: e.target.value }));
                  }}
                  placeholder="Dịch Vọng"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Mã bưu chính</label>
                <Input
                  value={addressForm.postalCode ?? ''}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, postalCode: e.target.value }));
                  }}
                  placeholder="100000 (không bắt buộc)"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Địa chỉ chi tiết *</label>
                <Input
                  value={addressForm.streetAddress}
                  onChange={(e) => {
                    setSelectedAddressId('custom');
                    setAddressForm((p) => ({ ...p, streetAddress: e.target.value }));
                  }}
                  placeholder="Số nhà, tên đường..."
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateSession.isPending}
                onClick={() => void handleSaveAddress()}
              >
                Lưu địa chỉ vào phiên
              </Button>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#ff5636]" />
              <h2 className="text-base font-bold text-slate-900">Phương thức thanh toán</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((pm) => {
                const active = session.paymentMethod === pm.value;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => updateSession.mutate({ paymentMethod: pm.value })}
                    className={`text-left p-3.5 rounded-xl border transition ${
                      active
                        ? 'border-[#ff5636] bg-orange-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{pm.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{pm.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Voucher & Note */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#ff5636]" />
              <h2 className="text-base font-bold text-slate-900">Mã giảm giá & Ghi chú</h2>
            </div>

            <div className="flex gap-2">
              <Input
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="Nhập mã giảm giá (nếu có)"
              />
              <Button
                type="button"
                variant="outline"
                disabled={updateSession.isPending}
                onClick={() => updateSession.mutate({ voucherCode: voucherInput })}
              >
                Áp dụng
              </Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Ghi chú đơn hàng</label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onBlur={() => {
                  if (noteInput !== (session.note ?? '')) {
                    updateSession.mutate({ note: noteInput });
                  }
                }}
                placeholder="Ví dụ: Giao giờ hành chính..."
              />
            </div>
          </section>
        </div>

        {/* Right column: Order Summary */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs sticky top-24">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Package className="w-5 h-5 text-[#ff5636]" />
            <h2 className="text-base font-bold text-slate-900">
              Đơn hàng ({session.items.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)
            </h2>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
            {session.items.map((item) => (
              <div key={item.variantId} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      item.pictureUrl ||
                      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={item.productName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{item.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    SKU: {item.sku} • SL: {item.quantity}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900 shrink-0">
                  {formatVND(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>
              <span>{formatVND(session.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span>{session.shippingFee === 0 ? 'Miễn phí' : formatVND(session.shippingFee)}</span>
            </div>
            {session.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá</span>
                <span>-{formatVND(session.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">Tổng cộng</span>
              <span className="text-xl font-extrabold text-[#ff5636]">{formatVND(session.total)}</span>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={confirmSession.isPending || updateSession.isPending}
            onClick={() => void handleConfirmOrder()}
            className="w-full mt-5 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-bold shadow-md shadow-orange-500/20"
          >
            {confirmSession.isPending ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Giá được xác thực trực tiếp từ hệ thống</span>
          </div>
        </aside>
      </div>
    </div>
  );
};
