import React, { useState } from 'react';
import { Product, getProductImages, normalizeProduct } from '../types';
import {
  X,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowLeft,
  Sparkles,
  Shield,
  Battery,
  HardDrive,
  Cpu,
  Clock,
  Package,
  Check,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: rawProduct,
  isOpen,
  onClose,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!isOpen || !rawProduct) return null;

  const product = normalizeProduct(rawProduct);
  const productImages = getProductImages(product);
  const images =
    productImages.length > 0
      ? productImages
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'];

  const cond = product.conditionInfo || {};
  const specs = product.specs || {};

  const getSpec = (keys: string[]): string | undefined => {
    for (const key of keys) {
      if (specs[key] !== undefined && specs[key] !== null && String(specs[key]).trim() !== '') {
        return String(specs[key]).trim();
      }
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [specK, specV] of Object.entries(specs)) {
        if (specK.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey && specV !== undefined && specV !== null && String(specV).trim() !== '') {
          return String(specV).trim();
        }
      }
    }
    return undefined;
  };

  const conditionGrade = cond.condition || product.condition || getSpec(['Condition', 'condition']) || 'Good';
  const rawBatt = cond.batteryHealth || product.batteryHealth || getSpec(['Battery Health', 'batteryHealth', 'Battery', 'battery', 'Battery Percentage']);
  const batteryHealth = rawBatt ? (String(rawBatt).includes('%') ? String(rawBatt) : `${rawBatt}%`) : undefined;
  const warranty = cond.warrantyStatus || product.warranty || getSpec(['Warranty', 'warranty', 'Warranty Status']) || 'Shop Warranty';
  const deviceAge =
    cond.usageDuration ||
    product.deviceAge ||
    (product as any).device_age ||
    cond.deviceAge ||
    cond.purchaseDate ||
    (cond.purchaseYear ? `Purchased in ${cond.purchaseYear}` : undefined) ||
    getSpec(['Device Age', 'deviceAge', 'device_age', 'Device Age / Purchase Date', 'Purchase Date', 'purchaseDate', 'purchase_date', 'Age', 'Usage Duration', 'usageDuration']);
  const storage = product.storage || getSpec(['Storage', 'storage', 'ROM', 'Internal Storage']);
  const ram = product.ram || getSpec(['RAM', 'ram', 'Ram', 'Memory']);
  const processor = getSpec(['Processor / Chipset', 'Processor', 'processor']);
  const displaySize = getSpec(['Display Size', 'displaySize']);
  const camera = getSpec(['Camera', 'Camera Specs', 'camera']);
  const os = getSpec(['Operating System', 'operatingSystem', 'OS']);
  const color = product.color || getSpec(['Color', 'color']);
  const network = product.network || getSpec(['Network (5G/4G)', 'Network', 'network']);
  const simType = product.simType || getSpec(['SIM Type', 'simType']);
  const imei = getSpec(['IMEI', 'imei']);

  // Pricing
  const rawPrice = product.price || 0;
  const rawOffer = product.offerPrice;
  const hasOffer = rawOffer !== undefined && rawOffer !== null && !isNaN(Number(rawOffer)) && Number(rawOffer) > 0 && Number(rawOffer) < rawPrice;
  const displayPrice = hasOffer ? Number(rawOffer) : rawPrice;
  const originalPrice = rawPrice;
  const savings = hasOffer ? originalPrice - displayPrice : 0;
  const discountPercent = hasOffer ? Math.round((savings / originalPrice) * 100) : 0;
  const isSoldOut = product.stock <= 0 || product.isSoldOut;

  // Accessories
  const rawAccessories: string[] = [];
  if (Array.isArray(cond.includedAccessories)) rawAccessories.push(...cond.includedAccessories);
  if (product.includedItems) rawAccessories.push(...product.includedItems.split(/[,+]/).map(s => s.trim()).filter(Boolean));
  const specIncluded = getSpec(['Included Items', 'includedItems', 'Accessories']);
  if (specIncluded) rawAccessories.push(...specIncluded.split(/[,+]/).map(s => s.trim()).filter(Boolean));
  const includedAccessories = Array.from(new Set(rawAccessories)).filter(Boolean);

  // Filter extra specs to avoid duplicate rows
  const renderedKnownKeys = new Set([
    'ram', 'storage', 'processor', 'display', 'camera', 'operatingsystem',
    'color', 'network', 'simtype', 'imei', 'condition', 'warranty',
    'batteryhealth', 'batterypercentage', 'battery', 'deviceage',
    'includeditems', 'accessories', 'offerprice'
  ]);

  const customSpecs: { label: string; value: string }[] = [];
  const seenLabels = new Set<string>();
  Object.entries(specs).forEach(([k, v]) => {
    if (!v || String(v).trim() === '') return;
    const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (renderedKnownKeys.has(normK) || seenLabels.has(normK)) return;
    seenLabels.add(normK);
    customSpecs.push({ label: k.replace(/_/g, ' '), value: String(v) });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0 cursor-pointer"
              title="Close"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 border border-orange-400/30 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">{product.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-orange-400 font-semibold">{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
                {conditionGrade && (
                  <>
                    <span>•</span>
                    <span className="text-blue-300 font-medium">{conditionGrade}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Product Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Section: Images & Key Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-slate-900 border border-white/10 overflow-hidden relative group flex items-center justify-center p-2">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                  }}
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-emerald-400">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 text-[10px] text-slate-300 font-mono">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition-all cursor-pointer p-0.5 ${
                        activeImageIndex === idx
                          ? 'border-orange-500 ring-2 ring-orange-500/40 opacity-100 scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Pricing Card */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Price Display */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    {hasOffer && (
                      <span className="text-sm text-slate-500 line-through">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {hasOffer && (
                    <div className="text-xs font-bold text-emerald-400">
                      Save ₹{savings.toLocaleString('en-IN')} ({discountPercent}% OFF)
                    </div>
                  )}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    {isSoldOut ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" /> Out of Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Stock ({product.stock} units)
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px]">Inclusive of all taxes</span>
                  </div>
                </div>

                {/* Key Quick Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Condition:</span>
                    <strong className="text-orange-400 text-xs">{conditionGrade}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Battery Health:</span>
                    <strong className="text-emerald-400 text-xs">{batteryHealth || 'Original'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Warranty:</span>
                    <strong className="text-slate-200 text-xs truncate block" title={warranty}>{warranty}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Storage / RAM:</span>
                    <strong className="text-slate-200 text-xs">{storage || 'N/A'} {ram ? `• ${ram}` : ''}</strong>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5 whitespace-pre-line max-h-28 overflow-y-auto">
                    {product.description || 'No description provided for this product.'}
                  </p>
                </div>
              </div>

              {/* Shop Seller Info Card */}
              {product.shop && (
                <div className="p-3.5 rounded-2xl glass-panel border border-orange-500/20 bg-orange-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                      <Store className="w-4 h-4" />
                      <span>{product.shop.name}</span>
                    </div>
                    {product.shop.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Verified Shop
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    {product.shop.ownerName && (
                      <div><span className="text-slate-400">Owner:</span> {product.shop.ownerName}</div>
                    )}
                    {product.shop.city && (
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" /> {product.shop.city}
                      </div>
                    )}
                    {product.shop.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-orange-400 shrink-0" /> {product.shop.phone}
                      </div>
                    )}
                    {product.shop.whatsapp && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <MessageSquare className="w-3 h-3 shrink-0" /> {product.shop.whatsapp}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Condition & Verification Details Card */}
          {(cond.originalBox !== undefined || cond.originalInvoice !== undefined || cond.repairHistory || cond.defects || cond.sellerNotes) && (
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Physical Condition & Inspection
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                {cond.originalBox !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                    <span className="text-slate-400 block">Retail Box:</span>
                    <strong className={cond.originalBox ? 'text-emerald-400' : 'text-slate-400'}>
                      {cond.originalBox ? 'Included' : 'Missing'}
                    </strong>
                  </div>
                )}
                {cond.originalInvoice !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                    <span className="text-slate-400 block">Tax Invoice:</span>
                    <strong className={cond.originalInvoice ? 'text-emerald-400' : 'text-slate-400'}>
                      {cond.originalInvoice ? 'Available' : 'Missing'}
                    </strong>
                  </div>
                )}
                {(cond.repairHistory || cond.replacedParts) && (
                  <div className="p-2 rounded-lg bg-slate-950 border border-white/5 col-span-2">
                    <span className="text-slate-400 block">Repairs:</span>
                    <strong className="text-slate-200">{cond.repairHistory || cond.replacedParts}</strong>
                  </div>
                )}
                {cond.defects && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 col-span-2 sm:col-span-4 text-amber-300">
                    <span className="font-bold block">Cosmetic Flaws:</span> {cond.defects}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Included Accessories */}
          {includedAccessories.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-400" /> Included Accessories ({includedAccessories.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {includedAccessories.map((acc, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-blue-400" /> {acc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Specifications Grid */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              Technical Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {product.brand && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Brand</span>
                  <span className="font-semibold text-slate-200">{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Category</span>
                  <span className="font-semibold text-slate-200">{product.category}</span>
                </div>
              )}
              {storage && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Storage</span>
                  <span className="font-semibold text-slate-200">{storage}</span>
                </div>
              )}
              {ram && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">RAM</span>
                  <span className="font-semibold text-slate-200">{ram}</span>
                </div>
              )}
              {processor && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Processor</span>
                  <span className="font-semibold text-slate-200">{processor}</span>
                </div>
              )}
              {displaySize && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Display Size</span>
                  <span className="font-semibold text-slate-200">{displaySize}</span>
                </div>
              )}
              {camera && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Camera</span>
                  <span className="font-semibold text-slate-200">{camera}</span>
                </div>
              )}
              {os && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">OS</span>
                  <span className="font-semibold text-slate-200">{os}</span>
                </div>
              )}
              {color && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Color</span>
                  <span className="font-semibold text-slate-200 capitalize">{color}</span>
                </div>
              )}
              {network && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Network</span>
                  <span className="font-semibold text-slate-200">{network}</span>
                </div>
              )}
              {simType && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">SIM Type</span>
                  <span className="font-semibold text-slate-200">{simType}</span>
                </div>
              )}
              {imei && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">IMEI</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{imei}</span>
                </div>
              )}
              {customSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-400 capitalize">{spec.label}</span>
                  <span className="font-semibold text-slate-200 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div>Listed on: {new Date(product.createdAt).toLocaleDateString()}</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
