import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  MapPin, 
  Star, 
  ShoppingBag, 
  Plus, 
  Minus, 
  X,
  ChefHat,
  Bike
} from 'lucide-react';
import { 
  FoodRestaurant, 
  FoodMenuItem, 
  CartItem,
  FoodAddonOption,
  SelectedAddon,
  UserRole
} from '../../types';
import { MOCK_FOOD_RESTAURANTS } from '../../data/mockData';
import { validateFoodOrderCalculation } from '../../services/transactionGuard';

interface FoodViewProps {
  currentRole?: UserRole;
}

export const FoodView: React.FC<FoodViewProps> = ({ currentRole = 'customer' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState<FoodRestaurant>(MOCK_FOOD_RESTAURANTS[0]);
  const [cart, setCart] = useState<CartItem[]>([
    { 
      item: MOCK_FOOD_RESTAURANTS[0].menu[0], 
      quantity: 1,
      selectedAddons: [
        { addonId: 'ad_1', name: 'Extra Nshima Portion', priceZMW: 15 },
        { addonId: 'ad_2', name: 'Side of Chibwabwa (Pumpkin Leaves with Groundnuts)', priceZMW: 25 }
      ],
      specialInstructions: 'Please make the village chicken gravy extra rich.'
    }
  ]);
  
  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<FoodMenuItem | null>(null);
  const [modalSelectedAddons, setModalSelectedAddons] = useState<SelectedAddon[]>([]);
  const [modalInstructions, setModalInstructions] = useState('');
  
  // Checkout & Order Tracking State
  const [deliveryAddress, setDeliveryAddress] = useState('Woodlands Extension, House #42');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'MTN MoMo (Staged)' | 'Airtel Money (Staged)'>('Cash on Delivery');
  const [orderStage, setOrderStage] = useState<'idle' | 'placed' | 'kitchen_cooking' | 'courier_on_way' | 'delivered'>('idle');

  // Vendor Kitchen Board state
  const [vendorOrders] = useState([
    {
      id: 'ord_zm_881',
      customer: 'Chileshe Mulenga',
      phone: '+260 97 789 4432',
      address: 'Woodlands Extension, House #42',
      items: '1x Village Chicken & Nshima (Extra Nshima, Chibwabwa)',
      totalZMW: 165,
      status: 'cooking',
      time: '8 mins ago'
    }
  ]);

  const categories = ['All', 'Local Zambian', 'Grills', 'Fast Food', 'Bakery', 'Drinks'];

  const filteredMenuItems = selectedCategory === 'All' 
    ? selectedRestaurant.menu 
    : selectedRestaurant.menu.filter((m) => m.category === selectedCategory);

  const openCustomizationModal = (item: FoodMenuItem) => {
    setCustomizingItem(item);
    setModalSelectedAddons([]);
    setModalInstructions('');
  };

  const toggleModalAddon = (addon: FoodAddonOption) => {
    setModalSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addon.id);
      if (exists) {
        return prev.filter((a) => a.addonId !== addon.id);
      }
      return [...prev, { addonId: addon.id, name: addon.name, priceZMW: addon.priceZMW }];
    });
  };

  const handleAddCustomizedItemToCart = () => {
    if (!customizingItem) return;
    setCart((prev) => [
      ...prev,
      {
        item: customizingItem,
        quantity: 1,
        selectedAddons: modalSelectedAddons,
        specialInstructions: modalInstructions
      }
    ]);
    setCustomizingItem(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => 
      prev
        .map((c, i) => i === index ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const cartSubtotalZMW = cart.reduce((sum, c) => {
    const addonsTotal = c.selectedAddons?.reduce((aSum, a) => aSum + a.priceZMW, 0) || 0;
    return sum + ((c.item.priceZMW + addonsTotal) * c.quantity);
  }, 0);

  const totalZMW = cartSubtotalZMW > 0 ? cartSubtotalZMW + selectedRestaurant.deliveryFeeZMW : 0;
  const isMinOrderMet = cartSubtotalZMW >= selectedRestaurant.minOrderZMW;

  const handlePlaceOrder = () => {
    if (!isMinOrderMet) {
      alert(`Minimum order for ${selectedRestaurant.name} is ZMW ${selectedRestaurant.minOrderZMW}.`);
      return;
    }

    const validation = validateFoodOrderCalculation(
      cart.map(c => ({
        priceZMW: c.item.priceZMW,
        quantity: c.quantity,
        addonsTotalZMW: c.selectedAddons?.reduce((s, a) => s + a.priceZMW, 0) || 0
      })),
      selectedRestaurant.deliveryFeeZMW,
      totalZMW
    );

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setOrderStage('placed');
    setTimeout(() => setOrderStage('kitchen_cooking'), 1800);
    setTimeout(() => setOrderStage('courier_on_way'), 3800);
  };

  const isVendorView = currentRole === 'food_vendor';

  return (
    <div className="mride-service-view mride-food space-y-4">
      {/* Food Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0F1E36] text-[#FF7A00]">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold font-display text-slate-900">
              {isVendorView ? 'Restaurant Kitchen Dashboard' : 'Mride Food'}
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {isVendorView ? 'Live Kitchen Orders' : 'Authentic Zambian Cuisine'}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            {isVendorView
              ? 'Receive customer meal orders, track prep times, and dispatch meals with Mride Boda couriers.'
              : 'Fresh Village Chicken, Kariba Bream, sizzling T-bones, and quick bites delivered across Lusaka.'}
          </p>
        </div>

        {!isVendorView && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MOCK_FOOD_RESTAURANTS.map((res) => (
              <button
                key={res.id}
                onClick={() => {
                  setSelectedRestaurant(res);
                  setSelectedCategory('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRestaurant.id === res.id 
                    ? 'bg-[#0F1E36] text-[#FF7A00]' 
                    : 'bg-[#F1F5F2] hover:bg-slate-200 text-slate-700'
                }`}
              >
                {res.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VENDOR KITCHEN VIEW */}
      {isVendorView ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Incoming Kitchen Tickets</h3>
              <p className="text-xs text-slate-500">Live order queue for {selectedRestaurant.name}</p>
            </div>
            <span className="bg-[#FF7A00] text-[#0F1E36] text-xs font-bold px-2.5 py-1 rounded-full">
              {vendorOrders.length} In Prep
            </span>
          </div>

          <div className="space-y-4">
            {vendorOrders.map((ord) => (
              <div key={ord.id} className="p-5 rounded-2xl bg-[#F1F5F2] border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Ticket #{ord.id}</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Cooking in Kitchen
                      </span>
                      <span className="text-xs text-slate-400">({ord.time})</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      Customer: {ord.customer} ({ord.phone})
                    </p>
                    <p className="text-xs text-slate-600">
                      Deliver to: {ord.address}
                    </p>
                    <p className="text-xs font-bold text-[#0F1E36] bg-white p-2 rounded-xl mt-2 border border-slate-200">
                      {ord.items}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Total Ticket</span>
                    <span className="text-xl font-extrabold text-[#0F1E36]">ZMW {ord.totalZMW}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      alert(`Mride Boda Courier dispatched to pick up order ${ord.id}!`);
                    }}
                    className="bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Bike className="w-4 h-4" />
                    Mark Ready & Summon Mride Courier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CUSTOMER FOOD ORDERING VIEW */
        <>
          {/* Selected Restaurant Showcase Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[140px] flex items-end p-4 shadow-sm">
            <img 
              src={selectedRestaurant.imageUrl} 
              alt={selectedRestaurant.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="relative z-10 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">{selectedRestaurant.name}</h2>
                <span className="bg-[#FF7A00] text-[#0F1E36] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Verified Lusaka Partner
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">{selectedRestaurant.tagline}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1 text-[#FF7A00] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#FF7A00]" />
                  {selectedRestaurant.rating} ({selectedRestaurant.reviewCount} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedRestaurant.deliveryTimeMins}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {selectedRestaurant.area}
                </span>
                <span>•</span>
                <span className="font-semibold text-white">
                  Min Order: ZMW {selectedRestaurant.minOrderZMW}
                </span>
              </div>
            </div>
          </div>

          <div className="mride-food-layout">
            {/* Left Column: Menu Items */}
            <div className="mride-food-menu space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[#0F1E36] text-[#FF7A00] shadow-sm' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu items grid */}
              <div className="mride-food-items">
                {filteredMenuItems.map((item) => (
                  <article 
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex gap-3"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        {item.isPopular && (
                          <span className="absolute left-1 top-1 rounded bg-[#FF7A00] px-1 py-0.5 text-[8px] font-bold text-white">
                            Lusaka Favorite
                          </span>
                        )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-[#0F1E36]">ZMW {item.priceZMW}</span>
                      <button
                        onClick={() => openCustomizationModal(item)}
                        className="flex min-h-9 items-center gap-1 rounded-lg bg-[#FF7900] px-2.5 py-1.5 text-[10px] font-bold text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Order Basket */}
            <div className="mride-food-basket">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#0F1E36]" />
                    <h3 className="font-bold text-slate-900">Your Food Basket</h3>
                  </div>
                  <span className="bg-[#FF7A00] text-[#0F1E36] text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((s, c) => s + c.quantity, 0)} items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs">Your basket is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cart.map((cartItem, idx) => {
                        const itemAddonsPrice = cartItem.selectedAddons?.reduce((s, a) => s + a.priceZMW, 0) || 0;
                        const itemLineTotal = (cartItem.item.priceZMW + itemAddonsPrice) * cartItem.quantity;
                        return (
                          <div key={idx} className="text-xs bg-[#F1F5F2] p-3 rounded-2xl space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-bold text-slate-900">{cartItem.item.name}</p>
                                <p className="text-slate-600 font-bold">ZMW {itemLineTotal}</p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => updateQuantity(idx, -1)}
                                  className="w-6 h-6 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-xs px-1">{cartItem.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(idx, 1)}
                                  className="w-6 h-6 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
                              <div className="text-[11px] text-orange-800 space-y-0.5 pt-1 border-t border-slate-200">
                                {cartItem.selectedAddons.map((ad) => (
                                  <p key={ad.addonId}>+ {ad.name} (ZMW {ad.priceZMW})</p>
                                ))}
                              </div>
                            )}

                            {cartItem.specialInstructions && (
                              <p className="text-[10px] text-slate-500 italic">
                                Note: "{cartItem.specialInstructions}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery Address & Payment Method */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Lusaka Delivery Location</label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Payment Selection</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
                        >
                          <option value="Cash on Delivery">Cash on Delivery</option>
                          <option value="MTN MoMo (Staged)">MTN MoMo (Staging Ready)</option>
                          <option value="Airtel Money (Staged)">Airtel Money (Staging Ready)</option>
                        </select>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-slate-800">ZMW {cartSubtotalZMW}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee</span>
                        <span className="font-bold text-slate-800">ZMW {selectedRestaurant.deliveryFeeZMW}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-[#0F1E36] pt-2 border-t border-slate-100">
                        <span>Total Due</span>
                        <span>ZMW {totalZMW}</span>
                      </div>
                    </div>

                    {/* Order progress tracking or action button */}
                    {orderStage === 'idle' ? (
                      <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        Place Food Order (ZMW {totalZMW})
                      </button>
                    ) : (
                      <div className="bg-[#0F1E36] text-white p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-orange-800">
                          <span className="font-bold text-xs text-[#FF7A00]">ORDER STATUS TRACKER</span>
                          <span className="text-[10px] bg-[#FF7A00] text-[#0F1E36] font-bold px-2 py-0.5 rounded-full uppercase">
                            {orderStage.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-200">
                            <ChefHat className={`w-4 h-4 ${orderStage !== 'placed' ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
                            <span>Kitchen cooking meals with extra gravy</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-200">
                            <Bike className={`w-4 h-4 ${orderStage === 'courier_on_way' ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
                            <span>Mride Courier picking up insulated bag</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setOrderStage('idle')}
                          className="w-full bg-orange-950/60 hover:bg-orange-950 text-slate-300 py-1.5 rounded-xl text-xs font-semibold"
                        >
                          Reset Tracker
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">{customizingItem.name}</h3>
                <p className="text-xs text-[#0F1E36] font-bold mt-0.5">Base Price: ZMW {customizingItem.priceZMW}</p>
              </div>
              <button 
                onClick={() => setCustomizingItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Addons List */}
            {customizingItem.availableAddons && customizingItem.availableAddons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Delicious Add-ons & Extra Relish:
                </label>
                <div className="space-y-1.5">
                  {customizingItem.availableAddons.map((addon) => {
                    const isSelected = modalSelectedAddons.some((a) => a.addonId === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleModalAddon(addon)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-orange-50 border-[#0F1E36] text-[#0F1E36] font-bold' 
                            : 'bg-[#F1F5F2] border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{addon.name}</span>
                        <span className="font-extrabold">+ZMW {addon.priceZMW}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Kitchen Instructions:
              </label>
              <textarea
                rows={2}
                value={modalInstructions}
                onChange={(e) => setModalInstructions(e.target.value)}
                placeholder="e.g. Separate chili in small container, mild spice..."
                className="w-full bg-[#F1F5F2] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            <button
              onClick={handleAddCustomizedItemToCart}
              className="w-full bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md"
            >
              Add to Basket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
