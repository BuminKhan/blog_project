<?php
// Oturum başlatma ve JSON yanıt tipi ayarlama
session_start();
header('Content-Type: application/json');
require 'db.php';

// Gelen JSON verisini ve action parametresini alma
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// Kullanıcı girişi işlemi - Kullanıcı adı ve şifre kontrolü yapılır
if ($action == 'login') {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();

    // Şifre kontrolü ve oturum bilgilerinin kaydedilmesi
    if ($user && md5($input['password']) == $user['password']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = $user['is_admin'];
        echo json_encode(['success' => true, 'isAdmin' => $user['is_admin'], 'username' => $user['username']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Kullanıcı adı veya şifre yanlış.']);
    }

// Yeni kullanıcı kaydı işlemi - Kullanıcı adı kontrolü ve yeni kayıt oluşturma
} elseif ($action == 'register') {
    // Kullanıcı adının daha önce alınıp alınmadığını kontrol et
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Bu kullanıcı adı zaten alınmış.']);
        exit;
    }
    
    // Yeni kullanıcı kaydı oluştur
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$input['username'], md5($input['password'])]);
        echo json_encode(['success' => true, 'message' => 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Kayıt sırasında bir hata oluştu.']);
    }

// Kullanıcı oturum durumu kontrolü - Aktif oturum ve yetki bilgilerini döndürür
} elseif ($action == 'check_auth') {
    $isLoggedIn = isset($_SESSION['user_id']);
    $isAdmin = $_SESSION['is_admin'] ?? false;
    $username = $_SESSION['username'] ?? '';
    
    echo json_encode([
        'isLoggedIn' => $isLoggedIn,
        'isAdmin' => $isAdmin,
        'username' => $username
    ]);

// Kullanıcı çıkışı işlemi - Oturum bilgilerini temizler
} elseif ($action == 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);

// Tüm blog yazılarını getirme işlemi - Yazıları tarih sırasına göre listeler
} elseif ($action == 'posts') {
    $stmt = $pdo->query("SELECT id, title, content, category, tags, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') AS formatted_date 
                         FROM posts ORDER BY created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['posts' => $posts]);

// Tek bir blog yazısını getirme işlemi - ID'ye göre yazı detaylarını getirir
} elseif ($action == 'post') {
    if (!isset($_GET['id'])) {
        echo json_encode(['success' => false, 'message' => 'Yazı ID bilgisi gereklidir.']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT id, title, content, category, tags, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') AS formatted_date 
                          FROM posts WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Yazı bulunamadı.']);
        exit;
    }
    
    echo json_encode(['success' => true, 'post' => $post]);

// Kategoriye göre blog yazılarını getirme işlemi - Seçilen kategoriye ait yazıları listeler
} elseif ($action == 'posts_by_category') {
    if (!isset($_GET['category'])) {
        echo json_encode(['success' => false, 'message' => 'Kategori bilgisi gereklidir.']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT id, title, content, category, tags, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') AS formatted_date 
                          FROM posts WHERE category = ? ORDER BY created_at DESC");
    $stmt->execute([$_GET['category']]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'posts' => $posts]);

// Yeni blog yazısı ekleme işlemi - Admin yetkisi kontrolü ve yeni yazı oluşturma
} elseif ($action == 'add_post') {
    // Admin yetkisi kontrolü
    if (!($_SESSION['is_admin'] ?? false)) {
        echo json_encode(['success' => false, 'message' => 'Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.']);
        exit;
    }
    
    // Zorunlu alanların kontrolü
    if (empty($input['title']) || empty($input['content'])) {
        echo json_encode(['success' => false, 'message' => 'Başlık ve içerik alanları boş bırakılamaz.']);
        exit;
    }
    
    // Opsiyonel alanların kontrolü
    $category = !empty($input['category']) ? $input['category'] : null;
    $tags = !empty($input['tags']) ? $input['tags'] : null;
    
    // Yeni yazıyı veritabanına ekle
    $stmt = $pdo->prepare("INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)");
    $stmt->execute([$input['title'], $input['content'], $category, $tags]);
    echo json_encode(['success' => true, 'message' => 'Blog yazısı başarıyla eklendi.']);

// Blog yazısı güncelleme işlemi - Admin yetkisi kontrolü ve mevcut yazıyı güncelleme
} elseif ($action == 'update_post') {
    // Admin yetkisi kontrolü
    if (!($_SESSION['is_admin'] ?? false)) {
        echo json_encode(['success' => false, 'message' => 'Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.']);
        exit;
    }
    
    // Zorunlu alanların kontrolü
    if (empty($input['post_id']) || empty($input['title']) || empty($input['content'])) {
        echo json_encode(['success' => false, 'message' => 'Yazı ID, başlık ve içerik alanları boş bırakılamaz.']);
        exit;
    }
    
    // Opsiyonel alanların kontrolü
    $category = !empty($input['category']) ? $input['category'] : null;
    $tags = !empty($input['tags']) ? $input['tags'] : null;
    
    // Yazıyı güncelle
    $stmt = $pdo->prepare("UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?");
    $result = $stmt->execute([$input['title'], $input['content'], $category, $tags, $input['post_id']]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Blog yazısı başarıyla güncellendi.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Yazı güncellenirken bir hata oluştu.']);
    }

// Blog yazısı silme işlemi - Admin yetkisi kontrolü ve yazıyı silme
} elseif ($action == 'delete_post') {
    // Admin yetkisi kontrolü
    if (!($_SESSION['is_admin'] ?? false)) {
        echo json_encode(['success' => false, 'message' => 'Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.']);
        exit;
    }
    
    // Yazı ID kontrolü
    if (!isset($input['post_id'])) {
        echo json_encode(['success' => false, 'message' => 'Silinecek yazı ID bilgisi gereklidir.']);
        exit;
    }
    
    // Yazıyı sil
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->execute([$input['post_id']]);
    
    echo json_encode(['success' => true, 'message' => 'Blog yazısı başarıyla silindi.']);

// Geçersiz işlem durumu - Tanımlanmamış action parametresi
} else {
    echo json_encode(['success' => false, 'message' => 'Geçersiz işlem.']);
}
?>
