import React, { useState } from 'react';
import { 
  ShieldCheck, Copy, Check, Key, Terminal, Code, 
  PlusCircle, Loader2, BookOpen, 
  Zap, Clock, ArrowRight, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Credentials {
  name: string;
  publicKey: string;
  secretKey: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export default function MerchantRegister() {
  const [name, setName] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:4567/webhook');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [copiedKey, setCopiedKey] = useState<'public' | 'secret' | 'curl' | null>(null);
  const [codeTab, setCodeTab] = useState<'node' | 'python'>('node');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCredentials(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/merchants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          webhook_url: webhookUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el comercio.');
      }
      setCredentials(data);
    } catch (err: any) {
      setError(err.message || 'Hubo un error al registrar el comercio.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'public' | 'secret' | 'curl') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCurlSnippet = (secKey: string) => {
    return `curl -X POST ${API_BASE_URL}/api/v1/payments \\
  -H "Authorization: Bearer ${secKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 120.50,
    "currency": "USD",
    "metadata": { "order_id": "12345" }
  }'`;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-900 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-extrabold text-white text-base">MP</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MockPay <span className="text-indigo-400 text-sm font-semibold tracking-wide ml-1 px-2 py-0.5 rounded-full bg-indigo-950/50 border border-indigo-900/50">Sandbox</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">Características</button>
            <button onClick={() => scrollToSection('integration')} className="hover:text-white transition cursor-pointer">Integración</button>
            <button onClick={() => scrollToSection('documentation')} className="hover:text-white transition cursor-pointer">Guía</button>
            <button onClick={() => scrollToSection('register')} className="hover:text-white transition cursor-pointer">Consola</button>
            <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
              <BookOpen className="h-4 w-4" /> Docs API
            </a>
          </nav>
          <div>
            <button 
              onClick={() => scrollToSection('register')} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Obtener Credenciales
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto w-full px-4 md:px-8 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-800/40 rounded-full px-3 py-1 text-xs text-indigo-300">
          <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Gateway de Demostración para Desarrolladores</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Simula Cobros Reales en tu <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">Entorno Local</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          MockPay es una pasarela sandbox diseñada para simular flujos de tarjetas, latencia de red y respuestas de webhooks sin necesidad de usar dinero real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={() => scrollToSection('register')}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98"
          >
            <span>Crear App de Prueba</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Documentación de API</span>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto w-full px-4 md:px-8 py-16 border-t border-slate-900 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">¿Qué hace MockPay Sandbox?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Todo lo necesario para comprobar tu código de integración antes de pasar a producción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Simulación de Tarjetas</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Introduce reglas según el número de tarjeta. Empieza con <code className="text-indigo-300">4242</code> para simular éxito o <code className="text-indigo-300">4000</code> para fondos insuficientes.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
            <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Latencia Artificial</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cada procesamiento tiene un delay simulado de 2 segundos. Ideal para probar estados de carga, spinners y prevenir clics duplicados en tu frontend.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Webhooks Asíncronos</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Notificaciones POST asíncronas no bloqueantes a tu servidor en cuanto la transacción cambia de estado. Diseñadas bajo principios SOLID.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Workflow */}
      <section id="integration" className="max-w-6xl mx-auto w-full px-4 md:px-8 py-16 border-t border-slate-900 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Flujo de Integración</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Conecta tu e-commerce con MockPay en 4 sencillos pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-xl space-y-3 relative">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-900">Paso 1</span>
            <h4 className="font-bold text-white text-sm">Registra tu App</h4>
            <p className="text-slate-500 text-xs">Registra tu comercio abajo para obtener tus llaves secretas y públicas.</p>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-xl space-y-3">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-900">Paso 2</span>
            <h4 className="font-bold text-white text-sm">Crear Intención</h4>
            <p className="text-slate-500 text-xs">Envía un POST seguro a la API usando tu secret_key para generar el checkout_url.</p>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-xl space-y-3">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-900">Paso 3</span>
            <h4 className="font-bold text-white text-sm">Redirección</h4>
            <p className="text-slate-500 text-xs">Muestra la pantalla de checkout responsive al usuario para capturar su tarjeta.</p>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-xl space-y-3">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-900">Paso 4</span>
            <h4 className="font-bold text-white text-sm">Webhook y Retorno</h4>
            <p className="text-slate-500 text-xs">Recibe confirmación asíncrona por webhook y devuelve al cliente a tu tienda.</p>
          </div>
        </div>
      </section>

      {/* Detailed Documentation Guide */}
      <section id="documentation" className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16 border-t border-slate-900 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Guía de Integración Paso a Paso</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Instrucciones detalladas y ejemplos de payload para conectar tu backend con MockPay Sandbox.
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">1</span>
              Autenticación y Configuración de URLs
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Utiliza la <strong>Consola de Registro</strong> más abajo para registrar tu aplicación y establecer las rutas de comunicación. Es fundamental entender para qué sirve cada URL en la arquitectura:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                <strong className="text-emerald-300 font-mono text-[11px] block mb-1">return_url / cancel_url</strong>
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-2">Frontend (Navegador)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Son las rutas en tu e-commerce a donde MockPay redirigirá el navegador del usuario al terminar o cancelar el pago. Sirven puramente para la <strong>experiencia visual</strong> (ej. mostrar "Gracias por tu compra").
                </p>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/50 md:col-span-2 shadow-inner">
                <strong className="text-indigo-300 font-mono text-[11px] block mb-1">webhook_url</strong>
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-2">Backend-to-Backend (S2S)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                  Es un endpoint privado en tu servidor. MockPay hará una petición POST oculta aquí para avisarte del resultado real de la transacción, de servidor a servidor, sin intervención del cliente.
                </p>
                <p className="text-indigo-200/80 text-[11px] leading-relaxed font-medium bg-indigo-950/40 p-2 rounded border border-indigo-900/50">
                  <strong className="text-indigo-300">⚠️ Seguridad Crítica:</strong> Jamás debes despachar productos confiando en la redirección visual (return_url), ya que es fácilmente falsificable por el usuario. La actualización de tu base de datos debe ocurrir <strong>exclusivamente</strong> al recibir el Webhook.
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mt-6">
              Al guardar esta configuración en la consola, el sistema generará de manera segura tus llaves de acceso:
            </p>
            <div className="mt-5 grid gap-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-2 mb-2.5">
                  <Key className="h-4 w-4 text-indigo-400" />
                  <strong className="text-indigo-300 font-mono text-sm">public_key (Llave Pública)</strong>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-2">
                  <strong className="text-slate-300">¿Para qué sirve?</strong> En pasarelas reales (como Stripe o MercadoPago), esta llave se usa exclusivamente en tu <strong>Frontend</strong> (React, Vue, etc.) para "tokenizar" la tarjeta del cliente, de modo que los números sensibles nunca toquen tu servidor.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  <strong className="text-slate-300">¿Es segura?</strong> Sí, es pública por diseño y <strong>debe</strong> ser expuesta al navegador web del cliente para poder montar los formularios de pago seguros.
                </p>
                <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-lg p-3 mt-3">
                  <p className="text-indigo-300 text-[11px] leading-relaxed">
                    <strong>Nota Educativa:</strong> Dado que MockPay Sandbox utiliza un modelo de <em>"Checkout Alojado por Redirección"</em>, <strong>la public_key no es necesaria técnicamente para integrar este proyecto</strong>. Se genera con fines de simulación para que te familiarices con la estructura estándar de credenciales.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-red-900/30 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
                <div className="flex items-center gap-2 mb-2.5">
                  <ShieldCheck className="h-4 w-4 text-red-400" />
                  <strong className="text-red-300 font-mono text-sm">secret_key (Llave Privada)</strong>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-2">
                  <strong className="text-slate-300">¿Para qué sirve?</strong> Es tu contraseña maestra. Tu <strong>Backend</strong> debe enviarla como <code className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Bearer Token</code> en la cabecera HTTP de todas las peticiones (ej. al crear intenciones de pago).
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  <strong className="text-slate-300 text-red-400">¡Regla Crítica! (¿Por qué cuidarla?):</strong> Tiene permisos para crear cargos a tarjetas y hacer reembolsos. <strong>JAMÁS debe llegar al navegador del usuario, ni ser subida a GitHub.</strong> Debe vivir únicamente en las variables de entorno de tu Backend (ej. tu archivo <code>.env</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">2</span>
              Crear Intención de Pago (S2S)
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cuando el usuario decida pagar, tu backend debe realizar una petición POST autenticada para registrar la intención. Nota que las URLs no se envían aquí, sino que se toman de la base de datos de MockPay según tu perfil de comercio registrado.
            </p>

            <div className="bg-indigo-950/40 border border-indigo-900/50 p-4 rounded-xl mt-4 shadow-inner">
              <strong className="text-indigo-300 font-mono text-[11px] block mb-1">El objeto "metadata" (Crucial para identificar pagos)</strong>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                En cualquier pasarela real, el objeto <code>metadata</code> te permite adjuntar información personalizada (ej. <code>order_id: "123"</code>, o <code>user_id: "789"</code>). MockPay guardará esta información temporalmente y te la <strong>devolverá intacta en el Webhook</strong>. Es la única manera 100% segura que tiene tu backend de saber a qué carrito de compras o a qué cliente específico pertenece un pago exitoso que acaba de procesarse.
              </p>
            </div>
            
            <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner overflow-hidden mt-4">
              <div className="flex items-center gap-4 px-4 py-3 bg-slate-900 border-b border-slate-800">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded">POST</span>
                <span className="text-indigo-300 text-xs font-mono">/api/v1/payments</span>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => setCodeTab('node')} 
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer \${codeTab === 'node' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                    >
                      Node.js
                    </button>
                    <button 
                      onClick={() => setCodeTab('python')} 
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer \${codeTab === 'python' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                    >
                      Python
                    </button>
                  </div>
                  <pre className="text-slate-300 text-[11px] font-mono overflow-x-auto leading-loose bg-slate-900/50 p-4 rounded-lg border border-slate-800">
{codeTab === 'node' ? `const response = await fetch("${API_BASE_URL}/api/v1/payments", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_sandbox_...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    amount: 120.50,
    currency: "USD",
    metadata: {
      order_id: "ORD-54321"
    }
  })
});

const { checkout_url } = await response.json();
// Redirige al cliente hacia checkout_url
console.log(checkout_url);` : 
`import requests

url = "${API_BASE_URL}/api/v1/payments"
headers = {
    "Authorization": "Bearer sk_sandbox_...",
    "Content-Type": "application/json"
}
payload = {
    "amount": 120.50,
    "currency": "USD",
    "metadata": {
        "order_id": "ORD-54321"
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

# Redirige al cliente hacia checkout_url
print(data.get("checkout_url"))`}
                  </pre>
                </div>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed pt-2">
              La API responderá con un ID de transacción y una URL única de cobro (<code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">checkout_url</code>). Debes redirigir el navegador web de tu usuario a esta URL para que ingrese su tarjeta.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
              Recibir Confirmación Asíncrona Webhook (S2S)
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Inmediatamente después de que el usuario finalice el pago (y tras un retraso simulado de 2 segundos), MockPay realizará un llamado automático a la URL de webhook que configuraste, independientemente de si la tarjeta fue exitosa (4242) o rechazada (4000).
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded">POST</span>
                <span className="text-indigo-300 text-xs font-mono">hacia tu "webhook_url"</span>
              </div>
              <pre className="text-slate-300 text-xs font-mono overflow-x-auto leading-loose">
{`Body:
{
  "event": "payment.succeeded", // o "payment.failed"
  "id": "uuid-de-la-transaccion",
  "amount": 120.50,
  "currency": "USD",
  "status": "SUCCEEDED", // o "FAILED"
  "failure_reason": null, // o "insufficient_funds" / "card_declined"
  "metadata": { "order_id": "ORD-54321" },
  "created_at": "2026-07-24T12:00:00Z"
}`}
              </pre>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Finalmente, tras emitir el webhook, el navegador del usuario será redirigido a tu <code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">return_url</code> o <code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">cancel_url</code> con el `transaction_id` como parámetro de búsqueda (Query String).
            </p>
          </div>
        </div>
      </section>

      {/* Registration Console Section */}
      <section id="register" className="max-w-4xl mx-auto w-full px-4 md:px-8 py-16 border-t border-slate-900 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Consola de Registro</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Introduce los detalles de tu servidor de pruebas para generar tus llaves API.
          </p>
        </div>

        {/* Credentials Card */}
        {credentials ? (
          <div className="bg-slate-900/60 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-green-400">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">¡Credenciales Generadas para {credentials.name}!</h3>
            </div>

            {/* Keys */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Clave Pública (Public Key)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={credentials.publicKey}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-indigo-300 text-sm font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.publicKey, 'public')}
                    className="absolute right-2 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                    title="Copiar Clave Pública"
                  >
                    {copiedKey === 'public' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Clave Secreta (Secret Key)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={credentials.secretKey}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-red-300 text-sm font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(credentials.secretKey, 'secret')}
                    className="absolute right-2 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                    title="Copiar Clave Secreta"
                  >
                    {copiedKey === 'secret' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-red-400/80 mt-1.5">
                  ⚠️ Mantén esta clave secreta a salvo. No la compartas nunca en el frontend ni en repositorios públicos.
                </p>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span>Integración de ejemplo (cURL)</span>
              </div>
              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
                  {getCurlSnippet(credentials.secretKey)}
                </pre>
                <button
                  onClick={() => copyToClipboard(getCurlSnippet(credentials.secretKey), 'curl')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                  title="Copiar Código"
                >
                  {copiedKey === 'curl' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setCredentials(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Registrar otra aplicación
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Configuración del Comercio</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nombre de la Aplicación
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Mi Tienda de Prueba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm"
                />
              </div>

              <div>
                <label htmlFor="returnUrl" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  URL de Retorno Exitoso <span className="text-slate-600 normal-case font-normal">(Opcional)</span>
                </label>
                <input
                  id="returnUrl"
                  type="url"
                  placeholder="Dejar vacío para usar pantalla por defecto"
                  value={returnUrl}
                  onChange={(e) => setReturnUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono"
                />
              </div>

              <div>
                <label htmlFor="cancelUrl" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  URL de Cancelación <span className="text-slate-600 normal-case font-normal">(Opcional)</span>
                </label>
                <input
                  id="cancelUrl"
                  type="url"
                  placeholder="Dejar vacío para usar pantalla por defecto"
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono"
                />
              </div>

              <div>
                <label htmlFor="webhookUrl" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  URL de Notificación Webhook <span className="text-red-400 normal-case font-bold">(Requerido)</span>
                </label>
                <input
                  id="webhookUrl"
                  type="url"
                  required
                  placeholder="http://localhost:5173/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-200 text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transform cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Registrando app...</span>
                  </>
                ) : (
                  <>
                    <Code className="h-4.5 w-4.5" />
                    <span>Generar Credenciales API</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-slate-600 border-t border-slate-900 py-8 px-4">
        <p>&copy; {new Date().getFullYear()} MockPay Gateway Corporation. Solamente para propósitos de prueba y demostración en desarrollo.</p>
      </footer>
    </div>
  );
}
