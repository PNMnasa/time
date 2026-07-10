const COOLDOWN_TIME = 5 * 60 * 1000;
let isCooldown = false;
let currentAdScript = null;

function loadAdScript() {
    if (isCooldown) return;

    console.log("Nạp Ads và sẵn sàng kích hoạt cho cú click tiếp theo...");

    currentAdScript = document.createElement('script');
    currentAdScript.src = 'https://missiondifferentyawn.com/df/20/d5/df20d596ad76e18d1266038c7e9ff72b.js';
    currentAdScript.id = 'adsterra-script';
    document.body.appendChild(currentAdScript);

    window.addEventListener('click', handleAdClick, { once: true });
}

function handleAdClick() {
    isCooldown = true;
    console.log("Ads đã nổ! Bắt đầu tính thời gian delay khóa Ads...");

    setTimeout(() => {
        if (currentAdScript) {
            currentAdScript.remove();
            const adContainers = document.querySelectorAll('iframe[src*="effectivecpmnetwork"], div[id*="adsterra"]');
            adContainers.forEach(el => el.remove());
        }
    }, 500);

    setTimeout(() => {
        isCooldown = false;
        loadAdScript();
    }, COOLDOWN_TIME);
}

loadAdScript();