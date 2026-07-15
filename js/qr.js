function generateBulkQR() {
    const text = document.getElementById('urlInput').value;
    const size = parseInt(document.getElementById('sizeInput').value);
    const fgColor = document.getElementById('fgColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const qrContainer = document.getElementById('qrContainer');
    const countInfo = document.getElementById('countInfo');
    
    document.getElementById('sizeOutput').value = size;
    qrContainer.innerHTML = ''; // Bersihkan kontainer terdahulu

    // Pisahkan baris teks menjadi array dan hapus baris kosong, batasi maksimal 100
    let links = text.split('\n').map(link => link.trim()).filter(link => link !== '');
    if (links.length > 100) {
        links = links.slice(0, 100);
    }

    countInfo.innerText = `${links.length} / 100 links`;

    links.forEach((link, index) => {
        // Buat elemen pembungkus QR
        const qrItem = document.createElement('div');
        qrItem.className = 'qr-item';

        // Buat elemen canvas untuk QRrious
        const canvas = document.createElement('canvas');
        canvas.id = `qr-${index}`;
        qrItem.appendChild(canvas);

        // Buat teks di bawah QR
        const textLabel = document.createElement('div');
        textLabel.className = 'qr-link-text';
        textLabel.innerText = link.length > 20 ? link.substring(0, 20) + '...' : link;
        qrItem.appendChild(textLabel);

        qrContainer.appendChild(qrItem);

        // Inisialisasi QR Code menggunakan QRrious
        new QRious({
            element: canvas,
            value: link,
            size: size,
            foreground: fgColor,
            background: bgColor,
            level: 'H'
        });
    });
}

// Fungsi untuk mendownload semua QR (Anda bisa melengkapinya menggunakan library JSZip untuk mendownload sekaligus dalam format .zip)
function downloadAllQR() {
    try {
        // 1. Cek apakah library JSZip sudah termuat
        if (typeof JSZip === 'undefined') {
            alert('Library JSZip belum termuat dengan sempurna. Pastikan Anda terhubung ke internet.');
            return;
        }

        const canvases = document.querySelectorAll('#qrContainer canvas');
        
        // 2. Cek apakah ada QR code yang siap didownload
        if (canvases.length === 0) {
            alert('Tidak ada QR Code untuk didownload! Silakan masukkan URL terlebih dahulu.');
            return;
        }

        // Ambil teks input untuk penamaan file otomatis
        const text = document.getElementById('urlInput').value;
        let links = text.split('\n').map(link => link.trim()).filter(link => link !== '');
        if (links.length > 100) links = links.slice(0, 100);

        // 3. Proses pembuatan ZIP
        const zip = new JSZip();
        const qrFolder = zip.folder("qr-codes");

        canvases.forEach((canvas, index) => {
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];
            
            // Penamaan file yang aman dari karakter aneh URL
            let fileName = `qrcode-${index + 1}.png`;
            if (links[index]) {
                let cleanName = links[index].replace(/^(https?:\/\/)?(www\.)?/, '').replace(/[^a-zA-Z0-9]/g, '_');
                if (cleanName.length > 30) cleanName = cleanName.substring(0, 30);
                fileName = `${index + 1}-${cleanName}.png`;
            }

            qrFolder.file(fileName, base64Data, { base64: true });
        });

        // 4. Trigger download zip
        zip.generateAsync({ type: "blob" }).then(function (content) {
            if (typeof saveAs !== 'undefined') {
                saveAs(content, "bulk-qr-codes.zip");
            } else {
                // Fallback jika FileSaver.js gagal dimuat, menggunakan trik element download HTML5
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "bulk-qr-codes.zip";
                link.click();
            }
        });

    } catch (error) {
        console.error("Detail Error Download ZIP:", error);
        alert("Terjadi kesalahan saat membuat file ZIP. Silakan cek Console Browser (F12).");
    }
}