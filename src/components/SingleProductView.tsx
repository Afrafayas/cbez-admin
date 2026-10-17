import React, { useState } from 'react';
import { Product, Shop, getProductImages, normalizeProduct } from '../types';
import {
  ArrowLeft,
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
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Check,
  Battery,
  Shield,
  Clock,
  Cpu,
  HardDrive,
  Smartphone,
  Sparkles,
  Package,
  FileText,
  Wrench,
  Radio,
  Eye,
} from 'lucide-react';

interface SingleProductViewProps {
  product: Product;
  onBack: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewShop?: (shop: Shop | { id: string; name: string }) => void;
  backLabel?: string;
}

export const SingleProductView: React.FC<SingleProductViewProps> = ({
  product: rawProduct,
  onBack,
  onEdit,
  onDelete,
  onViewShop,
  backLabel,
}) => {
  const product = normalizeProduct(rawProduct);
  const productImages = getProductImages(product);
  const images =
    productImages.length > 0
      ? productImages
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const handleCopyId = () => {
    if (!product.id) return;
    navigator.clipboard.writeText(product.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Safe helper to extract spec values case-insensitively
  const getSpec = (keys: string[]): string | undefined => {
    if (!product.specs) return undefined;
    for (const key of keys) {
      if (product.specs[key] !== undefined && product.specs[key] !== null && String(product.specs[key]).trim() !== '') {
        return String(product.specs[key]).trim();
      }
      // Also test lowercase / stripped match
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [specK, specV] of Object.entries(product.specs)) {
        if (specK.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey && specV !== undefined && specV !== null && String(specV).trim() !== '') {
          return String(specV).trim();
        }
      }
    }
    return undefined;
  };

  const cond = product.conditionInfo || {};

  // Resolve Key Device Attributes
  const conditionGrade =
    cond.condition ||
    product.condition ||
    getSpec(['Condition', 'condition', 'Device Condition']) ||
    'Good';

  const batteryHealth =
    cond.batteryHealth ||
    product.batteryHealth ||
    getSpec(['Battery Health', 'batteryHealth', 'Battery Percentage', 'Battery', 'battery']);

  const warranty =
    cond.warrantyStatus ||
    product.warranty ||
    getSpec(['Warranty', 'warranty', 'Warranty Status', 'Store Warranty']);

  const deviceAge =
    cond.usageDuration ||
    product.deviceAge ||
    (cond.purchaseYear ? `Purchased in ${cond.purchaseYear}` : undefined) ||
    getSpec(['Device Age', 'deviceAge', 'Age', 'Usage Duration']);

  const ram = product.ram || getSpec(['RAM', 'ram', 'Ram', 'Memory']);
  const storage = product.storage || getSpec(['Storage', 'storage', 'ROM', 'Internal Storage', 'Storage Capacity']);
  const processor = (product as any).processor || getSpec(['Processor / Chipset', 'Processor', 'processor', 'Chipset', 'CPU']);
  const displaySize = (product as any).displaySize || getSpec(['Display Size', 'displaySize', 'Display', 'Screen Size']);
  const camera = (product as any).camera || getSpec(['Camera', 'Camera Specs', 'camera', 'Rear Camera']);
  const os = (product as any).os || getSpec(['Operating System', 'operatingSystem', 'OS']);
  const color = product.color || getSpec(['Color', 'color', 'Colour']);
  const network = product.network || getSpec(['Network (5G/4G)', 'Network', 'network']);
  const simType = product.simType || getSpec(['SIM Type', 'simType', 'SIM']);
  const imei = (product as any).imei || (product as any).imeiNumber || (product as any).imeiSerial || getSpec(['IMEI', 'imei', 'Serial Number']);

  // Included Items / Accessories list
  const rawAccessories: string[] = [];
  if (Array.isArray(cond.includedAccessories)) {
    rawAccessories.push(...cond.includedAccessories);
  }
  if (product.includedItems) {
    rawAccessories.push(
      ...product.includedItems.split(/[,+]/).map((s) => s.trim()).filter(Boolean)
    );
  }
  const specIncluded = getSpec(['Included Items', 'includedItems', 'Accessories']);
  if (specIncluded) {
    rawAccessories.push(
      ...specIncluded.split(/[,+]/).map((s) => s.trim()).filter(Boolean)
    );
  }
  const includedAccessories = Array.from(new Set(rawAccessories)).filter(Boolean);

  // Pricing calculations
  const rawPrice = product.price || 0;
  const rawOffer = product.offerPrice !== undefined && product.offerPrice !== null
    ? product.offerPrice
    : getSpec(['offerPrice', 'Offer Price', 'offer_price']);
  const hasOffer =
    rawOffer !== undefined &&
    rawOffer !== null &&
    !isNaN(Number(rawOffer)) &&
    Number(rawOffer) > 0 &&
    Number(rawOffer) < rawPrice;

  const displayPrice = hasOffer ? Number(rawOffer) : rawPrice;
  const originalPrice = rawPrice;
  const savings = hasOffer ? originalPrice - displayPrice : 0;
  const discountPercent = hasOffer ? Math.round((savings / originalPrice) * 100) : 0;

  const isSoldOut = product.stock <= 0 || product.isSoldOut;

  // Deduplicated & Normalized Technical Specifications
  const renderedKnownKeys = new Set([
    'ram',
    'storage',
    'processor',
    'display',
    'camera',
    'operatingsystem',
    'color',
    'network',
    'simtype',
    'imei',
    'condition',
    'warranty',
    'batteryhealth',
    'batterypercentage',
    'battery',
    'deviceage',
    'includeditems',
    'accessories',
    'offerprice',
  ]);

  const rawSpecs = product.specs ? Object.entries(product.specs) : [];
  const seenLabels = new Set<string>();
  const customSpecs: { label: string; value: string }[] = [];

  rawSpecs.forEach(([k, v]) => {
    if (!v || String(v).trim() === '') return;
    const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (renderedKnownKeys.has(normK)) return;
    if (seenLabels.has(normK)) return;
    seenLabels.add(normK);
    customSpecs.push({
      label: k.replace(/_/g, ' '),
      value: String(v),
    });
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Navigation & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{backLabel || (product.shop?.name ? `Back to ${product.shop.name}` : 'Back to Products')}</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Catalog</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[220px]">{product.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Product</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery, Store Profile & Identifiers (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Gallery Card */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl overflow-hidden">
            <div className="relative w-full aspect-square rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-white/5 group">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                }}
              />

              {/* Status Badge Over Image */}
              {isSoldOut ? (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/90 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-lg shadow-red-500/30 flex items-center gap-1.5 backdrop-blur-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Sold Out
                </div>
              ) : (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500/90 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock})
                </div>
              )}

              {/* Image Counter */}
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-mono">
                {activeImageIndex + 1} / {images.length} Photos
              </span>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="mt-3.5">
                <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  Verified Device Angles ({images.length} views):
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl bg-slate-950 border overflow-hidden shrink-0 transition-all cursor-pointer p-1 ${
                        activeImageIndex === idx
                          ? 'border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-500/30 scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Associated Seller Store Profile Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-orange-400" />
                Merchant Dealer Profile
              </span>
              {product.shop?.verified && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Store
                </span>
              )}
            </div>

            {product.shop ? (
              <div
                onClick={() => onViewShop && onViewShop(product.shop as any)}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-base shrink-0 group-hover:scale-105 transition-transform">
                      {product.shop.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors truncate flex items-center gap-1.5">
                        <span>{product.shop.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                        <span>{product.shop.city || 'Store Location'}</span>
                        {product.shop.ownerName && <span>• {product.shop.ownerName}</span>}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {product.shop.address && (
                  <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-white/5 line-clamp-2">
                    {product.shop.address}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                No active dealer store linked to this product (Orphaned listing).
              </div>
            )}

            {/* Direct Contact Actions */}
            {product.shop && (product.shop.phone || product.shop.whatsapp) && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {product.shop.phone && (
                  <a
                    href={`tel:${product.shop.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-white/10 hover:border-orange-500/40 text-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                    <span className="truncate">{product.shop.phone}</span>
                  </a>
                )}
                {product.shop.whatsapp && (
                  <a
                    href={`https://wa.me/${product.shop.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Product Metadata & Quick ID Card */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/60 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                System Identifiers
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-500">Product ID:</span>
              <span className="truncate max-w-[200px]">{product.id}</span>
            </div>

            {product.shopId && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-500">Shop ID:</span>
                <span className="truncate max-w-[200px]">{product.shopId}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span>Added: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
              <span>Updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Specs, Inspection & Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header & Pricing Hero */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-500/30 text-orange-300 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-white/10 text-slate-300">
                {product.category}
              </span>
              {conditionGrade && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  {conditionGrade}
                </span>
              )}
              {warranty && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  {warranty}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Pricing Section with Offer Computation */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>

              {hasOffer && (
                <>
                  <span className="text-base text-slate-500 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    Save ₹{savings.toLocaleString('en-IN')} ({discountPercent}% OFF)
                  </span>
                </>
              )}

              <span className="text-xs text-slate-400 ml-auto">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Quick Specifications Highlights Grid */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-3.5">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Key Device Highlights
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* Storage */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-orange-400" /> Storage
                </span>
                <span className="font-bold text-white mt-1 text-sm">{storage || 'N/A'}</span>
              </div>

              {/* RAM */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-400" /> RAM
                </span>
                <span className="font-bold text-white mt-1 text-sm">{ram || 'N/A'}</span>
              </div>

              {/* Battery Health */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Battery className="w-3 h-3 text-emerald-400" /> Battery
                </span>
                <span className="font-bold text-white mt-1 text-sm">
                  {batteryHealth ? (batteryHealth.includes('%') ? batteryHealth : `${batteryHealth}%`) : 'N/A'}
                </span>
              </div>

              {/* Warranty */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Warranty
                </span>
                <span className="font-bold text-white mt-1 text-xs truncate" title={warranty}>
                  {warranty || 'Shop Warranty'}
                </span>
              </div>

              {/* Device Age / Usage */}
              {deviceAge && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Device Age
                  </span>
                  <span className="font-bold text-white mt-1 text-xs truncate">{deviceAge}</span>
                </div>
              )}

              {/* Color */}
              {color && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-pink-400" /> Color
                  </span>
                  <span className="font-bold text-white mt-1 text-xs capitalize truncate">{color}</span>
                </div>
              )}

              {/* Network */}
              {network && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-purple-400" /> Network
                  </span>
                  <span className="font-bold text-white mt-1 text-xs truncate">
                    {network} {simType ? `(${simType})` : ''}
                  </span>
                </div>
              )}

              {/* Processor */}
              {processor && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" /> Processor
                  </span>
                  <span className="font-bold text-white mt-1 text-xs truncate" title={processor}>
                    {processor}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Device Condition & Inspection Report Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Device Verification & Condition Report
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Condition Grade */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Condition Grade</span>
                <span className="font-bold text-orange-400">{conditionGrade}</span>
              </div>

              {/* Battery Performance */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Battery Status</span>
                <span className="font-bold text-emerald-400">
                  {batteryHealth ? (batteryHealth.includes('%') ? batteryHealth : `${batteryHealth}%`) : 'Original Battery'}
                </span>
              </div>

              {/* Original Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Original Retail Box</span>
                {cond.originalBox !== undefined ? (
                  cond.originalBox ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      Included
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium text-[11px]">
                      Not Included
                    </span>
                  )
                ) : (
                  <span className="font-medium text-slate-300">Included if in accessories</span>
                )}
              </div>

              {/* Original Bill / Invoice */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Original Bill / Invoice</span>
                {cond.originalInvoice !== undefined ? (
                  cond.originalInvoice ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium text-[11px]">
                      Not Available
                    </span>
                  )
                ) : (
                  <span className="font-medium text-slate-300">Store Receipt Provided</span>
                )}
              </div>

              {/* Repair History */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between sm:col-span-2">
                <span className="text-slate-400">Repair History & Parts</span>
                <span className="font-semibold text-slate-200 text-right">
                  {cond.repairHistory || cond.replacedParts || 'Original Parts / Never Opened'}
                </span>
              </div>

              {/* Physical Condition / Defects */}
              {cond.defects && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 sm:col-span-2 flex items-start gap-2 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-xs">Cosmetic / Defect Notes:</span>
                    <span className="text-xs text-amber-300/90">{cond.defects}</span>
                  </div>
                </div>
              )}

              {/* Seller Notes */}
              {cond.sellerNotes && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 sm:col-span-2 space-y-1">
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                    Seller Remarks
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{cond.sellerNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Included Accessories & Box Contents */}
          {includedAccessories.length > 0 && (
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-3">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Included Accessories & Box Items ({includedAccessories.length})
              </h2>

              <div className="flex flex-wrap gap-2 pt-1">
                {includedAccessories.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Technical Specifications Grid */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              All Technical Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Primary specs cards */}
              {product.brand && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Brand</span>
                  <span className="text-white font-semibold mt-0.5">{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Category</span>
                  <span className="text-white font-semibold mt-0.5">{product.category}</span>
                </div>
              )}
              {storage && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Storage Capacity</span>
                  <span className="text-white font-semibold mt-0.5">{storage}</span>
                </div>
              )}
              {ram && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">RAM</span>
                  <span className="text-white font-semibold mt-0.5">{ram}</span>
                </div>
              )}
              {processor && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Processor / Chipset</span>
                  <span className="text-white font-semibold mt-0.5">{processor}</span>
                </div>
              )}
              {displaySize && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Display Size</span>
                  <span className="text-white font-semibold mt-0.5">{displaySize}</span>
                </div>
              )}
              {camera && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Camera Specifications</span>
                  <span className="text-white font-semibold mt-0.5">{camera}</span>
                </div>
              )}
              {os && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Operating System</span>
                  <span className="text-white font-semibold mt-0.5">{os}</span>
                </div>
              )}
              {color && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Device Color</span>
                  <span className="text-white font-semibold mt-0.5 capitalize">{color}</span>
                </div>
              )}
              {network && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">Network Support</span>
                  <span className="text-white font-semibold mt-0.5">{network}</span>
                </div>
              )}
              {simType && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center">
                  <span className="text-slate-400 text-[11px]">SIM Configuration</span>
                  <span className="text-white font-semibold mt-0.5">{simType}</span>
                </div>
              )}
              {imei && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center font-mono">
                  <span className="text-slate-400 text-[11px]">IMEI / Serial</span>
                  <span className="text-slate-300 font-semibold mt-0.5 truncate">{imei}</span>
                </div>
              )}

              {/* Any other custom specs defined by seller */}
              {customSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col justify-center"
                >
                  <span className="text-slate-400 text-[11px] capitalize">{spec.label}</span>
                  <span className="text-white font-semibold mt-0.5">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Description */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg space-y-2.5">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Product Description
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-white/5">
              {product.description || 'No detailed description provided by the seller for this item.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
