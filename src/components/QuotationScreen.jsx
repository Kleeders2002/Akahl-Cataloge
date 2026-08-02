/**
 * Componente: QuotationScreen
 *
 * Pantalla principal de cotización - Estilo AKAHL Premium.
 * Permite buscar telas por código y calcular precios según:
 * - Tipo de manufactura (Bespoke / Industrial)
 * - Tipo de prenda (Chaqueta, Pantalón, etc.)
 */

import { useState, useCallback, useEffect } from 'react';
import { getFabricByCode, calculatePrice } from '../services/api';
import FabricCard from './FabricCard';
import PriceDisplay from './PriceDisplay';
import ManufacturingSelector from './ManufacturingSelector';
import GarmentSelector from './GarmentSelector';

// ============================================
// TIPOS DE MANUFACTURA
// ============================================

const MANUFACTURING_TYPES = [
  {
    id: 'bespoke',
    name: 'Bespoke',
    description: 'Handcrafted',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Machine made',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ============================================
// TIPOS DE PRENDA
// ============================================

const GARMENT_TYPES = [
  {
    id: 'jacket',
    name: 'Jacket',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14" />
      </svg>
    )
  },
  {
    id: 'trousers',
    name: 'Trousers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21v-8m0 0V3l5 4 5-4v10m0 0v8" />
      </svg>
    )
  },
  {
    id: 'vest',
    name: 'Vest',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18M9 3v18M15 3v18M19 3v18" />
      </svg>
    )
  },
  {
    id: '2-piece-suit',
    name: '2-Piece Suit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14M12 3v18" />
      </svg>
    )
  },
  {
    id: '3-piece-suit',
    name: '3-Piece Suit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21v-8m0 0V3l5 4 5-4v10m0 0v8M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10l-4.553-2.276A1 1 0 003 8.618v6.764a1 1 0 001.447.894L9 14" />
      </svg>
    )
  },
  {
    id: 'dress-executive',
    name: 'Executive Dress',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-4-8h8" />
      </svg>
    )
  },
];

// ============================================
// COMPONENTE
// ============================================

