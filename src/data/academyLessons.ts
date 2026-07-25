export type AcademyLesson = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string; // HTML string
  category: "Temeller" | "Taktikler" | "İleri Seviye";
  level: "Başlangıç" | "Orta" | "İleri";
  durationMinutes: number;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export const academyLessons: AcademyLesson[] = [
  {
    id: "v1",
    title: "Pickleball Temelleri: Kurallar, Saha ve Mutfak",
    description: "Pickleball'a yeni başlayanlar için temel kurallar, saha ölçüleri, mutfak (Kitchen) çizgisi ve puanlama akışı.",
    imageUrl: "/images/academy/hero_basics.png",
    category: "Temeller",
    level: "Başlangıç",
    durationMinutes: 5,
    content: `
      <h3>Hoş Geldiniz!</h3>
      <p>Pickleball, tenis, badminton ve masa tenisinin unsurlarını birleştiren hızlı, eğlenceli ve stratejik bir spordur. Bu derste temel kuralları ve saha yapısını baştan sona öğreneceğiz.</p>
      
      <div className="my-6 p-5 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-2xl">
        <h4 className="font-extrabold text-amber-800 dark:text-amber-300 text-base m-0">💡 Ustanın Altın Kuralı</h4>
        <p className="text-sm text-amber-900/80 dark:text-amber-200/80 mt-1 m-0">
          Pickleball güç sporu değil, sabır ve yerleşim sporudur. En sert vuran değil, rakibi en iyi pozisyon dışına çıkaran kazanır.
        </p>
      </div>

      <h4>Saha Ölçüleri ve Mutfak (Kitchen) Kuralı</h4>
      <img src="/images/academy/kitchen_rules.png" alt="Pickleball Mutfak Kuralı ve Saha Ölçüleri" className="rounded-2xl shadow-md my-6 w-full aspect-video object-cover" />
      <p>Filenin her iki yanındaki 2.1 metrelik alana "Non-Volley Zone" veya kısaca "Mutfak (Kitchen)" denir. Bu alanın içinde havadan (top yere sekmeden) vole vurmak kesinlikle yasaktır. Bu kural, file önünde smaç vurulmasını engeller ve oyunun stratejik yapısını oluşturur.</p>

      <h4>Puanlama ve İki Sekme Kuralı (Double Bounce Rule)</h4>
      <p>Sadece servis kullanan taraf puan kazanabilir. Maçlar genellikle 11 puana oynanır ve kazanmak için en az 2 puan fark gereklidir.</p>
      <p><strong>Çok Önemli Kural:</strong> Servis atıldıktan sonra topun karşı sahada bir kez, dönüşte ise servis atan takımın sahasında bir kez yere sekmesi zorunludur. Ancak bu iki sekmeler gerçekleştikten sonra vole vurulabilir!</p>
    `,
    quiz: {
      question: "Mutfak (Non-Volley Zone) çizgisine basarken veya mutfağın içindeyken hangi vuruşu yapmak KESİNLİKLE yasaktır?",
      options: [
        "Top yere sektikten sonra dink yapmak",
        "Top yere sekmeden havada vole (smash/volley) vurmak",
        "Top yere sektikten sonra lob (aşırtma) vurmak",
        "Top yere sektikten sonra çapraz vuruş yapmak"
      ],
      correctIndex: 1,
      explanation: "Mutfak alanı içerisinde top yere sekmeden havada (vole) vurulamaz! Ancak top mutfağın içine yere sekerse içeri girip vurabilirsiniz."
    }
  },
  {
    id: "v2",
    title: "Doğru Raket Tutuşu (Continental Grip) ve Bilek Açıları",
    description: "Kıtalararası (Continental) tutuş nedir ve dink yaparken neden en etkili tekniktir? Kontrolünüzü %100 artırın.",
    imageUrl: "/images/academy/hero_grip.png",
    category: "Temeller",
    level: "Başlangıç",
    durationMinutes: 4,
    content: `
      <h3>Tutuş Her Şeydir</h3>
      <p>Yeni başlayanların yaptığı en büyük hatalardan biri, raketi tenis veya badminton raketi gibi kavramaktır. Gerçek kontrol, hızlı tepki ve dink hassasiyeti için <strong>Continental Grip</strong> kullanmanız gerekir.</p>

      <h4>Nasıl Tutulur?</h4>
      <img src="/images/academy/continental_grip.png" alt="Continental Grip Tutuş Pozisyonu" className="rounded-2xl shadow-md my-6 w-full aspect-video object-cover" />
      <p>Raketinizi bir çekiç tutar gibi sapından kavrayın. Baş parmağınız ile işaret parmağınızın oluşturduğu 'V' harfi raketin üst kenarıyla tam hizalı olmalıdır.</p>

      <div className="my-6 p-5 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-pb-blue rounded-r-2xl">
        <h4 className="font-extrabold text-blue-800 dark:text-blue-300 text-base m-0">⚡ Neden Continental Tutuş?</h4>
        <ul className="text-sm text-blue-900/80 dark:text-blue-200/80 mt-2 space-y-1 pl-4">
          <li><strong>Anında Geçiş:</strong> Forehand ve Backhand arasında raket sapını çevirmekle zaman kaybetmezsiniz.</li>
          <li><strong>Yumuşak Bilek:</strong> Dink yaparken topun altına girmek ve hızı sönümlemek çok daha kolaydır.</li>
          <li><strong>Hızlı Blok:</strong> Vücudunuza gelen hızlı toplarda kalkan pozisyonu almanızı sağlar.</li>
        </ul>
      </div>
    `,
    quiz: {
      question: "Continental Grip tutuşunun oyuncuya sağladığı en büyük avantaj nedir?",
      options: [
        "Sadece forehand vuruşlarında maksimum güç sağlaması",
        "Raketi hiç çevirmeden hem Forehand hem Backhand vuruşlarına anında hazır olmak",
        "Servisi daha yüksekten atabilmek",
        "Sadece smaç vururken bileğin kilitlenmesi"
      ],
      correctIndex: 1,
      explanation: "Continental Grip, file önündeki hızlı rallilerde elinizi çevirmeden hem forehand hem backhand bloklarına saniyesinde yanıt vermenizi sağlar."
    }
  },
  {
    id: "v3",
    title: "Dink Sanatı: Sabır, Geometri ve Rakibi Hataya Zorlamak",
    description: "Mutfak çizgisinde dink rallilerini kazanmanın yolları. Çapraz dinkler, ayak hedefleri ve ritim kontrolü.",
    imageUrl: "/images/academy/hero_dink.png",
    category: "Taktikler",
    level: "Orta",
    durationMinutes: 7,
    content: `
      <h3>Dink Nedir ve Neden Kazandırır?</h3>
      <p>Dink, rakibin mutfağına düşecek şekilde atılan yumuşak, kavisli ve kontrollü vuruştur. Amacı doğrudan sayı almak değil, rakibin topu yukarı (Pop-up) kaldırmasını sağlayarak bitirici vuruş fırsatı yakalamaktır.</p>

      <h4>Dink Geometrisi ve Çapraz (Cross-Court) Üstünlüğü</h4>
      <img src="/images/academy/dink_strategy.png" alt="Dink Stratejisi" className="rounded-2xl shadow-md my-6 w-full aspect-video object-cover" />
      <p>Dink atarken rastgele vurmamalısınız. Üç ana hedefinizi iyi belirleyin:</p>
      <ul>
        <li><strong>Çapraz (Cross-Court) Dink:</strong> File mesafesi çaprazda daha uzun ve file orta kısmı daha alçak olduğu için hata riskiniz en düşüktür. Ayrıca rakibi saha dışına çekersiniz.</li>
        <li><strong>Ayak Uçlarına Dink:</strong> Topu rakibin ayakkabısına doğru indirin. Bu onları geriye yaslanmaya ve topu istemeden havaya dikmeye zorlar.</li>
        <li><strong>Ortaya Dink:</strong> Çiftler maçında iki oyuncunun arasındaki iletişim boşluğunu hedefler.</li>
      </ul>

      <div className="my-6 p-5 bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-pb-green rounded-r-2xl">
        <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300 text-base m-0">🧠 Psikolojik Kural: İlk Saldıran Genellikle Kaybeder</h4>
        <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80 mt-1 m-0">
          Dink rallisinde sabırsızlanıp alçak bir topa sert vurmaya çalışırsanız top büyük ihtimalle fileye takılır veya dışarı çıkar. Sadece top file seviyesinin ÜZERİNE çıktığında saldırın!
        </p>
      </div>
    `,
    quiz: {
      question: "Dink rallisinde çapraz (Cross-Court) dink atmanın düz dinke göre en önemli taktiksel avantajı nedir?",
      options: [
        "Topun daha hızlı gitmesini sağlamak",
        "Çapraz mesafenin daha uzun ve filenin ortada daha alçak olması sayesinde hatasız ve güvenli kavis sağlamak",
        "Rakibin servis atmasını engellemek",
        "Topun hiç sekmemesini sağlamak"
      ],
      correctIndex: 1,
      explanation: "Çapraz mesafe (diagona) yaklaşık 13 feet daha uzundur ve filenin orta noktası kenarlardan 2 inç daha alçaktır. Bu da size en güvenli marjı verir."
    }
  },
  {
    id: "v4",
    title: "Üçüncü Vuruş Ustalığı: Third Shot Drop vs. Third Shot Drive",
    description: "Servis sonrası file önüne güvenle yaklaşmanın sırrı. Ne zaman yumuşak drop, ne zaman sert drive vurulmalı?",
    imageUrl: "/images/academy/hero_drop.png",
    category: "Taktikler",
    level: "Orta",
    durationMinutes: 6,
    content: `
      <h3>Pickleball'un En Önemli Vuruşu</h3>
      <p>Servis atan takım arka çizgidedir, karşılayan takım ise çoktan mutfak çizgisine yerleşmiştir. Arka çizgide kalarak maçı kazanamazsınız! File önüne yaklaşmak için en etkili silahınız <strong>Third Shot Drop</strong> vuruşudur.</p>

      <h4>Drop vs. Drive: Hangisini Seçmeli?</h4>
      <img src="/images/academy/third_shot_drop.png" alt="Third Shot Drop Gösterimi" className="rounded-2xl shadow-md my-6 w-full aspect-video object-cover" />
      <p>İyi bir oyuncu duruma göre iki seçeneği de kullanır:</p>
      <ul>
        <li><strong>Third Shot Drop (Yumuşak Aşırtma):</strong> Topu yukarı doğru kavisle rakibin mutfağına indirirsiniz. Top havadayken partnerinizle birlikte hızla mutfak çizgisine koşup eşitliği sağlarsınız.</li>
        <li><strong>Third Shot Drive (Sert Vuruş):</strong> Eğer rakibin servis karşılaması kısa veya yüksek kaldıysa, sert bir drive ile onları şaşırtıp 5. vuruşta kolay bir drop yapabilirsiniz.</li>
      </ul>

      <div className="my-6 p-5 bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 rounded-r-2xl">
        <h4 className="font-extrabold text-purple-800 dark:text-purple-300 text-base m-0">🎯 Drop Vuruşu Tekniği</h4>
        <p className="text-sm text-purple-900/80 dark:text-purple-200/80 mt-1 m-0">
          Drop vururken bileğinizi kilitli tutun. Hareketi omzunuzdan yukarı doğru asansör gibi kaldırarak yapın. Topun en yüksek noktası filenin hemen üstü olmalıdır.
        </p>
      </div>
    `,
    quiz: {
      question: "Third Shot Drop (3. Vuruş Drop) yapmanın temel amacı nedir?",
      options: [
        "Doğrudan ace veya kazanan vuruş yapmak",
        "Top rakibin mutfağına yumuşakça düşerken, takımca file önüne (mutfak çizgisine) güvenle koşacak zamanı kazanmak",
        "Rakibin raketini elinden düşürmek",
        "Servis hakkını hemen rakibe vermek"
      ],
      correctIndex: 1,
      explanation: "Third Shot Drop, topu havada süzdürerek mutfağa indirir ve size arka çizgiden mutfak çizgisine koşup pozisyon alma zamanı kazandırır."
    }
  },
  {
    id: "v5",
    title: "Reset Vuruşları: Sert Hızları Sönümleme Sanatı",
    description: "Rakibin sert smaçlarını ve drive vuruşlarını yumuşatarak mutfağa düşürme ve savunmayı atağa çevirme.",
    imageUrl: "/images/academy/hero_basics.png",
    category: "Taktikler",
    level: "İleri",
    durationMinutes: 6,
    content: `
      <h3>Sert Vuran Rakiplere Karşı Kalkanınız: Reset</h3>
      <p>Rakibiniz size var gücüyle sert bir top vurduğunda, aynı sertlikle karşılık verirseniz top genellikle saha dışına uçar. İleri seviye oyuncular sert topları <strong>Reset</strong> vuruşuyla sönümleyerek mutfağa indirir ve oyunu yavaşlatır.</p>

      <h4>Nasıl Reset Atılır?</h4>
      <ul>
        <li><strong>Yumuşak Kavrama:</strong> Raketinizi 10 üzerinden 3-4 sıkılığında tutun. Raket bir yastık gibi davranıp topun hızını emmelidir.</li>
        <li><strong>Geriye Doğru Esneme:</strong> Top rakete değerken kolunuzu hafifçe geriye doğru esneterek darbeyi sönümleyin.</li>
        <li><strong>Sabit Ayaklar:</strong> Reset atarken koşmayın; durun, dengenizi bulun ve topun önünde bir duvar olun.</li>
      </ul>
    `,
    quiz: {
      question: "Sert gelen bir topu 'Reset' vuruşuyla yumuşatmak için raketi nasıl tutmalısınız?",
      options: [
        "Mümkün olan en sıkı şekilde (10/10 güçle) sıkarak",
        "Çok gevşek ve yumuşak (10 üzerinden 3-4 sıkılığında) tutarak darbeyi sönümlemelisiniz",
        "Raketi tamamen yere bırakarak",
        "Sadece tek parmakla tutarak"
      ],
      correctIndex: 1,
      explanation: "Raketi gevşek tutmak (soft hands), topun hızını emerek mutfak alanına yumuşakça düşmesini sağlar."
    }
  },
  {
    id: "v6",
    title: "Çiftler Uyumu: İple Bağlı Gibi Hareket Etmek (Shadowing)",
    description: "Partnerinizle saha içinde boşluk bırakmadan senkronize hareket etme ve ortadaki topları paylaşma kuralları.",
    imageUrl: "/images/academy/hero_grip.png",
    category: "Taktikler",
    level: "Orta",
    durationMinutes: 5,
    content: `
      <h3>Partnerinizle Görünmez Bir İple Bağlanın</h3>
      <p>Çiftler maçında yapılan en büyük hata, bir oyuncu topa koşarken diğerinin olduğu yerde sabit durmasıdır. Başarılı çiftler sahadaki boşlukları kapatmak için birlikte sağa, sola, öne ve arkaya senkronize hareket eder.</p>

      <h4>Ortadaki Topu Kim Alır?</h4>
      <p>Ortaya gelen toplar çiftler maçında en çok sayı kaybedilen alanlardır. İşte altın kural:</p>
      <ul>
        <li><strong>Forehand Ortada Olan Önceliklidir:</strong> Genellikle forehand vuruşu ortada olan oyuncu (sağ elini kullananlar için soldaki oyuncu) ortadaki toplara müdahale eder.</li>
        <li><strong>İletişim:</strong> Vuruştan önce "Benim!" veya "Sende!" diyerek sesli iletişim kurmak hatayı %80 azaltır.</li>
      </ul>
    `,
    quiz: {
      question: "Çiftler maçında partnerlerden biri topu karşılamak için sola kaydığında, diğer partner ne yapmalıdır?",
      options: [
        "Olduğu yerde hiç kıpırdamadan durmalıdır",
        "Aralarındaki mesafeyi koruyarak o da sola doğru kaymalı ve sahadaki açık açıyı kapatmalıdır",
        "Arka çizgiye doğru kaçmalıdır",
        "Rakibin sahasına geçmelidir"
      ],
      correctIndex: 1,
      explanation: "Partnerler aralarında görünmez bir ip varmış gibi senkronize hareket ederek ortada veya köşelerde boşluk kalmasını engeller."
    }
  },
  {
    id: "v7",
    title: "İleri Seviye Bitirici Vuruşlar: Erne ve ATP (Around The Post)",
    description: "Rakibi şaşkına çeviren ileri düzey turnuva vuruşları: Mutfak dışına zıplayarak Erne ve direğin dışından ATP.",
    imageUrl: "/images/academy/hero_dink.png",
    category: "İleri Seviye",
    level: "İleri",
    durationMinutes: 8,
    content: `
      <h3>Sahanın Sınırlarını Zorlayın</h3>
      <p>Turnuvalarda fark yaratan iki özel vuruş vardır: <strong>Erne</strong> ve <strong>ATP (Around The Post)</strong>.</p>

      <h4>1. Erne Vuruşu Nedir?</h4>
      <p>Mutfak kuralı, mutfağın İÇİNE basıp havadan vurmayı yasaklar. Ancak mutfağın DIŞINA (saha kenarındaki boşluğa) zıplayarak havada vurursanız kurallara uygundur! Rakip çizgiye paralel dink attığı an kenardan zıplayıp topu havada keserek muhteşem bir sayı alabilirsiniz.</p>

      <h4>2. ATP (Around The Post - Direk Dışından Vuruş)</h4>
      <p>Rakip sizi saha dışına çıkaracak kadar geniş açılı bir vuruş yaptığında, topu filenin ÜZERİNDEN geçirmek zorunda değilsiniz! Topu file direğinin DIŞINDAN, file seviyesinin altından dahi geçirerek rakip sahaya indirebilirsiniz.</p>
    `,
    quiz: {
      question: "ATP (Around The Post) vuruşu yapılırken topun filenin üzerinden geçmesi zorunlu mudur?",
      options: [
        "Evet, top her zaman filenin üzerinden geçmek zorundadır",
        "Hayır, top file direğinin dışından ve hatta file yüksekliğinin altından dahi geçirilerek rakip sahaya vurulabilir",
        "Hayır ama sadece servis sırasında yapılabilir",
        "Evet, aksi takdirde faul sayılır"
      ],
      correctIndex: 1,
      explanation: "Resmî Pickleball kurallarına göre ATP vuruşunda topun filenin üzerinden geçme zorunluluğu yoktur; direğin dışından dolaşabilir."
    }
  },
  {
    id: "v8",
    title: "Lob Savunması ve Smaç (Overhead Smash) Taktikleri",
    description: "Üzerinizden aşırtma (lob) atıldığında nasıl geri dönülür? Smaç fırsatlarını fileye takmadan bitirme rehberi.",
    imageUrl: "/images/academy/hero_drop.png",
    category: "İleri Seviye",
    level: "İleri",
    durationMinutes: 5,
    content: `
      <h3>Aşırtmalara (Lob) Karşı Panik Yapmayın</h3>
      <p>Mutfak çizgisindeyken rakip üzerinizden bir lob attığında geri geri koşarken asla arkanızı dönmeyin veya dengesiz vurmayın.</p>

      <h4>Lob Savunması Adımları</h4>
      <ul>
        <li><strong>Çapraz Partner Yardımı:</strong> Lob kime atıldıysa, çaprazındaki partner topu daha rahat görebildiği için "Ben aldım!" diyerek arkaya koşabilir.</li>
        <li><strong>Yüksek Lob ile Yanıt Verin:</strong> Geriye koşup aldığınız topa sert vurmaya çalışmayın. Siz de yüksek bir lob atarak file önüne geri dönme zamanı kazanın.</li>
      </ul>

      <h4>Overhead Smash (Smaç) Bitiriciliği</h4>
      <p>Rakip yüksek top attığında smacı var gücünüzle aşağı çakmak yerine, rakibin ayaklarına ve boş köşelere <strong>açılı ve kontrollü</strong> vurun.</p>
    `,
    quiz: {
      question: "Mutfak çizgisindeyken rakip üzerinizden derin bir aşırtma (lob) attığında en güvenli savunma stratejisi nedir?",
      options: [
        "Geriye koşarken zıplayıp körü körüne sert smaç vurmak",
        "Topa yetişip yüksek bir lob ile karşılık vererek file önüne dönmek için zaman kazanmak",
        "Raketi fırlatmak",
        "Sahanın ortasında durup beklemek"
      ],
      correctIndex: 1,
      explanation: "Savunmada geriye koşarken en iyi hamle, yüksek bir lob veya derin bir drop ile kendinize pozisyona geri dönme süresi yaratmaktır."
    }
  }
];
