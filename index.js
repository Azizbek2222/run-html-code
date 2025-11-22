import { addBalance } from './balance.js';

// AdsGram init
const AdController = window.Adsgram.init({
    blockId: "int-17980"  // ❗ AdsGram blockId
});

// Tugma bosilganda reklama
document.getElementById('showAdBtn').addEventListener('click', () => {
    AdController.show()
    .then(result => {
        if(result.done && !result.error){
            addBalance(0.02); // foydalanuvchi balansini yangilash
            alert("💰 0.02 RUB qo‘shildi!");
        } else {
            alert("Reklama tugamadi!");
        }
    })
    .catch(err => console.log("Ads error:", err));
});

// AdsGram serveri reward callback
adsgram.onReward(() => {
    console.log("AdsGram reward: foydalanuvchi uchun pul qo‘shildi (server tarafdan)");
});
