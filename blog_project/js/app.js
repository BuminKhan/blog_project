let isLoggedIn = false;
let isAdmin = false;
let currentUsername = '';
let allPosts = [];


// Kullanıcının giriş durumunu kontrol eden fonksiyon
function checkLoginStatus() {
    fetch('api.php?action=check_auth')
    .then(res => res.json())
    .then(data => {
        isLoggedIn = data.isLoggedIn;
        isAdmin = data.isAdmin;
        currentUsername = data.username;
        updateNavigation();
    });
}

// Admin yetkisini kontrol eden fonksiyon
function checkAdminStatus() {
    fetch('api.php?action=check_auth')
    .then(res => res.json())
    .then(data => {
        isAdmin = data.isAdmin;
        isLoggedIn = data.isLoggedIn;
        updateNavigation();
        
        const accessDenied = document.getElementById('access-denied');
        const adminPanel = document.getElementById('admin-panel');
        
        if (isLoggedIn && isAdmin) {
            accessDenied.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            loadAdminPosts();
        } else {
            accessDenied.classList.remove('hidden');
            adminPanel.classList.add('hidden');
        }
    });
}

// Navigasyon menüsünü güncelleyen fonksiyon
function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const navUl = document.querySelector('nav ul');
    
    const existingAdminLink = document.getElementById('admin-quick-link');
    if (existingAdminLink) {
        existingAdminLink.remove();
    }
    
    if (isLoggedIn) {
        loginLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
        logoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i> Çıkış (${currentUsername})`;
        
        if (isAdmin && !window.location.pathname.includes('admin.html')) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = `<a href="admin.html" id="admin-quick-link"><i class="fas fa-cog"></i> Admin Panel</a>`;
            navUl.insertBefore(adminLi, logoutLink.parentElement);
        }
        
        if (window.location.pathname.includes('admin.html') && !isAdmin) {
            window.location.href = 'index.html';
        }
    } else {
        loginLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
        
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Kullanıcı girişi yapan fonksiyon
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageElement = document.getElementById('login-message');
    
    if (!username || !password) {
        showMessage(messageElement, 'Lütfen kullanıcı adı ve şifre girin.', 'error');
        return;
    }

    fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            isLoggedIn = true;
            isAdmin = data.isAdmin;
            currentUsername = data.username;
            
            showMessage(messageElement, 'Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            setTimeout(() => {
                if (isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showMessage(messageElement, data.message || 'Giriş başarısız!', 'error');
        }
    })
    .catch(err => {
        showMessage(messageElement, 'Bağlantı hatası oluştu.', 'error');
    });
}

// Yeni kullanıcı kaydı yapan fonksiyon
function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const messageElement = document.getElementById('register-message');
    
    if (!username || !password || !passwordConfirm) {
        showMessage(messageElement, 'Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage(messageElement, 'Şifreler eşleşmiyor!', 'error');
        return;
    }

    fetch('api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage(messageElement, data.message || 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', 'success');
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-password-confirm').value = '';
        } else {
            showMessage(messageElement, data.message || 'Kayıt başarısız!', 'error');
        }
    })
    .catch(err => {
        showMessage(messageElement, 'Bağlantı hatası oluştu.', 'error');
    });
}

// Kullanıcı çıkışı yapan fonksiyon
function logout() {
    fetch('api.php?action=logout')
    .then(res => res.json())
    .then(data => {
        isLoggedIn = false;
        isAdmin = false;
        currentUsername = '';
        window.location.href = 'index.html';
    });
}

// Blog yazılarını yükleyen fonksiyon
function loadPosts() {
    const postsContainer = document.getElementById('posts');
    const loadingElement = document.getElementById('blog-loading');
    const noPostsElement = document.getElementById('no-posts');
    
    if (!postsContainer) return; 
    
    fetch('api.php?action=posts')
    .then(res => res.json())
    .then(data => {
        if (loadingElement) loadingElement.classList.add('hidden');
        
        if (data.posts && data.posts.length > 0) {
            allPosts = data.posts;
            postsContainer.innerHTML = '';
            
            data.posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post';
                postElement.dataset.id = post.id;
                

                postElement.dataset.category = post.category; 

                const tagsArray = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];
                const tagsHtml = tagsArray.map(tag => `<span class="post-tag">${tag}</span>`).join('');
                
                const locationHtml = post.category ? 
                    `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</div>` : '';
                
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    ${locationHtml}
                    <div class="post-date">
                        <i class="far fa-calendar-alt"></i> ${post.formatted_date}
                    </div>
                    <div class="post-content">
                        ${getPostExcerpt(post.content, 250)}
                    </div>
                    <div class="post-tags">
                        ${tagsHtml}
                    </div>
                    <div class="post-actions">
                        <a href="#" class="read-more" onclick="viewFullPost(${post.id}); return false;">
                            Devamını Oku <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;
                
                postsContainer.appendChild(postElement);
            });
            
            if (noPostsElement) noPostsElement.classList.add('hidden');
        } else {
            postsContainer.innerHTML = '';
            if (noPostsElement) noPostsElement.classList.remove('hidden');
        }
    })
    .catch(err => {
        if (loadingElement) loadingElement.classList.add('hidden');
        postsContainer.innerHTML = '<p class="error-message">Blog yazıları yüklenirken bir hata oluştu.</p>';
    });
}


function viewFullPost(postId) {
    const post = allPosts.find(p => p.id == postId);
    if (!post) return;
    
    const postsContainer = document.getElementById('posts');
    const relatedPosts = getRelatedPosts(postId, 3);
    
    postsContainer.innerHTML = '';
    
    const postElement = document.createElement('article');
    postElement.className = 'post full-post';
    
    const tagsArray = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];
    const tagsHtml = tagsArray.map(tag => `<span class="post-tag">${tag}</span>`).join('');
    
    const locationHtml = post.category ? 
        `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</div>` : '';
    
    postElement.innerHTML = `
        <h3>${post.title}</h3>
        ${locationHtml}
        <div class="post-date">
            <i class="far fa-calendar-alt"></i> ${post.formatted_date}
        </div>
        <div class="post-content">
            ${post.content.replace(/\n/g, '<br>')}
        </div>
        <div class="post-tags">
            ${tagsHtml}
        </div>
        <div class="post-actions">
            <a href="#" class="read-more" onclick="loadPosts(); return false;">
                <i class="fas fa-arrow-left"></i> Tüm Yazılara Dön
            </a>
        </div>
    `;
    
    postsContainer.appendChild(postElement);
    
    updateRelatedPostsSidebar(relatedPosts);
    
    window.scrollTo(0, 0);
}

// İlgili blog yazılarını getiren fonksiyon
function getRelatedPosts(excludePostId, count) {
    return allPosts
        .filter(post => post.id != excludePostId)
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

// İlgili yazılar kenar çubuğunu güncelleyen fonksiyon
function updateRelatedPostsSidebar(relatedPosts) {
    const popularPostsContainer = document.getElementById('popular-posts');
    if (!popularPostsContainer) return;
    
    popularPostsContainer.innerHTML = '';
    
    if (relatedPosts.length === 0) {
        popularPostsContainer.innerHTML = '<p>İlgili yazı bulunamadı.</p>';
        return;
    }
    
    relatedPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'related-post-item';
        
        postItem.innerHTML = `
            <a href="#" class="related-post-link" onclick="viewFullPost(${post.id}); return false;">
                ${post.title}
            </a>
            <div class="related-post-date">
                <i class="far fa-calendar-alt"></i> ${post.formatted_date}
            </div>
        `;
        
        popularPostsContainer.appendChild(postItem);
    });
}

//Popüler yazıları yan panelde gösteren fonksiyon
function loadPopularPosts() {
    const popularPostsContainer = document.getElementById('popular-posts');
    if (!popularPostsContainer) return;
    
    fetch('api.php?action=posts')
    .then(res => res.json())
    .then(data => {
        if (data.posts && data.posts.length > 0) {
            allPosts = data.posts;
            
            const randomPosts = [...data.posts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            
            popularPostsContainer.innerHTML = '';
            
            randomPosts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'related-post-item';
                
                postItem.innerHTML = `
                    <a href="#" class="related-post-link" onclick="viewFullPost(${post.id}); return false;">
                        ${post.title}
                    </a>
                    <div class="related-post-date">
                        <i class="far fa-calendar-alt"></i> ${post.formatted_date}
                    </div>
                `;
                
                popularPostsContainer.appendChild(postItem);
            });
        } else {
            popularPostsContainer.innerHTML = '<p>Henüz blog yazısı bulunmamaktadır.</p>';
        }
    })
    .catch(err => {
        popularPostsContainer.innerHTML = '<p class="error-message">Popüler yazılar yüklenirken bir hata oluştu.</p>';
    });
}

// Admin panelindeki blog yazılarını yükleyen fonksiyon
function loadAdminPosts() {
    const adminPostsContainer = document.getElementById('admin-posts');
    
    if (!adminPostsContainer) return;
    
    fetch('api.php?action=posts')
    .then(res => res.json())
    .then(data => {
        adminPostsContainer.innerHTML = '';
        
        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post';
                
                const locationHtml = post.category ? 
                    `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</div>` : '';
                
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    ${locationHtml}
                    <div class="post-date">
                        <i class="far fa-calendar-alt"></i> ${post.formatted_date}
                    </div>
                    <div class="post-content">
                        ${getPostExcerpt(post.content, 150)}
                    </div>
                    <div class="post-actions">
                        <button class="btn" onclick="editPost(${post.id})">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                        <button class="btn" onclick="deletePost(${post.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                `;
                
                adminPostsContainer.appendChild(postElement);
            });
        } else {
            adminPostsContainer.innerHTML = '<p>Henüz blog yazısı bulunmamaktadır.</p>';
        }
    })
    .catch(err => {
        adminPostsContainer.innerHTML = '<p class="error-message">Blog yazıları yüklenirken bir hata oluştu.</p>';
    });
}

