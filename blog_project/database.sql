CREATE DATABASE ajax_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

USE ajax_blog;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT 0
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admin kullanıcı (kullanıcı adı: admin, şifre: admin123)
INSERT INTO users (username, password, is_admin) VALUES ('admin', MD5('admin123'), 1);

INSERT INTO posts (title, content, category, tags) VALUES 
('Kapadokya\'da Büyülü Bir Hafta Sonu', 'Kapadokya, Türkiye\'nin en etkileyici doğal güzelliklerinden biridir. Peri bacaları, sıcak hava balonları ve yeraltı şehirleriyle dünyaca ünlü bu bölgede geçirdiğim hafta sonu, unutulmaz anılarla doluydu.\n\nSabahın erken saatlerinde sıcak hava balonu deneyimi için kalktığımda, güneşin peri bacalarının üzerine doğuşunu izlemek büyüleyiciydi. Yüzlerce renkli balon gökyüzünü süslerken, Kapadokya\'nın eşsiz manzarasını kuşbakışı görmek inanılmaz bir deneyimdi.\n\nÖğleden sonra Göreme Açık Hava Müzesi\'ni ziyaret ettim. Buradaki kaya kiliseler ve manastırlar, erken Hıristiyanlık döneminin izlerini taşıyor. Duvarlarındaki freskler hala canlılığını koruyor.\n\nAkşamları ise bölgeye özgü şarapları tatmak için yerel bir şarap evine gittim. Kapadokya\'nın volkanik toprağında yetişen üzümlerden yapılan şaraplar gerçekten lezzetliydi.\n\nGüzel bir çömlek atölyesinde, yöreye özgü çanak çömlek yapımını deneyimledim. Bin yıllık bir sanatı öğrenmek, ellerimle çamura şekil vermek farklı bir deneyimdi.\n\nSon gün, Derinkuyu Yeraltı Şehri\'ni keşfettim. Sekiz kata kadar inen bu yeraltı şehri, binlerce insanın yaşaması için tasarlanmış. Dar tünellerden geçerken, tarihte yolculuk yapıyor gibiydim.\n\nKapadokya\'dan ayrılırken, buranın sadece bir turistik yer değil, aynı zamanda tarih, kültür ve doğanın muhteşem bir birleşimi olduğunu hissettim. Kesinlikle tekrar ziyaret edilmesi gereken bir yer.', 'türkiye', 'Kapadokya, Sıcak Hava Balonu, Türkiye, Gezi, Peri Bacaları'),

('Santorini\'de Beyaz ve Mavinin Dansı', 'Ege Denizi\'nin incisi Santorini, Yunanistan\'ın en fotojenik adalarından biri. Mavi kubbeli beyaz evleri, nefes kesen gün batımları ve volkanik plajlarıyla ünlü bu adada geçirdiğim bir hafta, tüm beklentilerimi aştı.\n\nFira\'dan Oia\'ya uzanan yürüyüş yolunda, adanın muhteşem manzarasını izleyerek yürümek muhteşemdi. Bir tarafta derin mavi deniz, diğer tarafta beyaz badanalı evler... Her adımda farklı bir manzarayla karşılaşmak mümkün.\n\nOia\'daki gün batımı, kelimelerle anlatılamayacak kadar güzeldi. Güneş denizin üzerine batarken gökyüzünün aldığı turuncu ve pembe renkler, kalabalık bir turistin toplandığı bu noktada herkesi büyülüyordu.\n\nKırmızı Plaj\'da yüzmek farklı bir deneyimdi. Volkanik kayaların oluşturduğu kırmızı kumsal, siyah ve kırmızının kontrastıyla etkileyici bir görüntü sunuyor.\n\nYerel tavernalarda tadına baktığım Greek salatası, fava ve taze deniz ürünleri damak zevkime hitap etti. Özellikle günlük avlanan ahtapot, adanın en lezzetli yemeklerinden biriydi.\n\nSantorini şarapları da en az manzarası kadar etkileyiciydi. Adanın volkanik toprağında yetişen Assyrtiko üzümünden yapılan şaraplar, mineralli ve asidik yapısıyla öne çıkıyor.\n\nSantorini, sadece fotoğraflarda gördüğümüz bir cennet değil, aynı zamanda tüm duyularınızla deneyimlemeniz gereken büyülü bir ada. Romantik bir tatil ya da kendinizi şımartmak için mükemmel bir destinasyon.', 'yunanistan', 'Santorini, Yunanistan, Ada, Gün Batımı, Plaj'),

('Barselona\'da Mimari ve Lezzet Turu', 'İspanya\'nın Katalonya bölgesinin başkenti Barselona, mimari harikalar ve lezzetli yemekleriyle beni kendine hayran bıraktı. Antoni Gaudí\'nin eserleri, canlı sokak hayatı ve Akdeniz mutfağı sayesinde unutulmaz bir seyahat deneyimi yaşadım.\n\nLa Sagrada Familia, şehre ayak bastığım anda görmek istediğim ilk yerdi. Gaudí\'nin bu başyapıtı, içeri girdiğinizde sizi bambaşka bir dünyaya götürüyor. Renkli vitraylardan süzülen ışıklar, kolonlar ve detaylar inanılmaz.\n\nPark Güell, Barselona\'nın panoramik manzarasını sunan, renkli mozaiklerle süslü bir park. Burada Gaudí\'nin mimari dehasını bir kez daha görmek mümkün. Özellikle mozaik kaplı salamander (semender) heykeli, parkın en çok fotoğraflanan köşelerinden biri.\n\nLa Rambla\'da yürümek, şehrin nabzını hissetmenin en iyi yolu. Sokak sanatçıları, çiçekçiler, kafeler ve dükkanlarla dolu bu caddede saatlerce yürüdüm. Boqueria Pazarı\'nda taze meyve suları içtim, İspanyol jamonu tattım.\n\nBarseloneta Plajı\'nda geçirdiğim öğleden sonra, yoğun şehir turundan sonra iyi bir mola oldu. Akdeniz\'in ılık sularında yüzmek ve kumsalda güneşlenmek rahatlatıcıydı.\n\nAkşam yemeği için gittiğim tapas barlarında, İspanyol mutfağının lezzetlerini keşfettim. Patatas bravas, jamón ibérico, pan con tomate ve tabii ki paella... Bunları yerel şaraplar ve sangria eşliğinde tatmak ayrı bir keyifti.\n\nBarselona FC\'nin stadı Camp Nou\'yu ziyaret etmek, futbol tutkunları için muhteşem bir deneyim. Stadyum turu ve müzede, kulübün başarılarla dolu tarihini görmek ilham vericiydi.\n\nBarselona, sanat, mimari, yemek ve deniz ile harmanlanmış bir şehir. Her köşesi keşfedilmeyi bekleyen sürprizlerle dolu. Kesinlikle tekrar ziyaret etmek istediğim bir destinasyon.', 'ispanya', 'Barselona, İspanya, Gaudí, Tapas, Mimari');
