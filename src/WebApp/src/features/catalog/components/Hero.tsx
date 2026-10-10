import React from 'react';
import { ShieldCheck, Truck, Wrench, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative py-12 px-6 max-w-[1360px] mx-auto overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute -top-1/4 left-1/5 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/6 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      {/* Grid Container */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
        {/* Left Column */}
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-3.5 py-1.5 mb-5">
            <Zap className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-sky-400">
              1,625+ Linh Kiện Đã Sẵn Sàng Giao Ngay
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5 tracking-tight">
            Xây Dựng Cỗ Máy <br />
            <span className="gradient-text">Gaming & Đồ Họa</span> <br />
            Trong Mơ Của Bạn
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
            Sàn thương mại điện tử chuyên sâu linh kiện PC chính hãng từ ASUS, MSI, GIGABYTE, Colorful. Cam kết 100% nguyên seal, bảo hành 36 tháng, giao siêu tốc toàn quốc.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              variant="glow"
              size="lg"
              onClick={onExploreClick}
              className="rounded-full px-7"
            >
              <span>Xem Linh Kiện Mới Nhất</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-6"
            >
              <Wrench className="w-4 h-4 mr-2 text-purple-400" />
              <span>Cấu Hình PC Tối Ưu</span>
            </Button>
          </div>

          {/* Mini Trust Highlights */}
          <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Hàng Chính Hãng</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bảo Hành 1-Đổi-1 30 Ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hỗ Trợ Kỹ Thuật Trọn Đời</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card */}
        <div className="relative">
          <div className="glass-panel hover-lift p-7 relative bg-gradient-to-br from-slate-800/70 to-slate-900/90 border border-white/10 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-gradient-to-r from-rose-500 to-rose-400 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Siêu Phẩm Flagship
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                ● Còn 8 sản phẩm
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden h-60 bg-[#0b0f19] flex items-center justify-center mb-5">
              <img 
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80" 
                alt="RTX 4090 Rog Strix"
                className="w-full h-full object-cover contrast-105 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 text-xs text-slate-300">
                Architecture: <strong className="text-white">Ada Lovelace 4nm</strong>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 leading-snug">
              VGA ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-4">
              Xung nhịp tối đa 2640 MHz • Quạt Axial-tech thế hệ mới • Khung hợp kim đúc nguyên khối.
            </p>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div>
                <div className="text-[11px] text-slate-400 uppercase">Giá Ưu Đãi</div>
                <div className="text-2xl font-extrabold text-sky-400 font-heading">
                  52.990.000 ₫
                </div>
              </div>
              <Button
                variant="glow"
                size="sm"
                onClick={onExploreClick}
                className="rounded-lg"
              >
                Khám Phá Thêm
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Badges Bar */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3.5 rounded-xl">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Giao Siêu Tốc 2H</div>
            <div className="text-slate-400 text-xs">Miễn phí ship nội thành</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5 rounded-xl">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Bảo Hành 36 Tháng</div>
            <div className="text-slate-400 text-xs">Cam kết 100% chính hãng</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5 rounded-xl">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Hỗ Trợ Lắp Ráp PC</div>
            <div className="text-slate-400 text-xs">Tối ưu dây & test benchmark</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5 rounded-xl">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Trả Góp 0% Lãi Suất</div>
            <div className="text-slate-400 text-xs">Thủ tục duyệt trong 5 phút</div>
          </div>
        </div>
      </div>
    </section>
  );
};
