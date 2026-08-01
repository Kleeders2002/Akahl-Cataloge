/**
 * Componente: ManufacturingSelector
 *
 * Selector para tipo de manufactura (Bespoke / Industrial) - Estilo AKAHL.
 */

function ManufacturingSelector({ types, selected, onSelect }) {
  return (
    <div className="card">
      <h3 className="text-lg font-display font-semibold text-white mb-4 tracking-wide">MANUFACTURING TYPE</h3>

      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => {
          const isSelected = type.id === selected;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`p-4 rounded-lg border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-white bg-white/5'
                  : 'border-neutral-700 hover:border-neutral-600 bg-transparent'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-white/10 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {type.icon}
                </div>
                <div className="text-center">
                  <p className={`font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    {type.name}
                  </p>
                  <p className={`text-sm ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ManufacturingSelector;
