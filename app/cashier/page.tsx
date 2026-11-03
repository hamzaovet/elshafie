"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  DollarSign,
  User,
  Barcode,
  CheckCircle2,
  Scale,
  RefreshCw,
  X,
  FileText,
  Calculator,
  ArrowRight,
  Coins,
  Camera,
  Share2,
  Zap,
  Phone,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import BarcodeEan13 from "@/components/BarcodeEan13";
import { parseScaleBarcode } from "@/lib/barcode";
import CameraBarcodeScanner from "@/components/CameraBarcodeScanner";

export default function CashierPOSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState("الكل");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [tenderCash, setTenderCash] = useState<string>("");
  const [lastScannedMsg, setLastScannedMsg] = useState<string>("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Mobile Views: "products" | "cart"
  const [mobileView, setMobileView] = useState<"products" | "cart">("products");

  // Camera Barcode Scanner State
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  // Weight & Open-Amount Modal State (البيع بالمبلغ المالي أو الوزن المباشر)
  const [weighModalOpen, setWeighModalOpen] = useState(false);
  const [selectedWeighProduct, setSelectedWeighProduct] = useState<any | null>(null);
  const [weighMode, setWeighMode] = useState<"amount" | "weight">("amount");
  const [inputAmount, setInputAmount] = useState<string>("50");
  const [inputGrams, setInputGrams] = useState<string>("250");
  const [weighSearch, setWeighSearch] = useState<string>("");

  // Load User, Products, Categories, Settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("elshafie_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}

    const fetchData = async () => {
      try {
        const [pRes, cRes, sRes] = await Promise.all([
          fetch("/api/products?all=true"),
          fetch("/api/categories"),
          fetch("/api/settings"),
        ]);
        const [pData, cData, sData] = await Promise.all([
          pRes.json(),
          cRes.json(),
          sRes.json(),
        ]);
        if (pData.success) setProducts(pData.products);
        if (cData.success) setCategories(cData.categories);
        if (sData.success) setSettings(sData.settings);
      } catch (err) {
        console.error("POS Data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // Keyboard Shortcuts (F4 for Weight Modal, F9 / Enter / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        openGenericWeighModal();
      }
      if (e.key === "F2") {
        e.preventDefault();
        setCameraScannerOpen((prev) => !prev);
      }
      if (completedOrder) {
        if (e.key === "Enter" || e.key === "F9") {
          e.preventDefault();
          window.print();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleFinishAndNewOrder();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completedOrder, products]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(1050, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}
  };

  const addToCart = (product: any, customQty?: number, customNote?: string) => {
    const qtyToAdd = customQty !== undefined ? customQty : 1;
    setCart((prev) => {
      const existIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existIndex > -1) {
        const updated = [...prev];
        const existing = updated[existIndex];
        const newQty = Number((existing.qty + qtyToAdd).toFixed(3));
        updated[existIndex] = {
          ...existing,
          qty: newQty,
          note: customNote || existing.note,
        };
        return updated;
      }
      return [...prev, { product, qty: qtyToAdd, note: customNote }];
    });
    playBeep();
  };

  const handleProductClick = (product: any) => {
    if (product.isWeighted) {
      setSelectedWeighProduct(product);
      setWeighMode("amount");
      setInputAmount("50");
      setInputGrams("250");
      setWeighModalOpen(true);
    } else {
      addToCart(product, 1);
      setLastScannedMsg(`📦 تم إضافة: ${product.nameAr}`);
    }
  };

  const openGenericWeighModal = () => {
    const firstWeighted = products.find((p) => p.isWeighted) || null;
    setSelectedWeighProduct(firstWeighted);
    setWeighMode("amount");
    setInputAmount("50");
    setInputGrams("250");
    setWeighSearch("");
    setWeighModalOpen(true);
  };

  const confirmWeighItem = () => {
    if (!selectedWeighProduct) return;
    const basePrice = selectedWeighProduct.basePrice || 1;
    let qtyInKg = 0;
    let note = "";

    if (weighMode === "amount") {
      const amt = parseFloat(inputAmount) || 0;
      if (amt <= 0) return;
      qtyInKg = Number((amt / basePrice).toFixed(3));
      const grams = Math.round(qtyInKg * 1000);
      note = `بمبلغ ${amt} ج.م (${grams} جم تقريباً)`;
    } else {
      const g = parseFloat(inputGrams) || 0;
      if (g <= 0) return;
      qtyInKg = Number((g / 1000).toFixed(3));
      const totalCost = (qtyInKg * basePrice).toFixed(2);
      note = `وزن ${g} جم (${totalCost} ج.م)`;
    }

    addToCart(selectedWeighProduct, qtyInKg, note);
    setWeighModalOpen(false);
    setSelectedWeighProduct(null);
    setLastScannedMsg(`⚖️ تم إضافة بالوزن/المبلغ: ${selectedWeighProduct.nameAr} (${note})`);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const isWeighted = i.product.isWeighted;
            const step = isWeighted ? 0.05 : 1;
            const newQty = Number((i.qty + delta * step).toFixed(3));
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as any[]
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Universal Barcode Processor (Works with USB Scanners, Manual Input, and Phone Camera)
  const processBarcode = (rawCode: string): boolean => {
    const query = rawCode.trim();
    if (!query) return false;

    // 1. Check if it's an EAN-13 digital scale barcode (20xxxxx or 22xxxxx)
    const scaleResult = parseScaleBarcode(query, {
      weightPrefixes: settings?.weightPrefixes || "20,21",
      pricePrefixes: settings?.pricePrefixes || "22,23",
      pluDigits: settings?.pluDigits || 5,
    });

    if (scaleResult.isScaleBarcode && scaleResult.plu) {
      const foundWeighted = products.find(
        (p) =>
          p.scaleItemCode === scaleResult.plu ||
          p.barcode === scaleResult.plu ||
          p.id === scaleResult.plu
      );

      if (foundWeighted) {
        if (scaleResult.mode === "weight" && scaleResult.weightKg) {
          addToCart(foundWeighted, scaleResult.weightKg, `ميزان باركود (${scaleResult.weightKg} كجم)`);
          setLastScannedMsg(`⚖️ استيكر ميزان: ${foundWeighted.nameAr} (${scaleResult.weightKg} كجم)`);
        } else if (scaleResult.mode === "price" && scaleResult.embeddedPrice) {
          const calculatedKg = Number(
            (scaleResult.embeddedPrice / foundWeighted.basePrice).toFixed(3)
          );
          addToCart(foundWeighted, calculatedKg, `ميزان باركود (${scaleResult.embeddedPrice} ج.م)`);
          setLastScannedMsg(`⚖️ استيكر ميزان: ${foundWeighted.nameAr} (${scaleResult.embeddedPrice} ج.م)`);
        }
        setBarcodeQuery("");
        return true;
      }
    }

    // 2. Standard Barcode or PLU or Name search
    const found = products.find(
      (p) =>
        p.barcode === query ||
        p.nameAr.toLowerCase().includes(query.toLowerCase()) ||
        p.scaleItemCode === query
    );

    if (found) {
      if (found.isWeighted) {
        handleProductClick(found);
      } else {
        addToCart(found, 1);
        setLastScannedMsg(`📦 تم إضافة: ${found.nameAr}`);
      }
      setBarcodeQuery("");
      return true;
    }

    return false;
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = processBarcode(barcodeQuery);
    if (!success && barcodeQuery.trim()) {
      alert(`لم يتم العثور على صنف بالباركود أو الاسم: ${barcodeQuery}`);
    }
  };

  // Camera Barcode Scan Callback
  const handleCameraBarcodeScanned = (barcode: string) => {
    const success = processBarcode(barcode);
    if (!success) {
      setLastScannedMsg(`⚠️ باركود غير مسجل: ${barcode}`);
    }
  };

  const subtotal = Number(
    cart.reduce((acc, i) => acc + i.product.basePrice * i.qty, 0).toFixed(2)
  );
  const totalItemCount = cart.reduce((acc, i) => acc + (i.product.isWeighted ? 1 : i.qty), 0);

  // Fast Checkout Action
  const handleCheckout = async (paymentMethod: "cash" | "card") => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      const itemsPayload = cart.map((i) => ({
        productId: i.product.id,
        nameAr: i.product.nameAr,
        unit: i.product.unit,
        qty: i.qty,
        unitPrice: i.product.basePrice,
        note: i.note || null,
        total: Number((i.product.basePrice * i.qty).toFixed(2)),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "عميل الفرع (كاشير)",
          phone: "01032104457",
          address: "شراء مباشر من فرع الحي السادس",
          zone: "فرع السادس من أكتوبر",
          branchName: "فرع السادس من أكتوبر (الحي السادس)",
          orderType: "pos",
          items: itemsPayload,
          subtotal,
          deliveryFee: 0,
          discount: 0,
          total: subtotal,
          paymentMethod,
          cashierName: user?.name || "كاشير 1",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompletedOrder({
          ...data.order,
          parsedItems: itemsPayload,
          cashierName: user?.name || "كاشير 1",
        });
        setCart([]);
        setTenderCash(String(Math.ceil(subtotal)));
        setMobileView("cart"); // Stay on receipt screen
      } else {
        alert("فشل إصدار الفاتورة: " + data.error);
      }
    } catch (err: any) {
      alert("خطأ أثناء إصدار الفاتورة: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Immediate Reset for Next Customer (Zero Printing Required)
  const handleFinishAndNewOrder = () => {
    setCompletedOrder(null);
    setTenderCash("");
    setCart([]);
    setMobileView("products");
    setLastScannedMsg("جاهز لاستقبال الزبون التالي 🛒");
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
  };

  // WhatsApp Digital Receipt
  const sendWhatsAppReceipt = (order: any) => {
    const phone = prompt("أدخل رقم واتساب العميل لإرسال الفاتورة (مثال: 01018671000):") || "";
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return;

    const phoneWithCountry = cleanPhone.startsWith("20")
      ? cleanPhone
      : cleanPhone.startsWith("0")
      ? "2" + cleanPhone
      : "20" + cleanPhone;

    let itemsText = "";
    (order.parsedItems || []).forEach((it: any, idx: number) => {
      itemsText += `\n${idx + 1}. *${it.nameAr}* (${it.qty} ${it.unit || "قطعة"})${
        it.note ? ` [${it.note}]` : ""
      } — ${it.total.toFixed(2)} ج.م`;
    });

    const msg = `*سوبر ماركت أولاد الشافعي* 🛒
📍 الحي السادس — مدينة السادس من أكتوبر — الجيزة
📞 01032104457 — 0111871017

━━━━━━━━━━━━━━━━━━━
🧾 *فاتورة إلكترونية معتمدة*
📄 *رقم الفاتورة:* ${order.orderNumber}
📅 *التاريخ:* ${new Date().toLocaleString("ar-EG")}
💳 *طريقة الدفع:* ${order.paymentMethod === "cash" ? "نقداً (كاش)" : "بطاقة بنكية (فيزا)"}
━━━━━━━━━━━━━━━━━━━
*بيان المشتريات:*
${itemsText}

━━━━━━━━━━━━━━━━━━━
💰 *الإجمالي النهائي المستحق:* *${order.total.toFixed(2)} ج.م*
━━━━━━━━━━━━━━━━━━━

✨ شكراً لتسوقكم من سوبر ماركت أولاد الشافعي!
البضاعة ترد وتستبدل خلال 14 يوماً بموجب هذه الفاتورة.

تم التطوير بواسطة شركة أوركا لتقنية المعلومات — 01018671000`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== "الكل" && p.category !== selectedCat) return false;
    return true;
  });

  const parsedTender = parseFloat(tenderCash) || completedOrder?.total || 0;
  const changeAmount = Math.max(0, parsedTender - (completedOrder?.total || 0));

  return (
    <div className="h-screen max-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col overflow-hidden font-sans select-none">
      {/* Cashier Topbar */}
      <header className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md shrink-0 border-b border-emerald-600/40">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-black text-xs sm:text-sm">سوبر ماركت أولاد الشافعي</span>
          </Link>
          <span className="hidden sm:inline-block text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            كاشير 6 أكتوبر (الحي السادس) 🛒
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* CAMERA SCANNER BUTTON (TOP BAR) */}
          <button
            onClick={() => setCameraScannerOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 animate-pulse"
            title="فتح كاميرا الموبايل لمسح الباركود مباشرة (F2)"
          >
            <Camera className="w-4 h-4" />
            <span>سكان بالكاميرا 📱</span>
          </button>

          {/* F4 Weight Button */}
          <button
            onClick={openGenericWeighModal}
            className="px-2.5 sm:px-3 py-1.5 bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 rounded-lg text-amber-200 font-bold flex items-center gap-1 transition-colors"
            title="بيع أصناف الجبن واللحوم بالوزن أو بالمبلغ المفتوح (F4)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">وزن/مبلغ</span>
            <span>(F4)</span>
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:inline-block px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold"
          >
            الإدارة
          </Link>

          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg text-emerald-200 text-xs">
            <User className="w-3.5 h-3.5" />
            <span className="font-bold">{user ? user.name : "كاشير 1"}</span>
          </div>
        </div>
      </header>

      {/* Mobile Mode Switcher Bar (Only on small screens) */}
      <div className="md:hidden bg-slate-800 text-white p-1.5 flex gap-1 border-b border-slate-700 shrink-0">
        <button
          onClick={() => setMobileView("products")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileView === "products" ? "bg-emerald-600 text-white shadow" : "text-slate-300"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>الكتالوج والأصناف</span>
        </button>
        <button
          onClick={() => setMobileView("cart")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
            mobileView === "cart" ? "bg-emerald-600 text-white shadow" : "text-slate-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>الفاتورة الحالية ({cart.length})</span>
          {cart.length > 0 && (
            <span className="bg-amber-400 text-slate-900 font-black px-1.5 rounded-full text-[10px]">
              {subtotal.toFixed(0)} ج
            </span>
          )}
        </button>
      </div>

      {/* Main Full-Height POS Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Right Section: Products Grid + Barcode Search */}
        <div
          className={`flex-1 flex flex-col p-2.5 sm:p-3 overflow-hidden border-l border-slate-200 ${
            mobileView === "cart" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Barcode Search Bar & Camera Button */}
          <div className="flex gap-2 mb-2 shrink-0">
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                placeholder="امسح الباركود، أو استيكر الميزان، أو اكتب اسم الصنف..."
                className="w-full h-11 pl-4 pr-11 bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-xl outline-none font-bold text-xs sm:text-sm shadow-xs"
                autoFocus
              />
              <Barcode className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
            </form>

            {/* Quick Camera Scan Button */}
            <button
              type="button"
              onClick={() => setCameraScannerOpen(true)}
              className="px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0"
              title="فتح كاميرا الموبايل"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">كاميرا</span>
            </button>

            {/* F4 Button */}
            <button
              onClick={openGenericWeighModal}
              className="px-3 sm:px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-black text-xs shadow-xs flex items-center gap-1 shrink-0"
              title="إدخال صنف وزني أو بمبلغ مالي مفتوح"
            >
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">وزن/مبلغ</span>
              <span>(F4)</span>
            </button>
          </div>

          {/* Quick Notice if Barcode Scanned */}
          {lastScannedMsg && (
            <div className="mb-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-between shrink-0 animate-in fade-in">
              <span className="truncate">{lastScannedMsg}</span>
              <button
                onClick={() => setLastScannedMsg("")}
                className="text-emerald-500 hover:text-emerald-800 mr-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 shrink-0 scrollbar-none">
            <button
              onClick={() => setSelectedCat("الكل")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                selectedCat === "الكل"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              الكل ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.nameAr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-colors ${
                  selectedCat === c.nameAr
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.nameAr}</span>
              </button>
            ))}
          </div>

          {/* Products Grid with its own smooth internal scroll */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 pr-1 pb-16 md:pb-2">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((i) => i.product.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`bg-white rounded-xl p-2.5 border text-right flex flex-col justify-between transition-all active:scale-95 group shadow-xs relative ${
                    inCartItem
                      ? "border-emerald-600 ring-2 ring-emerald-600/20"
                      : "border-slate-200 hover:border-emerald-600"
                  }`}
                >
                  {/* Weighted Badge */}
                  {product.isWeighted && (
                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Scale className="w-2.5 h-2.5" />
                      ميزان/مبلغ
                    </span>
                  )}

                  {/* Quantity In Cart Badge */}
                  {inCartItem && (
                    <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {inCartItem.qty}
                    </span>
                  )}

                  <div className="aspect-square w-full rounded-lg bg-slate-50 p-1.5 flex items-center justify-center mb-1 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.nameAr}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                      {product.nameAr}
                    </h4>
                    <div className="text-[10px] text-slate-400">
                      {product.scaleItemCode ? `PLU: ${product.scaleItemCode} • ${product.unit}` : product.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 w-full">
                    <span className="font-black text-xs text-emerald-800">
                      {product.basePrice.toFixed(2)} ج.م
                    </span>
                    <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Floating Camera Button on Mobile Screen */}
          <div className="md:hidden fixed bottom-4 left-4 z-40">
            <button
              type="button"
              onClick={() => setCameraScannerOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-2xl border-2 border-white active:scale-95 transition-transform"
              title="مسح باركود بالكاميرا"
            >
              <Camera className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Left Section: Active Invoice Cart with PINNED Bottom Checkout */}
        <div
          className={`w-full md:w-96 bg-white flex flex-col justify-between shadow-xl h-full border-r border-slate-200 ${
            mobileView === "products" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Invoice Header */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {/* Back to Products Button on Mobile */}
              <button
                type="button"
                onClick={() => setMobileView("products")}
                className="md:hidden p-1.5 rounded-lg bg-slate-200 text-slate-700"
                title="الرجوع للأصناف"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>فاتورة العميل الحالية</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  عدد الأصناف: {cart.length} | إجمالي الكميات: {totalItemCount}
                </span>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ</span>
              </button>
            )}
          </div>

          {/* Invoice Items List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-xs font-bold">الفاتورة فارغة</p>
                <p className="text-[11px] text-slate-400">
                  امسح الباركود، أو افتح الكاميرا (📱)، أو اختر الأصناف
                </p>
                <button
                  type="button"
                  onClick={() => setCameraScannerOpen(true)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>فتح سكانر الكاميرا الآن</span>
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = Number((item.product.basePrice * item.qty).toFixed(2));
                return (
                  <div
                    key={item.product.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-slate-300 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                          {item.product.isWeighted && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-black">
                              ⚖️
                            </span>
                          )}
                          <span>{item.product.nameAr}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>
                            {item.product.basePrice.toFixed(2)} ج.م/كجم × {item.qty} {item.product.isWeighted ? "كجم" : "قطعة"}
                          </span>
                          {item.note && (
                            <span className="text-amber-800 font-bold bg-amber-50 px-1 rounded">
                              ({item.note})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold active:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black font-mono px-1 min-w-[28px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center font-bold active:bg-emerald-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-left font-black font-mono text-slate-900 w-16 text-xs">
                        {itemTotal.toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PINNED BOTTOM CHECKOUT PANEL */}
          <div className="p-3 bg-slate-50 border-t-2 border-slate-200 space-y-2.5 shrink-0 shadow-lg">
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">الإجمالي النهائي:</span>
              <span className="text-2xl text-emerald-800 font-black font-mono">
                {subtotal.toFixed(2)}{" "}
                <span className="text-xs font-sans text-slate-500">ج.م</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCheckout("cash")}
                disabled={cart.length === 0 || loading}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
              >
                <DollarSign className="w-4 h-4" />
                <span>دفع كاش 💵</span>
              </button>

              <button
                onClick={() => handleCheckout("card")}
                disabled={cart.length === 0 || loading}
                className="py-3.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>دفع فيزا 💳</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA BARCODE SCANNER MODAL */}
      <CameraBarcodeScanner
        isOpen={cameraScannerOpen}
        onClose={() => setCameraScannerOpen(false)}
        onScan={handleCameraBarcodeScanned}
        lastScannedMessage={lastScannedMsg}
        cartCount={cart.length}
      />

      {/* WEIGHT & OPEN AMOUNT SELLING MODAL */}
      {weighModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-2 border-amber-500 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    بيع صنف بالوزن أو بالمبلغ المفتوح ⚖️💰
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    حساب مباشر دون الحاجة لطباعة استيكر باركود
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWeighModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Product */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الصنف المطلوب:
              </label>
              <select
                value={selectedWeighProduct?.id || ""}
                onChange={(e) => {
                  const p = products.find((x) => x.id === e.target.value);
                  setSelectedWeighProduct(p || null);
                }}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-amber-500"
              >
                <option value="">-- اختر من قائمة أصناف الميزان والجبن --</option>
                {products
                  .filter((p) => p.isWeighted)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr} — ({p.basePrice.toFixed(2)} ج.م/كجم)
                    </option>
                  ))}
              </select>
            </div>

            {selectedWeighProduct && (
              <>
                {/* Active Product Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-amber-950">
                      {selectedWeighProduct.nameAr}
                    </h4>
                    <div className="text-xs text-amber-800 font-semibold mt-0.5">
                      سعر الكيلو:{" "}
                      <span className="font-black text-amber-950">
                        {selectedWeighProduct.basePrice.toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>
                  {selectedWeighProduct.image && (
                    <img
                      src={selectedWeighProduct.image}
                      alt={selectedWeighProduct.nameAr}
                      className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-amber-200"
                    />
                  )}
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setWeighMode("amount")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      weighMode === "amount"
                        ? "bg-amber-500 text-slate-900 shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    <span>💰 البيع بالمبلغ المطلوب (ج.م)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeighMode("weight")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      weighMode === "weight"
                        ? "bg-amber-500 text-slate-900 shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    <span>⚖️ البيع بالوزن (جرام / كجم)</span>
                  </button>
                </div>

                {/* Mode 1: Amount */}
                {weighMode === "amount" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المبلغ المطلوب بالجنيه المصري (مثال: بـ 50 جنيه جبنة):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={inputAmount}
                          onChange={(e) => setInputAmount(e.target.value)}
                          className="w-full h-12 pr-4 pl-12 bg-white border-2 border-amber-500 rounded-xl font-black text-lg text-slate-900 outline-none"
                          autoFocus
                        />
                        <span className="absolute left-3 top-3 text-sm font-bold text-slate-400">
                          ج.م
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {["10", "20", "30", "50", "100", "150", "200", "300"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setInputAmount(v)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            inputAmount === v
                              ? "bg-amber-500 text-slate-900 border-amber-600"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {v} ج
                        </button>
                      ))}
                    </div>

                    {/* Calculation Display */}
                    {(() => {
                      const amt = parseFloat(inputAmount) || 0;
                      const calculatedKg = amt / selectedWeighProduct.basePrice;
                      const calculatedGrams = Math.round(calculatedKg * 1000);
                      return (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center space-y-1">
                          <div className="text-xs text-slate-600">
                            الوزن المعادل للمبلغ المطلوب:
                          </div>
                          <div className="text-xl font-black text-emerald-800 font-mono">
                            {calculatedKg.toFixed(3)} كجم ({calculatedGrams} جرام)
                          </div>
                          <div className="text-[11px] text-emerald-700 font-bold">
                            المبلغ المحسوب: {amt.toFixed(2)} ج.م
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Mode 2: Weight */}
                {weighMode === "weight" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الوزن المطلوب بالجرام (مثلاً 250 جرام = ربع كيلو):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          step={10}
                          value={inputGrams}
                          onChange={(e) => setInputGrams(e.target.value)}
                          className="w-full h-12 pr-4 pl-14 bg-white border-2 border-amber-500 rounded-xl font-black text-lg text-slate-900 outline-none"
                          autoFocus
                        />
                        <span className="absolute left-3 top-3 text-sm font-bold text-slate-400">
                          جرام
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "100 جم", val: "100" },
                        { label: "1/8 كجم", val: "125" },
                        { label: "ربع كيلو", val: "250" },
                        { label: "نص كيلو", val: "500" },
                        { label: "3/4 كجم", val: "750" },
                        { label: "1 كجم", val: "1000" },
                        { label: "1.5 كجم", val: "1500" },
                        { label: "2 كجم", val: "2000" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setInputGrams(item.val)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            inputGrams === item.val
                              ? "bg-amber-500 text-slate-900 border-amber-600"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Calculation Display */}
                    {(() => {
                      const g = parseFloat(inputGrams) || 0;
                      const calculatedKg = g / 1000;
                      const calculatedPrice = calculatedKg * selectedWeighProduct.basePrice;
                      return (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center space-y-1">
                          <div className="text-xs text-slate-600">
                            المبلغ المطلوب حسابه:
                          </div>
                          <div className="text-xl font-black text-emerald-800 font-mono">
                            {calculatedPrice.toFixed(2)} ج.م
                          </div>
                          <div className="text-[11px] text-emerald-700 font-bold">
                            الوزن: {calculatedKg.toFixed(3)} كجم ({g} جرام)
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Confirm Add Button */}
                <button
                  type="button"
                  onClick={confirmWeighItem}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة للفاتورة مباشرة (Enter)</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED ORDER & FAST CASHIER CHECKOUT (NO COMPULSORY PRINTING) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 text-center space-y-4 shadow-2xl relative my-auto border-2 border-emerald-500 animate-in zoom-in-95">
            {/* Success Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="font-black text-sm text-slate-900">
                  تمت المحاسبة بنجاح!
                </span>
              </div>
              <button
                onClick={handleFinishAndNewOrder}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="إغلاق وفتح فاتورة جديدة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total and Change Math */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2 text-right">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">المبلغ المطلوب:</span>
                <span className="font-mono font-black text-lg text-slate-900">
                  {completedOrder.total.toFixed(2)} ج.م
                </span>
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 font-bold block">
                  المبلغ المدفوع من الزبون كاش:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    String(Math.ceil(completedOrder.total)),
                    "50",
                    "100",
                    "200",
                    "300",
                    "500",
                    "1000",
                  ].map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTenderCash(v)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold border transition ${
                        tenderCash === v
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {i === 0 ? "بالمضبوط" : `${v} ج`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="أو اكتب المبلغ المدفوع..."
                  value={tenderCash}
                  onChange={(e) => setTenderCash(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-300 rounded-xl px-2.5 font-mono font-black text-xs text-slate-800 text-center outline-none focus:border-emerald-600 mt-1"
                />
              </div>

              {/* Calculated Change */}
              <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-100/70 border border-emerald-300">
                <span className="text-xs font-black text-emerald-950">
                  الباقي للزبون:
                </span>
                <span className="font-mono font-black text-base text-emerald-900">
                  {changeAmount.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            {/* ACTION 1: ZERO PRINTING - FINISH & NEW ORDER (BIGGEST BUTTON) */}
            <button
              onClick={handleFinishAndNewOrder}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>إنهاء ومحاسبة وفتح فاتورة جديدة فوراً (Esc) ⚡</span>
            </button>

            {/* ACTION 2 & 3: WhatsApp Receipt or Print Receipt */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* WhatsApp Digital Receipt */}
              <button
                type="button"
                onClick={() => sendWhatsAppReceipt(completedOrder)}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="إرسال الفاتورة عبر واتساب للزبون"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>إرسال واتساب للزبون</span>
              </button>

              {/* Thermal Print (Optional for when printer is available) */}
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="طباعة إيصال ورقي حراري"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة ورقية (F9)</span>
              </button>
            </div>

            {/* REALISTIC 80mm THERMAL RECEIPT PREVIEW (Hidden in compact mobile view, visible in print) */}
            <div
              id="thermal-receipt"
              className="hidden print:block bg-white text-black p-4 rounded border border-slate-300 font-mono text-xs text-right select-text"
              dir="rtl"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-0.5 border-b-2 border-dashed border-black pb-2 mb-2">
                <h2 className="font-black text-base text-black">سوبر ماركت أولاد الشافعي</h2>
                <div className="text-[10px] font-bold">AWLAD ELSHAFIE SUPERMARKET</div>
                <div className="text-[9px] text-slate-700 leading-tight">
                  الحي السادس — مدينة السادس من أكتوبر — الجيزة
                </div>
                <div className="text-[9px]">الخط الساخن: 01032104457 | هاتف: 0111871017</div>
                <div className="text-[9px] font-bold">ر.ض: 729-418-932 • س.ت: 185340</div>
                <div className="text-[10px] font-black mt-1">
                  *** فاتورة كاشير ضريبية مبسطة ***
                </div>
              </div>

              {/* Receipt Metadata */}
              <div className="text-[10px] space-y-0.5 border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ والوقت:</span>
                  <span>{new Date().toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex justify-between">
                  <span>الكاشير:</span>
                  <span>{completedOrder.cashierName || user?.name || "كاشير 1"}</span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-bold">
                    {completedOrder.paymentMethod === "cash" ? "نقداً (كاش)" : "بطاقة بنكية (فيزا)"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-[10px] mb-2 border-b-2 border-dashed border-black pb-2">
                <thead>
                  <tr className="border-b border-black text-[9px]">
                    <th className="text-right py-1">الصنف</th>
                    <th className="text-center py-1">الكمية</th>
                    <th className="text-center py-1">السعر</th>
                    <th className="text-left py-1">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(completedOrder.parsedItems || []).map((it: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-1 font-bold">
                        <div>{it.nameAr}</div>
                        {it.note && <div className="text-[8px] text-slate-600 font-normal">{it.note}</div>}
                      </td>
                      <td className="text-center py-1 font-mono">{it.qty}</td>
                      <td className="text-center py-1 font-mono">{it.unitPrice.toFixed(2)}</td>
                      <td className="text-left py-1 font-mono font-bold">{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Receipt Financial Totals */}
              <div className="space-y-1 text-xs border-b-2 border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between">
                  <span>الإجمالي الفرعي:</span>
                  <span className="font-bold font-mono">
                    {completedOrder.subtotal.toFixed(2)} ج.م
                  </span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span className="font-bold font-mono">
                      -{completedOrder.discount.toFixed(2)} ج.م
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                  <span>الصافي النهائي:</span>
                  <span className="font-mono">{completedOrder.total.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700">
                  <span>المبلغ المسدد:</span>
                  <span className="font-mono">{parsedTender.toFixed(2)} ج.م</span>
                </div>
                {changeAmount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-emerald-800">
                    <span>الباقي للعميل:</span>
                    <span className="font-mono">{changeAmount.toFixed(2)} ج.م</span>
                  </div>
                )}
              </div>

              {/* Return Policy & Notice */}
              <div className="text-center text-[9px] text-slate-800 space-y-1 mb-2 leading-tight">
                <div>الأسعار شاملة ضريبة القيمة المضافة 14%</div>
                <div>
                  البضاعة المباعة ترد وتستبدل خلال 14 يوماً بأصل الفاتورة وبحالتها الأصلية مع مراعاة المواد الغذائية الطازجة.
                </div>
                <div className="font-bold mt-1">شكراً لزيارتكم سوبر ماركت أولاد الشافعي 🛒</div>
              </div>

              {/* Invoice Verification Barcode & Watermark */}
              <div className="flex flex-col items-center pt-2 border-t border-dashed border-black space-y-1">
                <div className="font-mono text-[9px] font-bold tracking-widest">
                  {completedOrder.orderNumber}
                </div>
                <div className="text-[8px] font-bold text-slate-700">
                  تم التطوير بواسطة شركة أوركا لتقنية المعلومات — 01018671000
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Clean 80mm Thermal Receipt Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt,
          #thermal-receipt * {
            visibility: visible !important;
          }
          #thermal-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border-radius: 0 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
}
