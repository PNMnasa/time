import { feature } from "https://cdn.skypack.dev/topojson-client@3";
import * as d3 from "https://cdn.skypack.dev/d3@7";

import * as luxonModule from "https://cdn.skypack.dev/luxon@3";
window.luxon = luxonModule;

const width = 960;
const height = 500;

const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

const pathGenerator = d3.geoPath().projection(projection);
const tooltip = d3.select("#tooltip");

let activeTimeZone = null;

// File bản đồ múi giờ thế giới chuẩn, gọn nhẹ
const mapUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

d3.json(mapUrl).then(topology => {
    // Chuyển đổi dữ liệu từ dạng TopoJSON sang GeoJSON để D3 vẽ được
    const countries = feature(topology, topology.objects.countries);

    // Vẽ bản đồ
    svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("class", "timezone-path")
        .on("mouseover", function (event, d) {
            // Nhận diện múi giờ mặc định dựa trên quốc gia 
            activeTimeZone = mangMuiGioQuocGia(d.id) || "UTC";

            tooltip.style("display", "block");
            updateTooltip(event);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 15) + "px");
        })
        .on("mouseout", function () {
            activeTimeZone = null;
            tooltip.style("display", "none");
        });

}).catch(error => {
    console.error("Lỗi khi tải dữ liệu bản đồ:", error);
});

// Hàm phụ trợ để map mã quốc gia (ID) sang Múi giờ tương ứng
function mangMuiGioQuocGia(id) {
    const map = {
        "704": "Asia/Ho_Chi_Minh", // Việt Nam
        "840": "America/New_York", // Mỹ
        "156": "Asia/Shanghai",    // Trung Quốc
        "392": "Asia/Tokyo",       // Nhật Bản
        "250": "Europe/Paris",     // Pháp
        "826": "Europe/London",    // Anh
        "036": "Australia/Sydney"  // Úc
    };
    return map[id] || "Asia/Ho_Chi_Minh"; 
}

function updateTooltip(event) {
    if (!activeTimeZone) return;
    try {
        const localTime = window.luxon ? window.luxon.DateTime.now().setZone(activeTimeZone) : null;

        if (!localTime) return;

        const timeString = localTime.toFormat("HH:mm:ss");
        const dateString = localTime.toFormat("dd/MM/yyyy");
        const offsetString = localTime.toFormat("ZZZZ");

        tooltip.html(`
                <strong>Múi giờ vùng:</strong> ${activeTimeZone}<br/>
                <strong>Giờ hiện tại:</strong> <span style="color:#60a5fa">${timeString}</span><br/>
                <strong>Ngày:</strong> ${dateString} (${offsetString})
            `);

        console.log("lmao");
            
        // Chỉ cập nhật vị trí nếu có event truyền vào (tránh lỗi khi chạy bằng setInterval)
        if (event && event.pageY && event.pageX) {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 15) + "px");
        }
    } catch (e) {
        tooltip.html(`<strong>Múi giờ:</strong> ${activeTimeZone}`);
    }
}

// Cập nhật lại thời gian mỗi giây khi đang hover
setInterval(() => {
    if (activeTimeZone) updateTooltip();
}, 1000);