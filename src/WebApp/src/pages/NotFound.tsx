import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-black gradient-text font-heading mb-4">404</div>
      <h1 className="text-2xl font-bold mb-3">Trang không tồn tại</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm">
        Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển. Vui lòng quay lại trang chủ.
      </p>
      <Link to="/">
        <Button variant="glow" size="lg">
          <Home className="w-4 h-4 mr-2" />
          <span>Về Trang Chủ</span>
        </Button>
      </Link>
    </div>
  );
};