// Yeni blog yazısı ekleyen fonksiyon
function addPost() {
    if (!isLoggedIn || !isAdmin) {
        alert('Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.');
        return;
    }
    
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('new-post').value.trim();
    const category = document.getElementById('post-category').value.trim();
    const tags = document.getElementById('post-tags').value.trim();
    const postStatus = document.getElementById('post-status');
    
    if (!title || !content) {
        showAdminMessage(postStatus, 'Başlık ve içerik alanları boş bırakılamaz!', 'error');
        return;
    }

    fetch('api.php?action=add_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            content,
            category,
            tags
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showAdminMessage(postStatus, data.message || 'Blog yazısı başarıyla eklendi!', 'success');
            document.getElementById('post-title').value = '';
            document.getElementById('new-post').value = '';
            document.getElementById('post-category').value = '';
            document.getElementById('post-tags').value = '';
            loadAdminPosts(); 
        } else {
            showAdminMessage(postStatus, data.message || 'Blog yazısı eklenirken bir hata oluştu!', 'error');
        }
    })
    .catch(err => {
        showAdminMessage(postStatus, 'Bağlantı hatası oluştu.', 'error');
    });
}

// İletişim formu mesajı gönderen fonksiyon
function sendMessage() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const messageElement = document.getElementById('form-message');
    
    if (!name || !email || !subject || !message) {
        showMessage(messageElement, 'Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    setTimeout(() => {
        showMessage(messageElement, 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.', 'success');
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
    }, 1000);
}

