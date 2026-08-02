/**
 * Componente: FabricCard
 *
 * Muestra la información de una tela encontrada - Estilo AKAHL Premium.
 */

function FabricCard({ fabric }) {
  return (
    <div className="card-premium animate-scale-in">
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-4"></div>

      <div className="flex items-start justify-between gap-4">
        {/* Información principal */}
        <div className="flex-1">
          {/* Código y nombre */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <h3 className="text-3xl font-display font-bold text-gradient-gold tracking-wider">
                {fabric.code}
              </h3>
              {/* Decorative underline */}
              <div className="absolute -bottom-1 left-0 w-full h-px bg-akahl-secondary/30"></div>
            </div>
            <span className="text-akahl-secondary/40 text-xl">•</span>
            <h2 className="text-xl font-medium text-white tracking-wide">{fabric.name}</h2>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-8 h-8 rounded-lg bg-akahl-secondary/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-akahl-secondary/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-akahl-secondary/50 uppercase tracking-wider">Supplier</p>
                <p className="text-neutral-300">{fabric.supplier}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-8 h-8 rounded-lg bg-akahl-secondary/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-akahl-secondary/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-akahl-secondary/50 uppercase tracking-wider">Category</p>
                <p className="text-neutral-300">{fabric.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-8 h-8 rounded-lg bg-akahl-secondary/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-akahl-secondary/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-akahl-secondary/50 uppercase tracking-wider">Composition</p>
                <p className="text-neutral-300">{fabric.composition}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-8 h-8 rounded-lg bg-akahl-secondary/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-akahl-secondary/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-akahl-secondary/50 uppercase tracking-wider">Weight</p>
                <p className="text-neutral-300">{fabric.weight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Precio base y disponibilidad */}
        <div className="flex flex-col items-end gap-4">
          {/* Precio base Premium */}
          <div className="text-right">
            <p className="text-xs text-akahl-secondary/60 uppercase tracking-[0.15em] mb-1">Price per Meter</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg text-akahl-secondary/80">$</span>
              <p className="text-4xl font-display font-bold text-gradient-gold">
                {fabric.basePricePerMeter.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tag de disponibilidad Premium */}
          {fabric.availability === 'available' ? (
            <span className="tag-available animate-pulse-glow">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              In Stock
            </span>
          ) : (
            <span className="tag-out-of-stock">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-4"></div>
    </div>
  );
}

export default FabricCard;
