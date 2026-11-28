import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Home } from '@/pages/Home';
import { ProductDetail } from '@/pages/ProductDetail';
import { Login } from '@/pages/Login';
import { Account } from '@/pages/Account';
import { Checkout } from '@/pages/Checkout';
import { NotFound } from '@/pages/NotFound';
import { ErrorPage } from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Login />,
      },
      {
        path: '/account',
        element: <Account />,
      },
      {
        path: '/checkout/:sessionId',
        element: <Checkout />,
      },
      {
        path: '/products/:id',
        element: <ProductDetail />,
      },
      {
        path: '/products/seo/:id',
        element: <ProductDetail />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