// Blog yazısı özeti oluşturan fonksiyon
function getPostExcerpt(content, maxLength) {
    if (content.length <= maxLength) return content;
    
    let excerpt = content.substring(0, maxLength);
    excerpt = excerpt.substring(0, excerpt.lastIndexOf(' '));
    return excerpt + '...';
}

// Genel mesaj gösterme fonksiyonu
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
    
    setTimeout(() => {
        element.classList.add('fade');
    }, 3000);
}

// Admin paneli mesaj gösterme fonksiyonu
function showAdminMessage(element, message, type) {
    if (!element) return;
    
    element.innerHTML = `<div class="${type}-message">${message}</div>`;
    element.classList.remove('hidden');
    
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

// Blog yazısı düzenleme fonksiyonu
function editPost(postId) {
    if (!isLoggedIn || !isAdmin) {
        alert('Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.');
        return;
    }
    
    fetch(`api.php?action=post&id=${postId}`)
    .then(res => res.json())
    .then(data => {
        if (data.success && data.post) {
            const post = data.post;
            
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-category').value = post.category || '';
            document.getElementById('new-post').value = post.content;
            document.getElementById('post-tags').value = post.tags || '';
            
            const formTitle = document.querySelector('#admin-panel h2:first-of-type');
            formTitle.innerHTML = `<i class="fas fa-edit"></i> Gezi Yazısını Düzenle (ID: ${post.id})`;
            
            const addButton = document.querySelector('#admin-panel button');
            addButton.innerHTML = '<i class="fas fa-save"></i> Değişiklikleri Kaydet';
            addButton.onclick = function() { updatePost(post.id); };
            
            if (!document.getElementById('cancel-edit')) {
                const cancelButton = document.createElement('button');
                cancelButton.id = 'cancel-edit';
                cancelButton.className = 'btn';
                cancelButton.style.marginLeft = '10px';
                cancelButton.innerHTML = '<i class="fas fa-times"></i> İptal';
                cancelButton.onclick = resetPostForm;
                addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
            }
            
            window.scrollTo(0, 0);
        } else {
            alert('Yazı bilgileri alınırken bir hata oluştu.');
        }
    })
    .catch(err => {
        alert('Bağlantı hatası oluştu.');
    });
}

// Blog yazısını güncelleyen fonksiyon
function updatePost(postId) {
    if (!isLoggedIn || !isAdmin) {
        alert('Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.');
        return;
    }
    
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('new-post').value.trim();
    const category = document.getElementById('post-category').value.trim();
    const tags = document.getElementById('post-tags').value.trim();
    const postStatus = document.getElementById('post-status');
    
    if (!title || !content) {
        showAdminMessage(postStatus, 'Başlık ve içerik alanları boş bırakılamaz!', 'error');
        return;
    }

    fetch('api.php?action=update_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            post_id: postId,
            title, 
            content,
            category,
            tags
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showAdminMessage(postStatus, data.message || 'Blog yazısı başarıyla güncellendi!', 'success');
            resetPostForm();
            loadAdminPosts(); 
        } else {
            showAdminMessage(postStatus, data.message || 'Blog yazısı güncellenirken bir hata oluştu!', 'error');
        }
    })
    .catch(err => {
        showAdminMessage(postStatus, 'Bağlantı hatası oluştu.', 'error');
    });
}

