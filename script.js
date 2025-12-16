// ===============================================
// === ⚠️ 1. FIREBASE CONFIGURATION (MODUL SINTAKSISSIZ) ===
// ===============================================

// Sizning web app konfiguratsiyangiz
const firebaseConfig = {
  apiKey: "AIzaSyBrMKJ4MPilQg6gZsaE-Hlqlgo5F4Q8IsM",
  authDomain: "xabar-tizimi.firebaseapp.com",
  databaseURL: "https://xabar-tizimi-default-rtdb.firebaseio.com", // RTDB uchun
  projectId: "xabar-tizimi",
  storageBucket: "xabar-tizimi.firebasestorage.app",
  messagingSenderId: "3947028451",
  appId: "1:3947028451:web:a064cb657fcf28f6520ad6",
  measurementId: "G-RCMHD7ZPNJ"
};

// Firebase va Database'ni ishga tushirish
// firebase global obyektini ishlatamiz, chunki u index.html da yuklangan
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();


// ===============================================
// === 2. ASOSIY ELEMENTLAR ===
// ===============================================
const editor = document.getElementById('code-editor');
const resultIframe = document.getElementById('result-iframe');
const shareLinkOutput = document.getElementById('share-link-output');
const header = document.querySelector('header');
const editorPanel = document.querySelector('.panel.editor');


// --- 1. Kodni ishga tushirish funksiyasi (Ishlashi kafolatlandi) ---
function runCode() {
    const code = editor.value;
    resultIframe.srcdoc = code;
}

// --- 2. FIREBASE ORQALI KODNI SAQLASH VA HAVOLA OLISH FUNKSIYASI ---
async function saveAndGetFirebaseLink() {
    const code = editor.value;

    if (code.trim() === '') {
        alert("Saqlash uchun kod maydoni bo'sh bo'lmasligi kerak.");
        return;
    }

    try {
        // Realtime Database'ga yangi yozuv yaratish
        const newRef = database.ref('snippets').push();
        
        // Ma'lumotni saqlash
        await newRef.set({
            code: code,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        const snippetId = newRef.key; // Avtomatik yaratilgan kalitni olish
        
        // Natija rejimini ishga tushirish uchun ?id= [ID] parametrini qo'shish
        const newUrl = `${window.location.origin}${window.location.pathname}?id=${snippetId}`;

        // Havolani kiritish maydoniga joylash va ko'rsatish
        shareLinkOutput.value = newUrl;
        shareLinkOutput.style.display = 'block'; 
        shareLinkOutput.select();
        shareLinkOutput.setSelectionRange(0, 99999);

        // Nusxalash logikasi
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(newUrl).then(() => {
                alert(`✅ Kod Firebase'ga saqlandi! Havola nusxalandi (ID: ${snippetId}).`);
            }).catch(() => {
                alert(`🔗 Kod saqlandi (ID: ${snippetId}). Iltimos, pastdagi maydondan havolani qo'lda nusxalang.`);
            });
        } else {
             alert(`🔗 Kod saqlandi (ID: ${snippetId}). Iltimos, pastdagi maydondan havolani qo'lda nusxalang.`);
        }

    } catch (e) {
        console.error("Firebase'ga saqlashda xatolik:", e);
        alert("❌ Kodingizni saqlashda xatolik yuz berdi. (Konsolni tekshiring. Firebase qoidalarini ham tekshiring!)");
    }
}

// --- 3. URL manzilidagi kodni o'qish va yuklash funksiyasi (Firebase RTDB'dan o'qish) ---
async function loadCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const snippetId = urlParams.get('id'); // Firebase ID'ni tekshirish

    if (snippetId) {
        try {
            // Firebase'dan ma'lumotni olish
            const snapshot = await database.ref(`snippets/${snippetId}`).once('value');

            if (snapshot.exists()) {
                const decodedCode = snapshot.val().code;
                
                // Toza Natija Rejimi: Faqat kodni butun sahifaga yuklash
                if (editorPanel) editorPanel.style.display = 'none';
                if (header) header.style.display = 'none';
                
                document.body.innerHTML = decodedCode;
                document.body.style.margin = '0';
                document.body.style.padding = '0';
                
                console.log(`Kod Firebase'dan muvaffaqiyatli yuklandi (ID: ${snippetId}).`);
                return; 
            } else {
                alert("Kod topilmadi yoki yaroqsiz ID. Tahrirlash rejimiga qaytildi.");
            }
        } catch (e) {
            console.error("Firebase'dan kodni yuklashda xatolik:", e);
            alert("❌ Kodni yuklashda xatolik yuz berdi. (Konsolni tekshiring.)");
        }
    } 
    
    // Agar ID bo'lmasa yoki yuklashda xato bo'lsa, Tahrirlash rejimida namuna kodni yuklash
    if (!editor.value) {
        editor.value = `<h1>Salom, Bu mening Firebase Snip Loyiham!</h1>
<p>Kodni o'zgartiring va "Save & Get Link"ni bosing.</p>
<style>
  h1 { color: green; }
</style>`;
        runCode(); 
    }
}

// --- 4. Telefon/Kompyuter faylidan kodni yuklash funksiyasi (O'zgarishsiz) ---
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        editor.value = e.target.result;
        runCode(); 
        shareLinkOutput.style.display = 'none';
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi.`);
    };

    reader.readAsText(file);
}

// Sahifa yuklanganda kodni yuklash
window.onload = loadCodeFromUrl;
