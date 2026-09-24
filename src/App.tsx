import CheckoutSession from './components/CheckoutSession';
import MerchantRegister from './components/MerchantRegister';
import { CheckCircle2, XCircle } from 'lucide-react';

function DefaultSuccess() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
      <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">¡Pago Simulado Exitoso!</h1>
      <p className="text-slate-400 mb-8 max-w-md text-center text-sm leading-relaxed">
        Esta es la página de éxito por defecto de MockPay. En un entorno real, el usuario habría sido redirigido a la <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">return_url</code> configurada en tu E-Commerce.
      </p>
      <a href="/" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20">Volver al Portal para Desarrolladores</a>
    </div>
  );
}

function DefaultCancel() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
      <XCircle className="w-20 h-20 text-red-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Pago Cancelado</h1>
      <p className="text-slate-400 mb-8 max-w-md text-center text-sm leading-relaxed">
        El usuario canceló el pago. Esta es la página de cancelación por defecto de MockPay. En un entorno real, el usuario habría sido redirigido a la <code className="bg-slate-800 text-red-300 px-1 py-0.5 rounded">cancel_url</code> configurada en tu E-Commerce.
      </p>
      <a href="/" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20">Volver al Portal para Desarrolladores</a>
    </div>
  );
}

function App() {
  const pathname = window.location.pathname;
  const isCheckout = pathname.includes('/checkout/');

  if (pathname === '/default-success') return <DefaultSuccess />;
  if (pathname === '/default-cancel') return <DefaultCancel />;

  return (
    <div className="min-h-screen bg-slate-950">
      {isCheckout ? <CheckoutSession /> : <MerchantRegister />}
    </div>
  );
}

export default App;