function resetPostForm() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-category').value = '';
    document.getElementById('new-post').value = '';
    document.getElementById('post-tags').value = '';
    
    const formTitle = document.querySelector('#admin-panel h2:first-of-type');
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Yeni Gezi Yazısı Ekle';
    
    const updateButton = document.querySelector('#admin-panel button');
    updateButton.innerHTML = '<i class="fas fa-plus"></i> Yazı Ekle';
    updateButton.onclick = addPost;
    
    const cancelButton = document.getElementById('cancel-edit');
    if (cancelButton) {
        cancelButton.parentNode.removeChild(cancelButton);
    }
}

// Blog yazısı silme fonksiyonu
function deletePost(postId) {
    if (!isLoggedIn || !isAdmin) {
        alert('Bu işlemi yapmak için admin yetkisine sahip olmanız gerekiyor.');
        return;
    }
    
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        fetch('api.php?action=delete_post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message || 'Blog yazısı başarıyla silindi.');
                loadAdminPosts(); 
            } else {
                alert(data.message || 'Blog yazısı silinirken bir hata oluştu!');
            }
        })
        .catch(err => {
            alert('Bağlantı hatası oluştu.');
        });
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('related-post-link') && e.target.dataset.category) {
        e.preventDefault();
        filterByCategory(e.target.dataset.category);
    }
});



document.querySelectorAll('.filter-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const category = e.target.dataset.category;
    filterPostsByCategory(category);
  });
});

// Kategori linklerine göre yazıları filtreleme sistemi
document.addEventListener('DOMContentLoaded', function() {
  const categoryLinks = document.querySelectorAll('.related-post-link');
  const postsContainer = document.getElementById('posts');

  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const selectedCategory = this.getAttribute('data-category');

      const posts = postsContainer.querySelectorAll('article.post');

      posts.forEach(post => {
        if (selectedCategory === 'all' || post.dataset.category === selectedCategory) {
          post.style.display = 'block';
        } else {
          post.style.display = 'none';
        }
      });
    });
  });
});

