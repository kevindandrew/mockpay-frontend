import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface TransactionDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  returnUrl: string;
  cancelUrl: string;
  metadata: any;
  merchantName: string;
  merchantPublicKey: string;
}

export default function CheckoutSession() {
  const [transactionId, setTransactionId] = useState<string>('');
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form Fields
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvc, setCvc] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [zip, setZip] = useState<string>('');
  const [_focusedField, setFocusedField] = useState<string>('');

  useEffect(() => {
    // Extract transaction ID from path /checkout/:id
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    if (id && id !== 'checkout') {
      setTransactionId(id);
      fetchTransaction(id);
    } else {
      setError('ID de transacción no válido en la URL.');
      setLoading(false);
    }
  }, []);

  const fetchTransaction = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/payments/${id}`);
      if (!response.ok) {
        throw new Error('No se pudo encontrar la transacción.');
      }
      const data = await response.json();
      setTransaction(data);
      if (data.status !== 'PENDING') {
        setPaymentStatus(data.status.toLowerCase() as any);
        setErrorMessage(data.failureReason === 'insufficient_funds' ? 'Fondos insuficientes' : 'Tarjeta rechazada');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener la información de pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .substring(0, 19); // 16 digits + 3 spaces
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpiry(value.substring(0, 5));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvc(value.substring(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/payments/${transactionId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber,
          expiry,
          cvc,
          cardholderName,
          phone,
          address,
          zip,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el pago.');
      }

      if (data.status === 'SUCCEEDED') {
        setPaymentStatus('success');
        setTimeout(() => {
          window.location.href = `${data.returnUrl}?transaction_id=${data.id}`;
        }, 2000);
      } else {
        setPaymentStatus('failed');
        const reason = data.failureReason === 'insufficient_funds' ? 'Fondos Insuficientes (Tarjeta 4000...)' : 'Tarjeta Rechazada';
        setErrorMessage(reason);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (transaction?.cancelUrl) {
      window.location.href = transaction.cancelUrl;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getCardBrand = () => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('4')) return { name: 'VISA', color: 'text-blue-400' };
    if (cleanNumber.startsWith('5')) return { name: 'MASTERCARD', color: 'text-orange-400' };
    if (cleanNumber.startsWith('3')) return { name: 'AMEX', color: 'text-cyan-400' };
    if (cleanNumber.startsWith('6')) return { name: 'DISCOVER', color: 'text-amber-400' };
    return { name: 'TARJETA', color: 'text-slate-300' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Cargando sesión de pago segura...</p>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-6 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-200">Error de Checkout</h3>
          <p className="text-red-400 mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="font-bold text-white text-sm">MP</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            MockPay <span className="text-indigo-400 text-sm font-normal">Sandbox</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-800/40 rounded-full px-3 py-1 text-xs text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ambiente de Pruebas</span>
        </div>
      </header>

      {/* Main Sandbox Layout */}
      <main className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Info Col */}
        <section className="md:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Comercio</h2>
              <p className="text-xl font-bold text-white mt-1">{transaction?.merchantName}</p>
            </div>
            
            <div className="border-t border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Monto del Pedido</span>
                <span className="text-slate-200 font-medium">
                  {transaction && formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Moneda</span>
                <span className="text-slate-200 font-medium">{transaction?.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ID de Pago</span>
                <span className="text-slate-300 font-mono text-xs truncate max-w-[150px]">{transaction?.id}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Reglas de Simulación</h4>
              <ul className="text-xs space-y-2 text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5"></span>
                  <span>Empieza con <code className="text-green-300 bg-green-950/40 px-1 py-0.5 rounded font-mono">4242</code> para un pago exitoso (<span className="text-green-400">succeeded</span>).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5"></span>
                  <span>Empieza con <code className="text-red-300 bg-red-950/40 px-1 py-0.5 rounded font-mono">4000</code> para fondos insuficientes (<span className="text-red-400">failed</span>).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                  <span>Cualquier otro número simulará tarjeta rechazada genérica.</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-800/60 hover:bg-slate-900/60 transition duration-200 text-sm font-medium text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancelar y volver
          </button>
        </section>

        {/* Form Col */}
        <section className="md:col-span-7">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-8">
            
            {/* Visual Credit Card */}
            <div className="relative w-full max-w-[380px] aspect-[1.586] mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 flex flex-col justify-between overflow-hidden shadow-xl shadow-indigo-950/30">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="h-10 w-12 bg-yellow-400/80 rounded-lg flex items-center justify-center border border-yellow-200/20">
                  <div className="w-8 h-6 border-r border-slate-950/10 grid grid-cols-3 gap-0.5">
                    <span className="border-b border-slate-950/10"></span>
                    <span className="border-b border-slate-950/10"></span>
                    <span className="border-b border-slate-950/10"></span>
                  </div>
                </div>
                <div className={`font-bold italic text-lg ${getCardBrand().color} tracking-wider`}>
                  {getCardBrand().name}
                </div>
              </div>

              <div className="space-y-4 z-10">
                <div className="font-mono text-xl tracking-widest text-white">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-indigo-200/70">Titular de Tarjeta</div>
                    <div className="font-medium tracking-wide uppercase text-sm truncate max-w-[200px]">
                      {cardholderName || 'Nombre Completo'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-200/70">Vence</div>
                    <div className="font-mono font-medium text-sm">
                      {expiry || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Screen Overlays */}
            {paymentStatus === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-950/50 border border-green-500/30 text-green-400 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-bold text-white">¡Pago Procesado Exitosamente!</h3>
                <p className="text-slate-400 text-sm animate-pulse">Redirigiendo de vuelta al comercio...</p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-4 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h4 className="text-md font-bold text-red-200">Simulación de Pago Fallida</h4>
                <p className="text-red-400 text-sm">{errorMessage}</p>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Intentar con otra tarjeta
                </button>
              </div>
            )}

            {paymentStatus === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 flex gap-2 text-red-300 text-xs items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 border-b border-slate-800/60 pb-2 mb-4">
                  <h4 className="text-indigo-400 text-sm font-semibold mb-1">Detalles de Facturación</h4>
                  <p className="text-slate-500 text-xs">Requeridos para la validación AVS del banco.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardholder" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Nombre del Titular <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="cardholder"
                      type="text"
                      required
                      placeholder="Juan Pérez"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Teléfono <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Dirección <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      placeholder="123 Fake St, NY"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Código Postal <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="zip"
                      type="text"
                      required
                      placeholder="10001"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-b border-slate-800/60 pb-2 mb-4 mt-2">
                  <h4 className="text-indigo-400 text-sm font-semibold mb-1">Datos de la Tarjeta</h4>
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Número de Tarjeta <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setFocusedField('number')}
                      onBlur={() => setFocusedField('')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono"
                    />
                    <CreditCard className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Vencimiento (MM/YY) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      required
                      placeholder="12/29"
                      value={expiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField('')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono text-center"
                    />
                  </div>

                  <div>
                    <label htmlFor="cvc" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Código CVC <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="cvc"
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={4}
                      value={cvc}
                      onChange={handleCvcChange}
                      onFocus={() => setFocusedField('cvc')}
                      onBlur={() => setFocusedField('')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transform"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Procesando pago...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>
                        Pagar {transaction && formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-600 border-t border-slate-800/40 pt-4">
        <p>&copy; {new Date().getFullYear()} MockPay Gateway Corporation. Solamente para propósitos de prueba y demostración.</p>
      </footer>
    </div>
  );
}
