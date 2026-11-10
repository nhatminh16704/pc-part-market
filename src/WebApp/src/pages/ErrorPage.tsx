import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const ErrorPage: React.FC = () => {
  const error = useRouteError();

  let errorMessage = 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="text-4xl font-extrabold text-slate-900 mb-2 font-heading">
        Lỗi {statusCode}
      </div>
      <p className="text-slate-500 max-w-md mb-6 text-sm">
        {errorMessage}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tải lại trang</span>
        </Button>
        <Button asChild className="gap-2 bg-[#ff5636] hover:bg-[#e63e1c] text-white cursor-pointer">
          <Link to="/">
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
