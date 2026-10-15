import React from 'react';
import { Cpu, Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 md:mt-20 bg-[#002023] text-white border-t border-slate-800 pt-12 md:pt-14 pb-8 w-full min-w-0">
      {/* Top Value Badges */}
      <div className="container-custom pb-10 mb-10 border-b border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ff5636] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Giao Hàng Siêu Tốc</div>
            <div className="text-[11px] text-slate-300">Toàn quốc trong 24H - 48H</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ff5636] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">100% Chính Hãng</div>
            <div className="text-[11px] text-slate-300">Nguyên seal nhà phân phối</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ff5636] shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">1-Đổi-1 30 Ngày</div>
            <div className="text-[11px] text-slate-300">Lỗi phần cứng đổi mới ngay</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ff5636] shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Trả Góp 0% Lãi Suất</div>
            <div className="text-[11px] text-slate-300">Thủ tục nhanh qua thẻ tín dụng</div>
          </div>
        </div>
      </div>

      <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        {/* Brand Col */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5636] to-[#e63e1c] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold font-heading text-white">
              PC PART <span className="text-[#ff5636]">MARKET</span>
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-5">
            Hệ thống cung cấp linh kiện PC, máy tính chơi game và máy trạm đồ họa cao cấp hàng đầu Việt Nam.
          </p>
          <div className="flex flex-col gap-2.5 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff5636] shrink-0" />
              <span>Showroom: Q. Cầu Giấy, Hà Nội & Q.10, TP.HCM</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#ff5636] shrink-0" />
              <span>Hotline kỹ thuật: <strong className="text-white">1900 8888</strong> (08:30 - 21:30)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#ff5636] shrink-0" />
              <span>support@pcpartmarket.vn</span>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Danh Mục Linh Kiện
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Card Màn Hình (VGA RTX 40 & RX 7000)</a></li>
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Vi Xử Lý Intel Gen 14 & AMD Ryzen 7000</a></li>
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Bo Mạch Chủ Z790 / B760 / X670E</a></li>
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Bộ Nhớ Trong RAM DDR5 6000MHz+</a></li>
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Ổ Cứng SSD NVMe PCIe Gen 4 & Gen 5</a></li>
            <li><a href="#products-section" className="hover:text-[#ff5636] transition-colors">Nguồn Máy Tính Chuẩn ATX 3.0 / PCIe 5.0</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Chính Sách & Dịch Vụ
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li><span className="hover:text-[#ff5636] transition-colors cursor-pointer">Chính sách bảo hành 1-đổi-1 30 ngày</span></li>
            <li><span className="hover:text-[#ff5636] transition-colors cursor-pointer">Chính sách giao hàng siêu tốc 2H</span></li>
            <li><span className="hover:text-[#ff5636] transition-colors cursor-pointer">Hướng dẫn build PC & tra cứu tương thích</span></li>
            <li><span className="hover:text-[#ff5636] transition-colors cursor-pointer">Thanh toán trả góp 0% lãi suất qua thẻ</span></li>
            <li><span className="hover:text-[#ff5636] transition-colors cursor-pointer">Chính sách đổi trả & hoàn tiền</span></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Bản Tin Khuyến Mãi
          </h4>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Đăng ký để nhận thông báo flash sale giảm giá combo CPU + VGA và mã giảm giá 500k cho đơn đầu tiên.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5636] flex-1"
            />
            <button className="bg-[#ff5636] hover:bg-[#e63e1c] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer">
              Gửi
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          © {CURRENT_YEAR} PC Part Market. Thiết kế lấy cảm hứng từ TTGShop.vn.
        </div>
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer">Điều khoản</span>
          <span className="hover:text-white cursor-pointer">Bảo mật</span>
          <span className="hover:text-white cursor-pointer">Sơ đồ trang</span>
        </div>
      </div>
    </footer>
  );
};
