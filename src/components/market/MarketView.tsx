import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Truck,
  Trash2
} from 'lucide-react';
import { 
  MarketProduct, 
  MarketCategory,
  UserRole
} from '../../types';
import { 
  MOCK_MARKET_PRODUCTS, 
  LUSAKA_POPULAR_HUBS 
} from '../../data/mockData';

interface MarketViewProps {
  currentRole?: UserRole;
}

export const MarketView: React.FC<MarketViewProps> = ({ currentRole = 'customer' }) => {
  const [products, setProducts] = useState<MarketProduct[]>(MOCK_MARKET_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [escrowSuccess, setEscrowSuccess] = useState(false);

  // Filters
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(15000);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // New listing form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState<MarketCategory>('Electronics');
  const [newCondition, setNewCondition] = useState<'Brand New' | 'Refurbished' | 'Fairly Used'>('Brand New');
  const [newLocation, setNewLocation] = useState(LUSAKA_POPULAR_HUBS[0]);
  const [newDesc, setNewDesc] = useState('');

  const categories: MarketCategory[] = [
    'All',
    'Electronics',
    'Farm & Agri',
    'Fashion & Chitenge',
    'Home & Hardware',
    'Automotive'
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.priceZMW <= maxPriceFilter;
    const matchesVerified = !onlyVerified || p.isVerifiedSeller;
    return matchesCat && matchesSearch && matchesPrice && matchesVerified;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newProd: MarketProduct = {
      id: `mkt_custom_${Date.now()}`,
      title: newTitle,
      priceZMW: Number(newPrice),
      category: newCategory,
      condition: newCondition,
      location: newLocation,
      sellerId: 'usr_me',
      sellerName: 'Chileshe Mulenga (You)',
      sellerPhone: '+260 97 789 4432',
      isVerifiedSeller: true,
      description: newDesc || 'Verified listing on Mride Market Lusaka.',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80',
      postedDate: 'Just now',
      status: 'available'
    };

    setProducts([newProd, ...products]);
    setIsListingModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) => 
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'available' ? 'reserved' : p.status === 'reserved' ? 'sold' : 'available';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const isSellerView = currentRole === 'market_seller';

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0F1E36] text-[#FF7A00]">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              {isSellerView ? 'Merchant Store Dashboard' : 'Mride Market'}
            </h1>
            <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {isSellerView ? 'Seller Management' : 'Zambian Commerce'}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            {isSellerView
              ? 'Manage your store products, update availability, track buyer inquiries, and publish new stock.'
              : 'Buy and sell goods with escrow protection and integrated Mride Cargo doorstep delivery across Lusaka.'}
          </p>
        </div>

        <button
          onClick={() => setIsListingModalOpen(true)}
          className="bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          List New Item for Sale
        </button>
      </div>

      {/* SELLER ROLE STOREFRONT DASHBOARD */}
      {isSellerView ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Store Inventory ({products.length} Products)</h3>
              <p className="text-xs text-slate-500">Click to change product state: Available ➔ Reserved ➔ Sold</p>
            </div>
            <span className="bg-[#FF7A00] text-[#0F1E36] text-xs font-bold px-2.5 py-1 rounded-full">
              Verified Merchant
            </span>
          </div>

          <div className="space-y-3">
            {products.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#F1F5F2] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.category} • {item.location}</p>
                    <span className="text-sm font-extrabold text-[#0F1E36]">ZMW {item.priceZMW.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => toggleProductStatus(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      item.status === 'available' 
                        ? 'bg-orange-100 text-orange-950' 
                        : item.status === 'reserved' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Status: {item.status}
                  </button>
                  <button
                    onClick={() => deleteProduct(item.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* BUYER ROLE MARKETPLACE VIEW */
        <>
          {/* Search, Filter Pills & Price Slider */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search phones, agricultural produce, chitenge fashion, generators, auto parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F1E36] shadow-sm"
              />
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[#0F1E36] text-[#FF7A00] shadow-sm' 
                        : 'bg-[#F1F5F2] hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <span>Max Price:</span>
                  <span className="font-bold text-[#0F1E36]">ZMW {maxPriceFilter.toLocaleString()}</span>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-24 accent-[#0F1E36]"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="rounded text-[#0F1E36] focus:ring-[#0F1E36]"
                  />
                  <span>Verified Sellers Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setInquirySuccess(false);
                  setEscrowSuccess(false);
                }}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {product.condition}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-[#FF7A00] text-[#0F1E36] text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0F1E36] transition-colors line-clamp-2">
                      {product.title}
                    </h3>

                    <p className="text-lg font-extrabold text-[#0F1E36]">
                      ZMW {product.priceZMW.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-700" />
                      {product.sellerName}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      product.status === 'available' ? 'bg-orange-50 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="relative h-60 bg-slate-100">
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                  {selectedProduct.category} • {selectedProduct.condition}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedProduct.title}
                </h3>
                <p className="text-2xl font-extrabold text-[#0F1E36] mt-2">
                  ZMW {selectedProduct.priceZMW.toLocaleString()}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-[#F1F5F2] p-3 rounded-2xl">
                {selectedProduct.description}
              </p>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Seller Name:</span>
                  <strong className="text-slate-800">{selectedProduct.sellerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Item Location:</span>
                  <strong className="text-slate-800">{selectedProduct.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Option:</span>
                  <strong className="text-orange-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Mride Cargo dispatch available
                  </strong>
                </div>
              </div>

              {escrowSuccess ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center text-xs text-orange-950 font-bold space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-orange-800">
                    <CheckCircle2 className="w-4 h-4" />
                    Mride Escrow Order Initiated!
                  </div>
                  <p className="text-[11px] font-medium text-orange-700">
                    Funds are secured until you inspect the item. Mride Cargo courier assigned for pickup from {selectedProduct.location}.
                  </p>
                </div>
              ) : inquirySuccess ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center text-xs text-orange-950 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-700" />
                  Inquiry sent to {selectedProduct.sellerName}!
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${selectedProduct.sellerPhone}`}
                    className="flex-1 bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call Seller
                  </a>
                  <button
                    onClick={() => setEscrowSuccess(true)}
                    className="bg-[#FF7A00] hover:bg-[#cbf44f] text-[#0F1E36] font-bold px-4 py-3 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Order with Cargo Delivery
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateListing}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">List an Item on Mride Market</h3>
              <button 
                type="button" 
                onClick={() => setIsListingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Product Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solar inverter 2kVA, Zambian Chitenge dress..."
                className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Price in ZMW</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MarketCategory)}
                  className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-2 py-2 text-xs sm:text-sm font-medium"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-2 py-2 text-xs sm:text-sm font-medium"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Fairly Used">Fairly Used</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Lusaka Location</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-2 py-2 text-xs sm:text-sm font-medium"
                >
                  {LUSAKA_POPULAR_HUBS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe specifications, warranty, or delivery arrangements..."
                className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold py-3 rounded-xl text-sm transition-all shadow-md"
            >
              Publish Store Listing Immediately
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
