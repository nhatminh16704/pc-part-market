import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  useCreateAddress,
  useDeleteAddress,
  useMyAddresses,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../hooks/useCustomer';
import { addressSchema, type AddressFormData, type CustomerAddress } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const EMPTY_FORM: AddressFormData = {
  receiverName: '',
  receiverPhone: '',
  province: '',
  district: '',
  ward: '',
  streetAddress: '',
  postalCode: '',
  label: '',
  isDefault: false,
};

export const AddressBook: React.FC = () => {
  const { data: addresses = [], isLoading, isError } = useMyAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY_FORM,
  });

  const openCreateForm = () => {
    setEditingAddress(null);
    setErrorMessage(null);
    reset({
      ...EMPTY_FORM,
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (address: CustomerAddress) => {
    setEditingAddress(address);
    setErrorMessage(null);
    reset({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      streetAddress: address.streetAddress,
      postalCode: address.postalCode ?? '',
      label: address.label ?? '',
      isDefault: address.isDefault,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setErrorMessage(null);
  };

  const onSubmit = async (data: AddressFormData) => {
    setErrorMessage(null);
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({ addressId: editingAddress.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeForm();
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        'Không thể lưu địa chỉ. Vui lòng thử lại.';
      setErrorMessage(detail);
    }
  };

  const handleDelete = async (addressId: string) => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(addressId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Không thể xóa địa chỉ.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setErrorMessage(null);
    try {
      await setDefaultMutation.mutateAsync(addressId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Không thể đặt làm địa chỉ mặc định.');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-6 h-6 text-[#ff5636] animate-spin mr-2.5" />
        <span className="text-sm text-slate-500 font-medium">Đang tải sổ địa chỉ...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <p className="text-sm text-red-600 font-medium">
          Không thể tải danh sách địa chỉ. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Sổ địa chỉ giao hàng</h2>
          <p className="text-sm text-slate-500">
            Quản lý địa chỉ nhận hàng để thanh toán nhanh hơn khi đặt linh kiện.
          </p>
        </div>
        {!isFormOpen && (
          <Button
            type="button"
            onClick={openCreateForm}
            className="bg-[#ff5636] hover:bg-[#e63e1c] text-white font-semibold shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm địa chỉ mới
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span className="font-semibold">Lỗi: </span>
          {errorMessage}
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tên người nhận *
              </label>
              <Input
                placeholder="Nguyễn Văn Minh"
                {...register('receiverName')}
                className="h-10 bg-white border-slate-200"
              />
              {errors.receiverName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.receiverName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Số điện thoại nhận hàng *
              </label>
              <Input
                type="tel"
                placeholder="0912345678"
                {...register('receiverPhone')}
                className="h-10 bg-white border-slate-200"
              />
              {errors.receiverPhone && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.receiverPhone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tỉnh / Thành phố *
              </label>
              <Input
                placeholder="Hà Nội"
                {...register('province')}
                className="h-10 bg-white border-slate-200"
              />
              {errors.province && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.province.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Quận / Huyện *
              </label>
              <Input
                placeholder="Cầu Giấy"
                {...register('district')}
                className="h-10 bg-white border-slate-200"
              />
              {errors.district && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.district.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phường / Xã *
              </label>
              <Input
                placeholder="Dịch Vọng"
                {...register('ward')}
                className="h-10 bg-white border-slate-200"
              />
              {errors.ward && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.ward.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Địa chỉ chi tiết (Số nhà, đường, tòa nhà...) *
            </label>
            <Input
              placeholder="Số 123 Xuân Thủy"
              {...register('streetAddress')}
              className="h-10 bg-white border-slate-200"
            />
            {errors.streetAddress && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.streetAddress.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nhãn địa chỉ (tùy chọn)
              </label>
              <Input
                placeholder="Nhà riêng, Công ty..."
                {...register('label')}
                className="h-10 bg-white border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Mã bưu chính (tùy chọn)
              </label>
              <Input
                placeholder="100000"
                {...register('postalCode')}
                className="h-10 bg-white border-slate-200"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer pt-1">
            <input type="checkbox" {...register('isDefault')} className="accent-[#ff5636] w-4 h-4" />
            <span>Đặt làm địa chỉ giao hàng mặc định</span>
          </label>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="border-slate-300 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#ff5636] hover:bg-[#e63e1c] text-white font-semibold cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : editingAddress ? (
                'Cập nhật địa chỉ'
              ) : (
                'Lưu địa chỉ'
              )}
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-1">Bạn chưa lưu địa chỉ giao hàng nào</p>
          <p className="text-xs text-slate-400">
            Thêm địa chỉ để quá trình đặt hàng diễn ra nhanh chóng hơn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                addr.isDefault
                  ? 'border-[#ff5636]/40 bg-orange-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">{addr.receiverName}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600 font-medium">{addr.receiverPhone}</span>
                  {addr.label && (
                    <Badge variant="outline" className="text-[11px] border-slate-300 text-slate-600">
                      {addr.label}
                    </Badge>
                  )}
                  {addr.isDefault && (
                    <Badge className="bg-[#ff5636] text-white text-[11px] gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Mặc định
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-slate-600">
                  {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                  {addr.postalCode ? ` (${addr.postalCode})` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!addr.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={setDefaultMutation.isPending}
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs border-slate-200 hover:border-[#ff5636] hover:text-[#ff5636] cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 mr-1" />
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditForm(addr)}
                  className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(addr.id)}
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

