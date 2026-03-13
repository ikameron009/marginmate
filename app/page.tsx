export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-600 shadow-lg">
          <span className="text-4xl">💰</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Margin<span className="text-emerald-600">Mate</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Track product costs and profit margins for your Shopify store.
          Know your numbers, grow your business.
        </p>

        {/* Install form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Install on your store
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your Shopify store domain to get started
          </p>
          <form action="/api/auth" method="GET" className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="shop"
              placeholder="your-store.myshopify.com"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Install App →
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: '📦', title: 'Cost Tracking', desc: 'Enter cost per item for every product variant' },
            { icon: '📊', title: 'Margin Analysis', desc: 'Instantly see profit margins across all products' },
            { icon: '🚨', title: 'Low Margin Alerts', desc: 'Spot underpriced products before they hurt profits' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
