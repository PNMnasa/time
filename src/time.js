async function layGioSieuChuanCloudflare() {
    const totalAttempts = 3; // Thử 3 lần để lấy RTT thấp nhất
    let bestResult = null;

    for (let i = 0; i < totalAttempts; i++) {
        try {
            const t1 = Date.now();

            const response = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
            const text = await response.text();

            const t2 = Date.now();

            // Trích xuất timestamp
            const lines = text.split("\n");
            const tsLine = lines.find(line => line.startsWith("ts="));
            if (!tsLine) continue;

            const tApi = parseFloat(tsLine.split("=")[1]) * 1000;
            const rtt = t2 - t1;
            const estimatedLatency = rtt / 2;
            const timeOffset = (tApi + estimatedLatency) - t2;
            const maxError = rtt / 2;

            // Lưu lại kết quả có RTT nhỏ nhất (sai số ít nhất)
            if (!bestResult || rtt < bestResult.rtt) {
                bestResult = {
                    rtt,
                    timeOffset,
                    maxError,
                    getTrueTime: () => Date.now() + timeOffset
                };
            }

            // Chờ một chút trước khi thử lần tiếp theo (tránh bị rate limit)
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            console.error(`Lỗi lần thử thứ ${i + 1}:`, error);
        }
    }

    if (!bestResult) {
        throw new Error("Không thể đồng bộ thời gian với Cloudflare sau nhiều lần thử.");
    }

    return bestResult;
}

async function run() {
    console.log("Đang đồng bộ thời gian...");
    
    // Gọi hàm và nhận object kết quả return
    const clockSync = await layGioSieuChuanCloudflare();

    console.log(` Đồng bộ thành công!`);
    console.log(`- RTT tốt nhất: ${clockSync.rtt}ms`);
    console.log(`- Độ lệch máy khách (Offset): ${clockSync.timeOffset.toFixed(2)}ms`);
    console.log(`- Sai số tối đa do lệch đường truyền: ±${clockSync.maxError.toFixed(2)}ms`);

    // Sử dụng hàm getTrueTime() bất cứ khi nào cần lấy giờ chuẩn
    setInterval(() => {
        const gioMayTinh = new Date();
        const gioChuan = new Date(clockSync.getTrueTime());

        console.log(`Giờ máy: ${gioMayTinh.toLocaleTimeString()} | Giờ siêu chuẩn Cloudflare: ${gioChuan.toLocaleTimeString()}`);
    }, 2000);
}

run();