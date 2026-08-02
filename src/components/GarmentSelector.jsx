/**
 * Componente: GarmentSelector
 *
 * Selector para tipo de prenda - Estilo AKAHL Premium.
 */

function GarmentSelector({ types, selected, onSelect }) {
  return (
    <div className="card-premium">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
        <h3 className="text-lg font-display font-semibold text-white tracking-[0.15em] uppercase">Garment Type</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {types.map((type) => {
          const isSelected = type.id === selected;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`p-4 rounded-xl border transition-all duration-300 active:scale-95 relative overflow-hidden ${
                isSelected
                  ? 'border-akahl-secondary bg-akahl-secondary/10 shadow-premium'
                  : 'border-akahl-secondary/20 hover:border-akahl-secondary/40 bg-akahl-primary/30 hover:bg-akahl-primary/50'
              }`}
            >
              {/* Shimmer effect for selected */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-akahl-secondary/10 to-transparent -translate-x-full animate-shimmer"></div>
              )}

              <div className="flex flex-col items-center gap-2 relative">
                {/* Icon */}
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isSelected
                    ? 'bg-akahl-secondary/20 text-akahl-secondary'
                    : 'bg-akahl-primary/50 text-neutral-500'
                }`}>
                  <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                    {type.icon}
                  </div>
                </div>

                {/* Name */}
                <p className={`text-sm font-medium text-center tracking-wide transition-colors ${
                  isSelected ? 'text-akahl-secondary' : 'text-neutral-400'
                }`}>
                  {type.name}
                </p>

                {/* Selection indicator dot */}
                {isSelected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-akahl-secondary rounded-full shadow-gold-glow"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GarmentSelector;
