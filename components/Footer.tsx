"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  PhoneCall,
  Clock,
  Truck,
  ShieldCheck,
  Smartphone,
  CreditCard,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t-4 border-emerald-600 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight">
                  سوبر ماركت أولاد الشافعي
                </span>
                <span className="bg-[#e60000] text-white text-[9px] font-black px-1.5 py-0.5 rounded mr-1.5">
                  ماركت
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              سوبر ماركت أولاد الشافعي في خدمتكم من فرعنا بالحي السادس - 6 أكتوبر. تشكيلة فاخرة من الأجبان والألبان الطازجة، اللحوم والمصنعات، الخضروات والفواكه، والبقالة والمؤن بأفضل جودة وأسعار الجملة.
            </p>
            <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5 pt-1">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>الشافعي ناو ⚡ توصيل سوبر سريع لكافة أحياء 6 أكتوبر</span>
            </div>
          </div>

          {/* Col 2: Branch & Contact */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>بيانات الفرع والتواصل</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>العنوان:</strong> الحي السادس — مدينة السادس من أكتوبر — الجيزة.
              </p>
              <p>
                <strong>ساعات العمل:</strong> يومياً من 8 صباحاً حتى 2 بعد منتصف الليل.
              </p>
              <p className="flex items-center gap-1 text-emerald-400 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>الخط الساخن: 01032104457</span>
              </p>
              <p className="text-[11px] text-slate-400">
                هاتف إضافي / واتساب: 0111871017
              </p>
            </div>
          </div>

          {/* Col 3: Delivery Zones */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>مناطق التوصيل في 6 أكتوبر</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li>• الحي السادس والمنطقة المحيطة (~25 دقيقة)</li>
              <li>• ميدان الحصري والمحور المركزي (~30 دقيقة)</li>
              <li>• الأحياء السكنية (الأول إلى الخامس) (~35 دقيقة)</li>
              <li>• الأحياء السكنية (السابع إلى الثاني عشر) (~35 دقيقة)</li>
              <li>• المحور الكفراوي والمنطقة الصناعية (~40 دقيقة)</li>
              <li>• أكتوبر الجديدة والتوسعات الشمالية (~45 دقيقة)</li>
              <li>• الشيخ زايد وحدائق الأهرام (~50 دقيقة)</li>
            </ul>
          </div>

          {/* Col 4: Quick Links & Staff */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>روابط المنظومة</span>
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-300 font-medium">
              <Link href="/track" className="hover:text-emerald-400 transition-colors">
                🛵 تتبع خط سير الطيار لحظياً
              </Link>
              <Link href="/card" className="hover:text-emerald-400 transition-colors">
                🪪 كارت أولاد الشافعي الذكي ورموز QR
              </Link>
              <Link href="/delivery" className="hover:text-emerald-400 transition-colors">
                🏍️ بوابة طياري الدليفري
              </Link>
              <Link href="/cashier" className="hover:text-emerald-400 transition-colors">
                🖥️ شاشة كاشير ونقطة البيع (POS)
              </Link>
              <Link href="/scale" className="hover:text-emerald-400 transition-colors">
                ⚖️ محطة الميزان وطباعة الباركود
              </Link>
              <Link href="/login" className="hover:text-amber-300 transition-colors text-amber-300 font-bold">
                🔒 بوابة دخول الإدارة والموظفين
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Orca Developer Watermark */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} سوبر ماركت أولاد الشافعي — الحي السادس، 6 أكتوبر. جميع الحقوق محفوظة.
          </div>
          <div className="text-center font-bold text-slate-300 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
            تم التطوير بواسطة شركة أوركا لتقنية المعلومات — 01018671000
          </div>
          <div className="flex items-center gap-3">
            <span>طرق الدفع: كاش • فيزا مع الطيار • إنستاباي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
