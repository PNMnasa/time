// Múi giờ mặc định cho đồng hồ thứ 2 khi vừa tải trang
let currentSelectedTimezone = "Europe/London"; 

function updateClocks() {
    const now = new Date();

    // 1. Cập nhật Đồng hồ địa phương (Lấy cấu hình tự động từ máy người dùng)
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('local-tz').textContent = localTz;
    
    document.getElementById('local-time').textContent = now.toLocaleTimeString('vi-VN', { 
        hour12: false 
    });
    document.getElementById('local-date').textContent = now.toLocaleDateString('vi-VN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // 2. Cập nhật Đồng hồ vùng được chọn từ bản đồ
    try {
        document.getElementById('selected-tz').textContent = currentSelectedTimezone;
        
        document.getElementById('selected-time').textContent = now.toLocaleTimeString('vi-VN', { 
            timeZone: currentSelectedTimezone,
            hour12: false 
        });
        
        document.getElementById('selected-date').textContent = now.toLocaleDateString('vi-VN', { 
            timeZone: currentSelectedTimezone,
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    } catch (error) {
        // Phòng trường hợp ID múi giờ từ bản đồ truyền vào bị sai cấu trúc
        console.error("Múi giờ không hợp lệ:", currentSelectedTimezone);
    }
}

// Chạy hàm cập nhật mỗi giây (1000 mili-giây)
setInterval(updateClocks, 1000);

// Chạy ngay lập tức lần đầu để tránh bị trễ 1 giây hiển thị "00:00:00" khi load trang
updateClocks(); 

/**
 * HÀM SỰ KIỆN: Kết nối với bản đồ TopoJSON
 * Sau này khi viết code bản đồ, tại sự kiện click vào một vùng, bạn chỉ cần gọi:
 * changeTargetTimezone(d.properties.tzid);
 */
function changeTargetTimezone(newTimezone) {
    currentSelectedTimezone = newTimezone;
    updateClocks(); // Ép đồng hồ cập nhật giao diện ngay lập tức thay vì đợi giây tiếp theo
}