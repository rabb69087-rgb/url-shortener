// সংক্ষিপ্ত লিংক তৈরি করার জন্য র্যান্ডম স্ট্রিং জেনারেট করুন
function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// সব লিংক LocalStorage থেকে পান
function getAllLinks() {
    const links = localStorage.getItem('shortLinks');
    return links ? JSON.parse(links) : {};
}

// নতুন লিংক সেভ করুন
function saveLink(shortCode, data) {
    const links = getAllLinks();
    links[shortCode] = data;
    localStorage.setItem('shortLinks', JSON.stringify(links));
}

// শর্টেনড লিংক তৈরি করুন
function createShortLink() {
    const originalUrl = document.getElementById('originalUrl').value.trim();
    const title = document.getElementById('title').value.trim();
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const description = document.getElementById('description').value.trim();

    // ভ্যালিডেশন
    if (!originalUrl) {
        alert('❌ দয়া করে আসল URL দিন');
        return;
    }

    if (!title) {
        alert('❌ দয়া করে টাইটেল দিন');
        return;
    }

    // ইউআরএল ভ্যালিডেশন
    try {
        new URL(originalUrl);
    } catch (e) {
        alert('❌ অবৈধ URL ফরম্যাট');
        return;
    }

    // ইউনিক শর্ট কোড জেনারেট করুন
    let shortCode;
    const links = getAllLinks();
    do {
        shortCode = generateShortCode();
    } while (links[shortCode]);

    // ডেটা সেভ করুন
    const linkData = {
        originalUrl,
        title,
        imageUrl,
        description,
        shortCode,
        createdAt: new Date().toISOString(),
        clicks: 0
    };

    saveLink(shortCode, linkData);

    // শর্টেনড লিংক দেখান
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    const shortLink = `${baseUrl}?id=${shortCode}`;

    document.getElementById('shortLink').value = shortLink;
    document.getElementById('resultContainer').style.display = 'block';

    // কিউআর কোড জেনারেট করুন
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: shortLink,
        width: 200,
        height: 200
    });

    // ফর্ম ক্লিয়ার করুন
    document.getElementById('originalUrl').value = '';
    document.getElementById('title').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('description').value = '';

    // স্ট্যাটিস্টিকস আপডেট করুন
    updateStats();
}

// ট্যাব স্যুইচ করুন
function showTab(tabName) {
    // সব ট্যাব লুকান
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // সব বাটন আনঅ্যাক্টিভ করুন
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // নির্বাচিত ট্যাব দেখান
    document.getElementById(tabName).classList.add('active');

    // নির্বাচিত বাটন অ্যাক্টিভ করুন
    event.target.classList.add('active');

    // স্ট্যাটিস্টিকস আপডেট করুন
    if (tabName === 'stats') {
        updateStats();
    }
}

// স্ট্যাটিস্টিকস আপডেট করুন
function updateStats() {
    const links = getAllLinks();
    const linkEntries = Object.values(links);

    // মোট লিংক
    document.getElementById('totalLinks').textContent = linkEntries.length;

    // মোট ক্লিক
    const totalClicks = linkEntries.reduce((sum, link) => sum + link.clicks, 0);
    document.getElementById('totalClicks').textContent = totalClicks;

    // লিংক লিস্ট রেন্ডার করুন
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';

    if (linkEntries.length === 0) {
        linksList.innerHTML = '<p class="empty-message">এখনও কোনো লিংক তৈরি করা হয়নি।</p>';
        return;
    }

    linkEntries.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';

        const createdDate = new Date(link.createdAt).toLocaleDateString('bn-BD');

        linkItem.innerHTML = `
            <div class="link-item-header">
                ${link.imageUrl ? `<img src="${link.imageUrl}" alt="${link.title}" class="link-item-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%23999%22>ছবি নেই</text></svg>'">` : '<div class="link-item-image" style="display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #999;">ছবি নেই</div>'}
                <div class="link-item-info">
                    <h4>📌 ${link.title}</h4>
                    <p>${link.description || 'কোনো বর্ণনা নেই'}</p>
                    <div class="link-item-url" title="${link.originalUrl}">🔗 ${link.originalUrl.substring(0, 50)}...</div>
                </div>
            </div>
            <div class="link-item-stats">
                <div class="stat-box">
                    <div class="stat-box-label">তৈরির তারিখ</div>
                    <div class="stat-box-value">${createdDate}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-label">মোট ক্লিক</div>
                    <div class="stat-box-value">${link.clicks}</div>
                </div>
            </div>
            <div class="link-actions">
                <button class="btn-small btn-copy-link" onclick="copyLinkToClipboard('${generateBaseLink()}?id=${link.shortCode}')">📋 কপি করুন</button>
                <button class="btn-small btn-delete" onclick="deleteLink('${link.shortCode}')">🗑️ ডিলিট করুন</button>
            </div>
        `;

        linksList.appendChild(linkItem);
    });
}

// বেস লিংক জেনারেট করুন
function generateBaseLink() {
    const url = new URL(window.location);
    return url.origin + url.pathname;
}

// লিংক কপি করুন ক্লিপবোর্ডে
function copyLinkToClipboard(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ লিংক কপি হয়েছে!');
    }).catch(err => {
        console.error('কপি ব্যর্থ:', err);
    });
}

// সাধারণ কপি ফাংশন
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    alert('✅ কপি হয়েছে!');
}

// লিংক ডিলিট করুন
function deleteLink(shortCode) {
    if (confirm('⚠️ এই লিংকটি ডিলিট করতে চান?')) {
        const links = getAllLinks();
        delete links[shortCode];
        localStorage.setItem('shortLinks', JSON.stringify(links));
        updateStats();
        alert('✅ লিংক ডিলিট হয়েছে');
    }
}

// লিংক রিডিরেক্ট করুন
function redirectToLink(shortCode) {
    const links = getAllLinks();
    const linkData = links[shortCode];

    if (!linkData) {
        alert('❌ লিংক পাওয়া যায়নি');
        return;
    }

    // ক্লিক বৃদ্ধি করুন
    linkData.clicks++;
    saveLink(shortCode, linkData);

    // রিডিরেক্ট পেজ দেখান
    const redirectPage = document.getElementById('redirectPage');
    document.getElementById('redirectTitle').textContent = linkData.title;
    document.getElementById('redirectDescription').textContent = linkData.description || 'আপনি এখন রিডিরেক্ট হবেন...';
    document.getElementById('redirectUrl').textContent = linkData.originalUrl;

    if (linkData.imageUrl) {
        const img = document.getElementById('redirectImage');
        img.src = linkData.imageUrl;
        img.style.display = 'block';
    }

    redirectPage.style.display = 'flex';

    // ৩ সেকেন্ড পর রিডিরেক্ট করুন
    setTimeout(() => {
        window.location.href = linkData.originalUrl;
    }, 3000);
}

// পেজ লোড হলে চেক করুন শর্টকোড আছে কিনা
window.addEventListener('load', () => {
    const url = new URL(window.location);
    const shortCode = url.searchParams.get('id');

    if (shortCode) {
        redirectToLink(shortCode);
    } else {
        // স্ট্যাটিস্টিকস শো করুন
        updateStats();
    }
});

// পেজ ছেড়ে যাওয়ার সময় স্ট্যাটিস্টিকস সেভ করুন
window.addEventListener('beforeunload', () => {
    // ডেটা ইতিমধ্যে সেভ আছে
});
