require('dotenv').config();
const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_g8AWivGwJnC4@ep-wild-butterfly-b950p3m7-pooler.c-7.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  console.log('⚡ Starting Awlad Elshafie Supermarket Database Seeding...');
  const client = await pool.connect();

  try {
    // 1. Seed System Settings
    await client.query(`
      INSERT INTO "SystemSettings" (
        "id", "storeName", "tagline", "mainBranch", "phone", "hotlines", "whatsapp",
        "address", "freeDeliveryThreshold", "expressDeliveryEnabled", "expressMinutes",
        "isLockedDown", "bannerNotice", "updatedAt"
      ) VALUES (
        'default',
        'سوبر ماركت أولاد الشافعي',
        'سوبر ماركت أولاد الشافعي — كل احتياجات بيتك بأفضل جودة وأنسب سعر',
        'فرع 6 أكتوبر (الحي السادس)',
        '01032104457',
        '01032104457 | 0111871017',
        '01032104457',
        'الحي السادس — السادس من أكتوبر — الجيزة',
        300,
        true,
        45,
        false,
        '⚡ التوصيل السريع لجميع مناطق 6 أكتوبر والشيخ زايد وأكتوبر الجديدة شغال الآن — خدمة التوصيل متوفرة يومياً بأسرع وقت 🛵',
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "storeName" = EXCLUDED."storeName",
        "tagline" = EXCLUDED."tagline",
        "mainBranch" = EXCLUDED."mainBranch",
        "phone" = EXCLUDED."phone",
        "hotlines" = EXCLUDED."hotlines",
        "whatsapp" = EXCLUDED."whatsapp",
        "address" = EXCLUDED."address",
        "bannerNotice" = EXCLUDED."bannerNotice",
        "updatedAt" = NOW();
    `);
    console.log('✅ SystemSettings seeded.');

    // 2. Seed Default Branch
    await client.query(`
      INSERT INTO "Branch" ("id", "code", "name", "address", "phone", "isOpen", "deliveryActive", "createdAt")
      VALUES 
        ('b_october6', 'OCTOBER6', 'فرع السادس من أكتوبر (الحي السادس)', 'الحي السادس — السادس من أكتوبر — الجيزة', '01032104457', true, true, NOW())
      ON CONFLICT ("code") DO UPDATE SET
        "name" = EXCLUDED."name",
        "address" = EXCLUDED."address",
        "phone" = EXCLUDED."phone";
    `);
    console.log('✅ Branch seeded.');

    // 3. Seed Users with exact specified credentials
    const users = [
      {
        id: 'u_owner',
        name: 'المايسترو (مالك سوبر ماركت أولاد الشافعي)',
        username: 'maestro',
        phone: '01032104457',
        passwordHash: '123456789',
        pin: '157230',
        role: 'owner',
        branch: 'فرع السادس من أكتوبر'
      },
      {
        id: 'u_manager',
        name: 'مدير عام التشغيل والمبيعات',
        username: 'manager',
        phone: '0111871017',
        passwordHash: '123456789',
        pin: '445566',
        role: 'manager',
        branch: 'فرع السادس من أكتوبر'
      },
      {
        id: 'u_cashier1',
        name: 'كاشير 1 (نقطة البيع الرئيسية)',
        username: 'cashier1',
        phone: '01032104458',
        passwordHash: '123456789',
        pin: '112233',
        role: 'cashier',
        branch: 'فرع السادس من أكتوبر'
      },
      {
        id: 'u_captain1',
        name: 'كابتن أحمد (دليفري أولاد الشافعي)',
        username: 'captain1',
        phone: '01032104459',
        passwordHash: '123456789',
        pin: '998877',
        role: 'delivery',
        branch: 'فرع السادس من أكتوبر'
      }
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO "User" ("id", "name", "username", "phone", "passwordHash", "pin", "role", "branch", "isActive", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
        ON CONFLICT ("phone") DO UPDATE SET
          "name" = EXCLUDED."name",
          "username" = EXCLUDED."username",
          "passwordHash" = EXCLUDED."passwordHash",
          "pin" = EXCLUDED."pin",
          "role" = EXCLUDED."role",
          "branch" = EXCLUDED."branch";
      `, [u.id, u.name, u.username, u.phone, u.passwordHash, u.pin, u.role, u.branch]);
    }
    console.log('✅ Users seeded.');

    // 4. Seed Delivery Zones (6th of October City)
    const zones = [
      { id: 'z1', nameAr: 'الحي السادس (المنطقة المحيطة)', fee: 15, timeMinutes: 25, minOrder: 80 },
      { id: 'z2', nameAr: 'ميدان الحصري والمحور المركزي', fee: 20, timeMinutes: 30, minOrder: 100 },
      { id: 'z3', nameAr: 'الأحياء (الأول إلى الخامس)', fee: 20, timeMinutes: 35, minOrder: 100 },
      { id: 'z4', nameAr: 'الأحياء (السابع إلى الثاني عشر)', fee: 25, timeMinutes: 35, minOrder: 120 },
      { id: 'z5', nameAr: 'المحور الكفراوي والمنطقة الصناعية', fee: 25, timeMinutes: 40, minOrder: 150 },
      { id: 'z6', nameAr: 'أكتوبر الجديدة والتوسعات الشمالية', fee: 35, timeMinutes: 45, minOrder: 150 },
      { id: 'z7', nameAr: 'الشيخ زايد وحدائق الأهرام', fee: 40, timeMinutes: 50, minOrder: 200 },
    ];

    for (const z of zones) {
      await client.query(`
        INSERT INTO "DeliveryZone" ("id", "nameAr", "fee", "timeMinutes", "minOrder", "isActive", "createdAt")
        VALUES ($1, $2, $3, $4, $5, true, NOW())
        ON CONFLICT ("nameAr") DO UPDATE SET
          "fee" = EXCLUDED."fee",
          "timeMinutes" = EXCLUDED."timeMinutes",
          "minOrder" = EXCLUDED."minOrder";
      `, [z.id, z.nameAr, z.fee, z.timeMinutes, z.minOrder]);
    }
    console.log('✅ Delivery Zones seeded.');

    // 5. Seed Categories
    const categories = [
      { id: 'cat_cheese', nameAr: 'أجبان وألبان طازجة', nameEn: 'Fresh Dairy & Cheese', icon: '🧀', badge: 'طازج يومياً', sortOrder: 1 },
      { id: 'cat_meat', nameAr: 'لحوم ومصنعات ومجمدات', nameEn: 'Cold Cuts & Frozen Meat', icon: '🥩', badge: 'أعلى جودة', sortOrder: 2 },
      { id: 'cat_produce', nameAr: 'خضروات وفواكه طازجة', nameEn: 'Fresh Fruits & Veggies', icon: '🍎', badge: 'فرز أول', sortOrder: 3 },
      { id: 'cat_pickles', nameAr: 'مخللات وزيتون وعطارة', nameEn: 'Pickles, Olives & Spices', icon: '🫒', badge: 'طعم بلدي', sortOrder: 4 },
      { id: 'cat_grocery', nameAr: 'بقالة ومؤن وأرز وزيت', nameEn: 'Dry Grocery & Pantry', icon: '🌾', badge: 'أسعار الجملة', sortOrder: 5 },
      { id: 'cat_dairy_pkg', nameAr: 'ألبان معبأة وزبادي وعصائر', nameEn: 'Packaged Dairy & Juices', icon: '🧃', badge: 'عروض التوفير', sortOrder: 6 },
      { id: 'cat_snacks', nameAr: 'بسكويت وشوكولاتة وتسالي', nameEn: 'Snacks & Chocolates', icon: '🍫', badge: 'عروض حصرية', sortOrder: 7 },
      { id: 'cat_detergents', nameAr: 'منظفات وعناية منزلية', nameEn: 'Detergents & Home Care', icon: '🧼', badge: 'نظافة وتوفير', sortOrder: 8 },
    ];

    for (const c of categories) {
      await client.query(`
        INSERT INTO "Category" ("id", "nameAr", "nameEn", "icon", "badge", "sortOrder", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT ("nameAr") DO UPDATE SET
          "nameEn" = EXCLUDED."nameEn",
          "icon" = EXCLUDED."icon",
          "badge" = EXCLUDED."badge",
          "sortOrder" = EXCLUDED."sortOrder";
      `, [c.id, c.nameAr, c.nameEn, c.icon, c.badge, c.sortOrder]);
    }
    console.log('✅ Categories seeded.');

    // 6. Seed High Quality Products (Packaged + Weighted / Open Amount)
    const products = [
      // --- أجبان طازجة (وزن ومبلغ مفتوح) ---
      {
        nameAr: 'جبنة رومي بطارخ قديمة إكسترا',
        brand: 'مزارع أولاد الشافعي',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000001000003',
        scaleItemCode: '00001',
        costPrice: 280,
        basePrice: 340,
        originalPrice: 370,
        discountPercent: 8,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 30,
        stockQty: 85,
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
        description: 'جبنة رومي بطارخ مصرية عتيقة طعم قوي ودسم عالي تقطع حسب رغبتك أو بالمبلغ المطلوب.'
      },
      {
        nameAr: 'جبنة براميلي فلفل خفيفة الملح',
        brand: 'أولاد الشافعي',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000002000000',
        scaleItemCode: '00002',
        costPrice: 155,
        basePrice: 195,
        originalPrice: 220,
        discountPercent: 11,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 20,
        stockQty: 90,
        image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=600&auto=format&fit=crop&q=80',
        description: 'جبنة براميلي طبيعي مضاف إليها فلفل حار طبيعي وطعم كريمي لا يقاوم.'
      },
      {
        nameAr: 'جبنة اسطنبولي دمياطي سادة',
        brand: 'أولاد الشافعي',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000003000007',
        scaleItemCode: '00003',
        costPrice: 145,
        basePrice: 185,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 20,
        stockQty: 110,
        image: 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=600&auto=format&fit=crop&q=80',
        description: 'جبنة بيضاء اسطنبولي طبيعية 100% غنية بالطعم الأصيل للمأكولات المصرية.'
      },
      {
        nameAr: 'جبنة قريش فلاحي طازجة دايت',
        brand: 'خير الريف',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000004000004',
        scaleItemCode: '00004',
        costPrice: 90,
        basePrice: 120,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 7,
        stockQty: 60,
        image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
        description: 'جبنة قريش فلاحي منزوعة الدسم غنية بالبروتين وخالية تماماً من المواد الحافظة.'
      },
      {
        nameAr: 'جبنة شيدر نيوزيلندي مستوردة صفراء',
        brand: 'أولاد الشافعي جورميه',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000005000001',
        scaleItemCode: '00005',
        costPrice: 320,
        basePrice: 395,
        originalPrice: 430,
        discountPercent: 8,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 45,
        stockQty: 75,
        image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=600&auto=format&fit=crop&q=80',
        description: 'شيدر نيوزيلندي أصلي عالي الجودة للبرجر والساندوتشات والصواني.'
      },
      {
        nameAr: 'جبنة فلمنك جودة هولندي أحمر',
        brand: 'فريكو هولندي',
        category: 'أجبان وألبان طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000006000008',
        scaleItemCode: '00006',
        costPrice: 360,
        basePrice: 440,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 45,
        stockQty: 50,
        image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&auto=format&fit=crop&q=80',
        description: 'جبنة فلمنك هولندية أصلية مستوردة بطعمها المميز وقوامها المرن.'
      },

      // --- لحوم ومصنعات ومجمدات ---
      {
        nameAr: 'لانشون بقري سادة حلواني إخوان',
        brand: 'حلواني إخوان',
        category: 'لحوم ومصنعات ومجمدات',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000007000005',
        scaleItemCode: '00007',
        costPrice: 210,
        basePrice: 260,
        originalPrice: 290,
        discountPercent: 10,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 15,
        stockQty: 100,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        description: 'لانشون بقري حلواني إخوان سادة درجة أولى تقطيع رقيق وسوبر دقيق.'
      },
      {
        nameAr: 'لانشون بقري بالزيتون حلواني إخوان',
        brand: 'حلواني إخوان',
        category: 'لحوم ومصنعات ومجمدات',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000008000002',
        scaleItemCode: '00008',
        costPrice: 210,
        basePrice: 260,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 15,
        stockQty: 80,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
        description: 'لانشون بقري غني بحبات الزيتون الأخضر الطازج تقطيع فوري.'
      },
      {
        nameAr: 'بسطرمة بلدي مخلية بدون ثوم فاخرة',
        brand: 'أولاد الشافعي',
        category: 'لحوم ومصنعات ومجمدات',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000009000009',
        scaleItemCode: '00009',
        costPrice: 560,
        basePrice: 680,
        originalPrice: 740,
        discountPercent: 8,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 30,
        stockQty: 40,
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80',
        description: 'بسطرمة بلدي معتّقة مخلية تماماً تقطيع ورقة سيجارة لألذ فطار وسحور.'
      },
      {
        nameAr: 'رومي مدخن حلواني إخوان',
        brand: 'حلواني إخوان',
        category: 'لحوم ومصنعات ومجمدات',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000010000005',
        scaleItemCode: '00010',
        costPrice: 310,
        basePrice: 380,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 15,
        stockQty: 55,
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
        description: 'صدر رومي مدخن شيدر طبيعي بنكهة التدخين الهادئة وجودة ممتازة.'
      },
      {
        nameAr: 'برجر بقري أطياب 8 قطع 1 كجم جامبو',
        brand: 'أطياب',
        category: 'لحوم ومصنعات ومجمدات',
        unit: 'علبة 1 كجم',
        barcode: '6223001850123',
        costPrice: 195,
        basePrice: 235,
        originalPrice: 260,
        discountPercent: 10,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 120,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        description: 'برجر لحم جامبو أطياب متبل وجاهز للشوي السريع.'
      },
      {
        nameAr: 'بانيه دجاج أطياب عادي 1 كجم',
        brand: 'أطياب',
        category: 'لحوم ومصنعات ومجمدات',
        unit: 'علبة 1 كجم',
        barcode: '6223001850239',
        costPrice: 210,
        basePrice: 255,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 140,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
        description: 'بانيه دجاج كرانشي مقرمش ذهبي من أطياب جودة مضمونة.'
      },

      // --- خضروات وفواكه طازجة (وزن ومبلغ مفتوح) ---
      {
        nameAr: 'طماطم بلدي فرز أول طازجة',
        brand: 'خضار أكتوبر',
        category: 'خضروات وفواكه طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000014000003',
        scaleItemCode: '00014',
        costPrice: 11,
        basePrice: 15,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 5,
        stockQty: 300,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        description: 'طماطم بلدي حمراء صلبة طازجة يومياً مناسبة للسلطة والطبخ.'
      },
      {
        nameAr: 'بطاطس تحمير شيبسي ممتازة',
        brand: 'خضار أكتوبر',
        category: 'خضروات وفواكه طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000015000000',
        scaleItemCode: '00015',
        costPrice: 13,
        basePrice: 18,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 14,
        stockQty: 450,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
        description: 'بطاطس تحمير سبونتا بلدي مقرمشة وخالية من التسكير.'
      },
      {
        nameAr: 'خيار بلدي صوبة طازج مقرمش',
        brand: 'خضار أكتوبر',
        category: 'خضروات وفواكه طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000016000007',
        scaleItemCode: '00016',
        costPrice: 14,
        basePrice: 20,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 5,
        stockQty: 250,
        image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
        description: 'خيار بلدي رفيع وطازج ومقرمش يومياً.'
      },
      {
        nameAr: 'موز بلدي سكري فاخر',
        brand: 'فاكهة أكتوبر',
        category: 'خضروات وفواكه طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000017000004',
        scaleItemCode: '00017',
        costPrice: 19,
        basePrice: 25,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 4,
        stockQty: 200,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
        description: 'موز بلدي ناضج ومسكر ومغذي للأطفال والكبار.'
      },
      {
        nameAr: 'تفاح سكري إيطالي أحمر',
        brand: 'فاكهة مستوردة',
        category: 'خضروات وفواكه طازجة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000018000001',
        scaleItemCode: '00018',
        costPrice: 68,
        basePrice: 85,
        originalPrice: 95,
        discountPercent: 11,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 14,
        stockQty: 180,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
        description: 'تفاح إيطالي أحمر سكري فرز أول غني بالعصارة ومقرمش.'
      },

      // --- مخللات وزيتون وعطارة (وزن ومبلغ مفتوح) ---
      {
        nameAr: 'زيتون كلاماتا يوناني دولسي كبير',
        brand: 'أولاد الشافعي',
        category: 'مخللات وزيتون وعطارة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000011000002',
        scaleItemCode: '00011',
        costPrice: 140,
        basePrice: 180,
        originalPrice: 210,
        discountPercent: 14,
        isOffer: true,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 60,
        stockQty: 120,
        image: 'https://images.unsplash.com/photo-1589135233689-d419e592750e?w=600&auto=format&fit=crop&q=80',
        description: 'زيتون كلاماتا دولسي أصلي مخلل بزيت الزيتون والليمون.'
      },
      {
        nameAr: 'زيتون تفاحي أخضر مخلل بالليمون والجزر',
        brand: 'أولاد الشافعي',
        category: 'مخللات وزيتون وعطارة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000012000009',
        scaleItemCode: '00012',
        costPrice: 105,
        basePrice: 140,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 60,
        stockQty: 100,
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
        description: 'زيتون تفاحي مصري حجم كبير لحم سميك ونكهة مضبوطة.'
      },
      {
        nameAr: 'طرشي بلدي مشكل مصري فاخر',
        brand: 'أولاد الشافعي',
        category: 'مخللات وزيتون وعطارة',
        unit: '1 كجم (بالوزن/المبلغ)',
        barcode: '2000013000006',
        scaleItemCode: '00013',
        costPrice: 30,
        basePrice: 45,
        isOffer: false,
        isExpress: true,
        isWeighted: true,
        shelfLifeDays: 30,
        stockQty: 150,
        image: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=600&auto=format&fit=crop&q=80',
        description: 'تشكيلة طرشي بلدي جزر، لفت، فلفل، خيار وقرنبيط مقرمش.'
      },

      // --- بقالة ومؤن وسكر وزيت (باركود ثابت) ---
      {
        nameAr: 'أرز مصري الساعة فاخر 1 كجم',
        brand: 'الساعة',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'كيس 1 كجم',
        barcode: '6221155010012',
        costPrice: 32,
        basePrice: 38,
        originalPrice: 42,
        discountPercent: 10,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 500,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        description: 'أرز مصري أبيض عريض الحبة مغسول ومنقى بأحدث التقنيات.'
      },
      {
        nameAr: 'سكر الأسرة ناعم نقي 1 كجم',
        brand: 'الأسرة',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'كيس 1 كجم',
        barcode: '6221155020028',
        costPrice: 28,
        basePrice: 35,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 450,
        image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80',
        description: 'سكر أبيض نقي سريع الذوبان للمشروبات والحلويات.'
      },
      {
        nameAr: 'زيت ذرة عافية بلس 800 مل',
        brand: 'عافية',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'زجاجة 800 مل',
        barcode: '6221155030034',
        costPrice: 78,
        basePrice: 95,
        originalPrice: 105,
        discountPercent: 10,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 320,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
        description: 'زيت ذرة نقي 100% غني بالأوميجا وخفيف على المعدة.'
      },
      {
        nameAr: 'زيت عباد الشمس كريستال 800 مل',
        brand: 'كريستال',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'زجاجة 800 مل',
        barcode: '6221155040040',
        costPrice: 65,
        basePrice: 80,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 350,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
        description: 'زيت عباد شمس كريستال نقي ومثالي للتحمير الصحي والطبخ.'
      },
      {
        nameAr: 'سمنة روابي بطعم ورائحة الزبدة الفلاحي 700 جم',
        brand: 'روابي',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'برطمان 700 جم',
        barcode: '6221155050056',
        costPrice: 75,
        basePrice: 92,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 240,
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80',
        description: 'سمن نباتي نقي برائحة الزبدة الفلاحي الأصلية لكافة الأكلات.'
      },
      {
        nameAr: 'مكرونة الملكة اسباجيتي 400 جم',
        brand: 'الملكة',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'كيس 400 جم',
        barcode: '6221155060062',
        costPrice: 12,
        basePrice: 16,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 600,
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
        description: 'مكرونة اسباجيتي سيمولينا قمح صلب لا تتعجن ومثالية مع الصلصة.'
      },
      {
        nameAr: 'مكرونة الملكة قلم 400 جم',
        brand: 'الملكة',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'كيس 400 جم',
        barcode: '6221155070078',
        costPrice: 12,
        basePrice: 16,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 600,
        image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80',
        description: 'مكرونة فرن بنة قلم مثالية للمكرونة بالبشاميل والطواجن.'
      },
      {
        nameAr: 'شاي العروسة أسود ناعم 250 جم',
        brand: 'العروسة',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'باكيت 250 جم',
        barcode: '6221155080084',
        costPrice: 48,
        basePrice: 58,
        originalPrice: 65,
        discountPercent: 11,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 400,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        description: 'شاي أسود كيني ناعم المفضل في مصر للمزاج العالي.'
      },
      {
        nameAr: 'نسكافيه كلاسيك بلاك أصلي 100 جم برطمان',
        brand: 'نسكافيه',
        category: 'بقالة ومؤن وأرز وزيت',
        unit: 'برطمان 100 جم',
        barcode: '6221155090090',
        costPrice: 120,
        basePrice: 145,
        originalPrice: 160,
        discountPercent: 9,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 180,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        description: 'قهوة سريعة التحضير غنية بنكهة البن المحمص الأصلي لصباح نشيط.'
      },

      // --- ألبان معبأة وزبادي وعصائر ---
      {
        nameAr: 'حليب جهينة كامل الدسم 1 لتر',
        brand: 'جهينة',
        category: 'ألبان معبأة وزبادي وعصائر',
        unit: 'علبة 1 لتر',
        barcode: '6221155100102',
        costPrice: 38,
        basePrice: 46,
        originalPrice: 50,
        discountPercent: 8,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 300,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
        description: 'حليب بقري طبيعي 100% معقم وطويل الأجل غني بالكالسيوم والفيتامينات.'
      },
      {
        nameAr: 'زبادي جهينة طبيعي 105 جم (عرض 6 علب)',
        brand: 'جهينة',
        category: 'ألبان معبأة وزبادي وعصائر',
        unit: 'عرض 6 علب',
        barcode: '6221155110118',
        costPrice: 42,
        basePrice: 52,
        originalPrice: 60,
        discountPercent: 13,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 160,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
        description: 'زبادي طبيعي طازج وصحي للهضم ومثالي للسحور والوجبات الخفيفة.'
      },
      {
        nameAr: 'عصير بيتي مانجو طبيعي 1 لتر',
        brand: 'بيتي تروبيكانا',
        category: 'ألبان معبأة وزبادي وعصائر',
        unit: 'علبة 1 لتر',
        barcode: '6221155120124',
        costPrice: 24,
        basePrice: 30,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 220,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
        description: 'نكتار مانجو غني ومصنوع من أجود محاصيل المانجو الطبيعية.'
      },

      // --- بسكويت وشوكولاتة وتسالي ---
      {
        nameAr: 'شوكولاتة كادبوري ديري ميلك سادة 90 جم',
        brand: 'كادبوري',
        category: 'بسكويت وشوكولاتة وتسالي',
        unit: 'قطعة 90 جم',
        barcode: '6221155130130',
        costPrice: 40,
        basePrice: 50,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 250,
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
        description: 'شوكولاتة بالحليب غنية ولذيذة تذوب في الفم من كادبوري الأصلية.'
      },
      {
        nameAr: 'شيبسي عائلي بطعم الجبنة المتبلة',
        brand: 'شيبسي',
        category: 'بسكويت وشوكولاتة وتسالي',
        unit: 'كيس سوبر جامبو',
        barcode: '6221155140146',
        costPrice: 16,
        basePrice: 20,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 300,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        description: 'رقائق بطاطس طبيعية مقرمشة بنكهة الجبنة الغنية المحبوبة.'
      },

      // --- منظفات وعناية منزلية ---
      {
        nameAr: 'مسحوق أريال أوتوماتيك لافندر 2.5 كجم',
        brand: 'أريال',
        category: 'منظفات وعناية منزلية',
        unit: 'شيكارة 2.5 كجم',
        barcode: '6221155150152',
        costPrice: 195,
        basePrice: 240,
        originalPrice: 275,
        discountPercent: 13,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 150,
        image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80',
        description: 'مسحوق غسيل أوتوماتيك ينظف أصعب البقع ويترك رائحة اللافندر المنعشة.'
      },
      {
        nameAr: 'سائل غسيل الأطباق فيري بلس ليمون 650 مل',
        brand: 'فيري',
        category: 'منظفات وعناية منزلية',
        unit: 'زجاجة 650 مل',
        barcode: '6221155160168',
        costPrice: 38,
        basePrice: 48,
        isOffer: false,
        isExpress: true,
        isWeighted: false,
        stockQty: 280,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        description: 'قوة قاهرة للدهون تدوم طويلاً مع لمسة ناعمة على اليدين.'
      },
      {
        nameAr: 'مناديل زينة كلاسيك 550 منديل (عرض 3 علب)',
        brand: 'زينة',
        category: 'منظفات وعناية منزلية',
        unit: 'عرض 3 علب',
        barcode: '6221155170174',
        costPrice: 65,
        basePrice: 82,
        originalPrice: 95,
        discountPercent: 14,
        isOffer: true,
        isExpress: true,
        isWeighted: false,
        stockQty: 200,
        image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&auto=format&fit=crop&q=80',
        description: 'مناديل ورقية ناعمة وقوية ثلاثية الطبقات فائقة الامتصاص.'
      }
    ];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await client.query(`
        INSERT INTO "Product" (
          "id", "nameAr", "brand", "category", "unit", "barcode", "costPrice", "basePrice",
          "originalPrice", "discountPercent", "isOffer", "isExpress", "isWeighted",
          "scaleItemCode", "shelfLifeDays", "inStock", "stockQty", "openingStock",
          "image", "description", "sortOrder", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, $16, $17, $18, $19, NOW()
        )
        ON CONFLICT ("id") DO UPDATE SET
          "nameAr" = EXCLUDED."nameAr",
          "brand" = EXCLUDED."brand",
          "category" = EXCLUDED."category",
          "unit" = EXCLUDED."unit",
          "barcode" = EXCLUDED."barcode",
          "costPrice" = EXCLUDED."costPrice",
          "basePrice" = EXCLUDED."basePrice",
          "originalPrice" = EXCLUDED."originalPrice",
          "discountPercent" = EXCLUDED."discountPercent",
          "isOffer" = EXCLUDED."isOffer",
          "isWeighted" = EXCLUDED."isWeighted",
          "scaleItemCode" = EXCLUDED."scaleItemCode",
          "stockQty" = EXCLUDED."stockQty",
          "image" = EXCLUDED."image",
          "description" = EXCLUDED."description";
      `, [
        `prod_${i + 1}`,
        p.nameAr,
        p.brand,
        p.category,
        p.unit,
        p.barcode,
        p.costPrice,
        p.basePrice,
        p.originalPrice || null,
        p.discountPercent || null,
        p.isOffer || false,
        p.isExpress || true,
        p.isWeighted || false,
        p.scaleItemCode || null,
        p.shelfLifeDays || 3,
        p.stockQty,
        p.image,
        p.description,
        i + 1
      ]);
    }
    console.log(`✅ Seeded ${products.length} products successfully.`);

    console.log('🎉 Awlad Elshafie Supermarket Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
