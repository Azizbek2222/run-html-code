const editor = document.getElementById('code-editor');
const resultIframe = document.getElementById('result-iframe');
const shareLinkOutput = document.getElementById('share-link-output');

// --- 1. Kodni ishga tushirish funksiyasi ---
function runCode() {
    const code = editor.value;
    resultIframe.srcdoc = code;
}

// --- 2. URL manzilidagi kodni o'qish va yuklash funksiyasi ---
function loadCodeFromUrl() {
    if (window.location.hash) {
        try {
            const encoded = window.location.hash.substring(1);
            
            // Base64 dan decode (ochish)
            const decodedCode = atob(encoded);

            editor.value = decodedCode;
            runCode();
            
            console.log("Kod URL orqali muvaffaqiyatli yuklandi.");
        } catch (e) {
            console.error("Kodni decode qilishda xatolik yuz berdi:", e);
            // alert("Ushbu havola yaroqsiz kodni o'z ichiga olgan."); // Agar xohlamasangiz, bu qatorni o'chirishingiz mumkin
        }
    } else {
        // Agar havola bo'sh bo'lsa, muharrirga namuna kodni yuklash
        editor.value = `<h1>Salom, Bu mening HTML Snip Loyiham!</h1>
<p>Natijani ko'rish uchun "Run"ni bosing.</p>
<style>
  h1 { color: red; }
</style>
<script>
    console.log("Skript ishlayapti");
</\script>`;
        runCode(); 
    }
}

// --- 3. Ulashish uchun havola yaratish funksiyasi (Tuzatilgan) ---
function getShareLink() {
    const code = editor.value;
    const encoded = btoa(code);
    
    // Yangi URL manzilini # belgisidan keyin kodlangan ma'lumot bilan yaratish
    const newUrl = `${window.location.origin}${window.location.pathname}#${encoded}`;

    // Brauzer manzil satrini yangilash
    window.history.pushState(null, '', newUrl);

    // Havolani kiritish maydoniga joylash
    shareLinkOutput.value = newUrl;
    shareLinkOutput.style.display = 'block'; // Maydonni ko'rsatish
    
    // Modern Clipboard API yordamida nusxalash
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(newUrl).then(() => {
            alert("✅ Ulashish havolasi yaratildi va nusxalandi! Manzil satrida ham mavjud.");
        }).catch(err => {
            // Agar nusxalashda xato bo'lsa (xavfsizlik cheklovlari)
            console.error('Nusxalashda xatolik yuz berdi (Clipboard API):', err);
            shareLinkOutput.select();
            document.execCommand('copy');
            alert("🔗 Havola yaratildi. Uni pastdagi maydondan qo'lda nusxalang yoki manzil satrini ishlating.");
        });
    } else {
        // Eski brauzerlar uchun zaxira usuli
        shareLinkOutput.select();
        try {
            document.execCommand('copy');
            alert("✅ Ulashish havolasi yaratildi va nusxalandi! Manzil satrida ham mavjud.");
        } catch (err) {
            alert("🔗 Havola yaratildi. Uni pastdagi maydondan qo'lda nusxalang yoki manzil satrini ishlating.");
        }
    }
}


// --- 4. Telefon/Kompyuter faylidan kodni yuklash funksiyasi ---
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    
    // Fayl o'qib bo'lingach
    reader.onload = (e) => {
        // Muharrirga fayl ichidagi matnni joylash
        editor.value = e.target.result;
        runCode(); // Koddni darhol ishga tushirish
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi.`);
    };

    // Faylni matn sifatida o'qish
    reader.readAsText(file);
}

// Sahifa yuklanganda kodni URL dan avtomatik yuklash
window.onload = loadCodeFromUrl;
