/**
 * Componente: GarmentSelector
 *
 * Selector para tipo de prenda - Estilo AKAHL.
 */

function GarmentSelector({ types, selected, onSelect }) {
  return (
    <div className="card">
      <h3 className="text-lg font-display font-semibold text-white mb-4 tracking-wide">GARMENT TYPE</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {types.map((type) => {
          const isSelected = type.id === selected;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`p-3 rounded-lg border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-white bg-white/5'
                  : 'border-neutral-700 hover:border-neutral-600 bg-transparent'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className={isSelected ? 'text-white' : 'text-neutral-500'}>
                  {type.icon}
                </div>
                <p className={`text-sm font-medium text-center tracking-wide ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                  {type.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GarmentSelector;
