const editor = document.getElementById('code-editor');
const resultIframe = document.getElementById('result-iframe');
const shareLinkOutput = document.getElementById('share-link-output');
const container = document.querySelector('.container');
const header = document.querySelector('header');
const editorPanel = document.querySelector('.panel.editor');
const resultPanel = document.querySelector('.panel.result');


// --- 1. Kodni ishga tushirish funksiyasi ---
function runCode() {
    const code = editor.value;
    resultIframe.srcdoc = code;
}

// --- 2. URL manzilidagi kodni o'qish va yuklash funksiyasi (Yangilangan) ---
function loadCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const isRunMode = urlParams.get('run') === 'true'; // ?run=true parametrini tekshirish

    if (window.location.hash) {
        try {
            const encoded = window.location.hash.substring(1);
            const decodedCode = atob(encoded);

            if (isRunMode) {
                // Toza Natija Rejimi: Faqat natijani ko'rsatish
                editorPanel.style.display = 'none'; // Muharrirni yashirish
                header.style.display = 'none'; // Sarlavhani yashirish
                
                // Natija maydonini to'liq ekranga yoyish
                resultPanel.style.width = '100vw'; 
                resultPanel.style.height = '100vh';
                resultPanel.style.margin = '0';
                resultPanel.style.borderRadius = '0';
                resultPanel.style.boxShadow = 'none';
                container.style.gap = '0';
                container.style.margin = '0';
                container.style.maxWidth = 'none';

                // Natija sarlavhasini ham yashirish (agar kerak bo'lsa, CSSda ham to'g'rilash mumkin)
                resultPanel.querySelector('h2').style.display = 'none';

                // Kodni to'g'ridan-to'g'ri butun brauzer oynasiga yuklash
                document.body.innerHTML = decodedCode;

                // Muharrirga yuklashni o'chirib qo'yamiz, chunki butun sahifa o'zgaradi
                return; 
            }

            // Tahrirlash Rejimi: Kodni muharrirga yuklash
            editor.value = decodedCode;
            runCode();
            
            console.log("Kod URL orqali muvaffaqiyatli yuklandi.");
        } catch (e) {
            console.error("Kodni decode qilishda xatolik yuz berdi:", e);
        }
    } else {
        // Havola bo'sh bo'lsa, namuna kodni yuklash
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

// --- 3. Ulashish uchun havola yaratish funksiyasi (Yangilangan) ---
function getShareLink() {
    const code = editor.value;
    const encoded = btoa(code);
    
    // Natija rejimini ishga tushirish uchun ?run=true parametrini qo'shib, URL yaratish
    const newUrl = `${window.location.origin}${window.location.pathname}?run=true#${encoded}`;

    // Brauzer manzil satrini yangilash (Bu faqat muharrir rejimida qulay bo'lishi uchun)
    window.history.pushState(null, '', newUrl);

    // Havolani kiritish maydoniga joylash
    shareLinkOutput.value = newUrl;
    shareLinkOutput.style.display = 'block'; 
    
    // Modern Clipboard API yordamida nusxalash
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(newUrl).then(() => {
            alert("✅ Ulashish havolasi yaratildi va nusxalandi! Endi u faqat natijani ko'rsatadi.");
        }).catch(err => {
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
            alert("✅ Ulashish havolasi yaratildi va nusxalandi! Endi u faqat natijani ko'rsatadi.");
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
    
    reader.onload = (e) => {
        editor.value = e.target.result;
        runCode(); 
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi.`);
    };

    reader.readAsText(file);
}

// Sahifa yuklanganda kodni URL dan avtomatik yuklash
window.onload = loadCodeFromUrl;
