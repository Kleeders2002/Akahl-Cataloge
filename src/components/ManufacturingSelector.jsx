/**
 * Componente: ManufacturingSelector
 *
 * Selector para tipo de manufactura (Bespoke / Industrial) - Estilo AKAHL Premium.
 */

function ManufacturingSelector({ types, selected, onSelect }) {
  return (
    <div className="card-premium">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
        <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Manufacturing Type</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {types.map((type) => {
          const isSelected = type.id === selected;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`p-5 rounded-xl border transition-all duration-300 active:scale-95 relative overflow-hidden ${
                isSelected
                  ? 'border-akahl-secondary bg-akahl-secondary/10 shadow-premium'
                  : 'border-akahl-secondary/20 hover:border-akahl-secondary/40 bg-akahl-primary/30 hover:bg-akahl-primary/50'
              }`}
            >
              {/* Shimmer effect for selected */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-akahl-secondary/10 to-transparent -translate-x-full animate-shimmer"></div>
              )}

              <div className="flex flex-col items-center gap-3 relative">
                {/* Text content */}
                <div className="text-center">
                  <p className={`font-semibold tracking-[0.1em] uppercase transition-colors ${
                    isSelected ? 'text-akahl-secondary' : 'text-neutral-400'
                  }`}>
                    {type.name}
                  </p>
                  <p className={`text-sm mt-1 transition-colors ${
                    isSelected ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>
                    {type.description}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-akahl-secondary rounded-full flex items-center justify-center shadow-gold-glow">
                    <svg className="w-4 h-4 text-akahl-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ManufacturingSelector;