function QuotationScreen({ onActivity }) {
  // Estado de búsqueda
  const [fabricCode, setFabricCode] = useState('');
  const [searching, setSearching] = useState(false);

  // Tela encontrada
  const [fabric, setFabric] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Selecciones
  const [manufacturingType, setManufacturingType] = useState('bespoke');
  const [garmentType, setGarmentType] = useState('2-piece-suit');

  // Precio calculado
  const [priceResult, setPriceResult] = useState(null);

  // ============================================
  // MANEJADORES
  // ============================================

  /**
   * Busca tela por código
   */
  const searchFabric = useCallback(async () => {
    if (!fabricCode.trim()) {
      setFabric(null);
      setNotFound(false);
      setPriceResult(null);
      return;
    }

    setSearching(true);
    setNotFound(false);
    onActivity?.();

    try {
      const result = await getFabricByCode(fabricCode.trim());

      if (result) {
        setFabric(result);
        setNotFound(false);

        // Recalcular precio con selecciones actuales
        const price = calculatePrice({
          manufacturingType,
          garmentType,
          basePrice: result.basePricePerMeter,
        });
        setPriceResult(price);
      } else {
        setFabric(null);
        setNotFound(true);
        setPriceResult(null);
      }
    } catch (error) {
      console.error('Error searching fabric:', error);
      setFabric(null);
      setNotFound(true);
      setPriceResult(null);
    } finally {
      setSearching(false);
    }
  }, [fabricCode, manufacturingType, garmentType, onActivity]);

  /**
   * Efecto: buscar al presionar Enter
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        searchFabric();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFabric]);

  /**
   * Efecto: recalcular precio cuando cambian selecciones o tela
   */
  useEffect(() => {
    if (fabric && manufacturingType && garmentType) {
      const price = calculatePrice({
        manufacturingType,
        garmentType,
        basePrice: fabric.basePricePerMeter,
      });
      setPriceResult(price);
    }
  }, [fabric, manufacturingType, garmentType]);

  /**
   * Limpia para nueva cotización
   */
  const handleClear = useCallback(() => {
    setFabricCode('');
    setFabric(null);
    setNotFound(false);
    setPriceResult(null);
    setManufacturingType('bespoke');
    setGarmentType('2-piece-suit');
    onActivity?.();
  }, [onActivity]);

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="space-y-6">
      {/* Buscador Premium */}
      <div className="card-premium animate-slide-up">
        <div className="h-px bg-gradient-to-r from-akahl-secondary via-akahl-secondary/50 to-transparent mb-5"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-akahl-secondary rounded-full"></div>
          <label className="text-sm font-semibold text-akahl-secondary/80 tracking-[0.2em] uppercase">
            Fabric Search
          </label>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={fabricCode}
              onChange={(e) => {
                setFabricCode(e.target.value.toUpperCase());
                setNotFound(false);
                onActivity?.();
              }}
              placeholder="Enter fabric code..."
              className="input-field flex-1 text-2xl bg-akahl-primary/50 border-akahl-secondary/30 placeholder:text-akahl-secondary/30"
              maxLength={20}
              autoFocus
            />
            {/* Search icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-akahl-secondary/40">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={searchFabric}
            disabled={searching || !fabricCode.trim()}
            className="btn-primary px-10 shadow-premium disabled:opacity-50"
          >
            {searching ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                SEARCHING
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                SEARCH
              </span>
            )}
          </button>
        </div>

        {/* Mensaje de no encontrado */}
        {notFound && (
          <div className="mt-5 p-4 bg-red-950/40 border border-red-900/50 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-950/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-900/50">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-400 tracking-wide">Fabric Not Found</p>
                <p className="text-sm text-red-400/70 mt-1">
                  Verify the code and try again
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Códigos sugeridos Premium */}
        {!fabric && !notFound && !searching && (
          <div className="mt-5">
            <p className="text-sm text-akahl-secondary/50 mb-3 tracking-[0.1em] uppercase">Sample Fabric Codes</p>
            <div className="flex flex-wrap gap-2">
              {['TL-402', 'TL-405', 'TL-408', 'TL-420', 'TL-425', 'TL-440'].map((code, index) => (
                <button
                  key={code}
                  onClick={() => {
                    setFabricCode(code);
                    onActivity?.();
                  }}
                  className="px-4 py-2 bg-akahl-primary/50 hover:bg-akahl-secondary/20 active:bg-akahl-secondary/30 rounded-lg text-sm font-medium text-akahl-secondary/80 transition-all border border-akahl-secondary/20 hover:border-akahl-secondary/40 animate-scale-in"
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-akahl-secondary/30 to-transparent mt-5"></div>
      </div>

      {/* Contenido cuando hay tela */}
      {fabric && (
        <>
          {/* Tarjeta de tela */}
          <div className="animate-slide-up">
            <FabricCard fabric={fabric} />
          </div>

          {/* Selectores */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tipo de manufactura */}
            <ManufacturingSelector
              types={MANUFACTURING_TYPES}
              selected={manufacturingType}
              onSelect={(type) => {
                setManufacturingType(type);
                onActivity?.();
              }}
            />

            {/* Tipo de prenda */}
            <GarmentSelector
              types={GARMENT_TYPES}
              selected={garmentType}
              onSelect={(type) => {
                setGarmentType(type);
                onActivity?.();
              }}
            />
          </div>

          {/* Display de precio */}
          {priceResult && (
            <div className="animate-scale-in">
              <PriceDisplay
                price={priceResult.finalPrice}
                desglose={priceResult.desglose}
                fabric={fabric}
                garmentType={GARMENT_TYPES.find(g => g.id === garmentType)?.name}
                manufacturingType={MANUFACTURING_TYPES.find(m => m.id === manufacturingType)?.name}
                onNewQuotation={handleClear}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QuotationScreen;
