/* ==========================================================================
   ORBITSPACE // HIGH-DENSITY KEPLERIAN PARTICLE DISK ENGINE (GLOBAL VIEW)
   ========================================================================== */

const SpaceState = {
    realAsteroids: [],
    simulatedAsteroids: [],
    globeInstance: null,
    chartInstance: null // Grafik hafızası
};

const elApiStatus = document.getElementById('api-status');

// --- 🪐 1. INITIALIZE MASTER VIEWPORT ---
const globeContainer = document.getElementById('3d-globe');

function initCoreEngine() {
    SpaceState.globeInstance = Globe()(globeContainer)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .backgroundColor('#000000')
        .showAtmosphere(true)
        .atmosphereColor('#2563eb')
        .atmosphereAltitude(0.25);

    SpaceState.globeInstance.pointOfView({ lat: 20, lng: 0, alt: 4.8 }, 0);
   
    SpaceState.globeInstance.controls().autoRotate = true;
    SpaceState.globeInstance.controls().autoRotateSpeed = 0.2;

    window.addEventListener('resize', () => {
        SpaceState.globeInstance.width(window.innerWidth).height(window.innerHeight);
    });
    SpaceState.globeInstance.width(window.innerWidth).height(window.innerHeight);

    generateHighDensityBelt();
    initAnalyticsChart(); // Grafiği simülasyon verileriyle ateşle
    runPhysicsLoop();
}

// --- 🛠️ 2. HIGH-DENSITY SWARM GENERATOR ---
function generateHighDensityBelt() {
    const totalPoints = 140;
    const tempPoints = [];

    for (let i = 0; i < totalPoints; i++) {
        const step = i / totalPoints;
        const orbitRadius = 0.5 + (step * 2.0);
        const speed = 0.04 / (orbitRadius * 1.3);

        tempPoints.push({
            id: i,
            name: `NEO-VEC // ${5000 + i}`,
            diameter: Math.round(40 + Math.random() * 500),
            missDistance: Math.round(4000000 + Math.random() * 50000000),
            isHazardous: Math.random() > 0.8,
           
            orbitRadius: orbitRadius,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: speed,
            
            // 🎯 KÜRESEL ENLEM KİLİDİ: Eğim açısını -5/+5 yerine -70/+70 dereceye esnettik.
            // Taşlar artık sadece Ekvator çizgisine doluşmayacak, tüm kıtalara yayılacak.
            inclination: (Math.random() * 140) - 70,
           
            lat: 0,
            lng: 0
        });
    }
    SpaceState.simulatedAsteroids = tempPoints;
}

// --- 🎬 3. THE FRAME TICKER (60 FPS ANİMASYON & TIKLAMA DÖNGÜSÜ) ---

  // --- 🎬 3. THE FRAME TICKER (NODE-LOCK BREAKING VERSION) ---
function runPhysicsLoop() {
    SpaceState.simulatedAsteroids.forEach(asteroid => {
        // Her taşın kendi hızında ilerlemesini sağla
        asteroid.angle += asteroid.angularSpeed;
        
        // 1. Boylamı (Doğu-Batı) her taş için benzersiz bir başlangıç ofsetiyle döndür
        asteroid.lng = ((asteroid.angle + (asteroid.id * 17.3)) * (180 / Math.PI)) % 360 - 180;
        
        // 2. 🎯 DÜĞÜM NOKTASINI KIRAN MATEMATİK:
        // Sadece asteroid.angle kullanırsak tüm taşlar aynı boylamda sıfırlanır (Afrika'da toplanır).
        // İçeriye (asteroid.id * 45) gibi bir faz kayması ekleyerek her taşın en tepeye çıkış ve 
        // ekvatoru kesiş noktasını dünyanın bambaşka yerlerine fırlatıyoruz!
        const globalPhase = asteroid.angle + (asteroid.id * 45);
        asteroid.lat = Math.sin(globalPhase) * asteroid.inclination;
    });

    SpaceState.globeInstance
        .pointsData(SpaceState.simulatedAsteroids)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude('orbitRadius')
        .pointColor(d => d.isHazardous ? '#f43f5e' : '#3b82f6')
        .pointRadius(d => Math.max(0.06, d.diameter / 1600))
        .pointLabel(d => `☄️ Vector: ${d.name}<br>Diameter: ${d.diameter}m<br>Status: Click for Telemetry`)
       
        .onPointClick((point) => {
            SpaceState.globeInstance.pointOfView({ lat: point.lat, lng: point.lng, alt: 2.0 }, 1000);
           
            document.getElementById('m-name').textContent = point.name;
            document.getElementById('m-diameter').textContent = `${point.diameter} meters`;
            document.getElementById('m-distance').textContent = `${point.missDistance.toLocaleString()} km`;
           
            const statusNode = document.getElementById('m-status');
            if (point.isHazardous) {
                statusNode.textContent = "CRITICAL RISK / HAZARDOUS";
                statusNode.style.color = "#f43f5e";
            } else {
                statusNode.textContent = "STABLE VECTOR / TRACKED";
                statusNode.style.color = "#10b981";
            }
           
            document.getElementById('asteroid-modal').classList.add('active');
        });

    requestAnimationFrame(runPhysicsLoop);
}

// --- 📊 4. ANALYTICS CHART GENERATOR (SIMÜLASYON VERİSİNE BAĞLI) ---
function initAnalyticsChart() {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;

    const hazardousCount = SpaceState.simulatedAsteroids.filter(a => a.isHazardous).length;
    const stableCount = SpaceState.simulatedAsteroids.length - hazardousCount;

    if (SpaceState.chartInstance) {
        SpaceState.chartInstance.destroy();
    }

    SpaceState.chartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Stable VEC', 'Critical RISK'],
            datasets: [{
                data: [stableCount, hazardousCount],
                backgroundColor: ['#3b82f6', '#f43f5e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            cutout: '70%'
        }
    });
}

// Modalı kapatıp kamerayı geniş açıya geri döndüren dinleyici
document.addEventListener('DOMContentLoaded', () => {
    const modalClose = document.getElementById('close-modal-btn');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            document.getElementById('asteroid-modal').classList.remove('active');
            SpaceState.globeInstance.pointOfView({ lat: 20, lng: 0, alt: 4.8 }, 800);
        });
    }
});

// Ateşle!
initCoreEngine(); 

// --- 📟 AUTOMATIC MATRIX LOG PIPELINE ---
document.addEventListener('DOMContentLoaded', () => {
    const logContainer = document.getElementById('terminal-log-stream');
    if (!logContainer) return;

    const logPool = [
        { text: "CORE_ENG // Synchronizing Keplerian vectors...", type: "info" },
        { text: "NASA_LINK // Stream bandwidth optimized: 1.2 GB/s", type: "success" },
        { text: "RADAR // Background noise filtered (Deep Sky Mode)", type: "info" },
        { text: "ORBIT // Scanning sectors 04 through 19...", type: "info" },
        { text: "TELEMETRY // Checking micro-asteroid density...", type: "info" },
        { text: "GPU_CORE // WebGL frame rate stable at 60 FPS", type: "success" },
        { text: "WARNING // Rate limit safety buffer active", type: "warn" },
        { text: "ANOMALY // Micro-vector deflection detected in Sector-7", type: "warn" },
        { text: "SECURITY // CORS policy validated successfully", type: "success" },
        { text: "DATABASE // Real-time API registry initialized", type: "success" }
    ];

    function addLogLine(text, type) {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const lineEl = document.createElement('div');
        lineEl.className = `log-line log-${type}`;
        lineEl.innerHTML = `[${timeStr}] ${text}`;

        logContainer.appendChild(lineEl);

        setTimeout(() => {
            logContainer.scrollTop = logContainer.scrollHeight;
        }, 10);

        if (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    addLogLine("SYSTEM // Booting tactical orbit interface...", "info");
    setTimeout(() => addLogLine("API_KEY // Personal credentials verified.", "success"), 400);
    setTimeout(() => addLogLine("RADAR_STREAM // Active tracking initiated.", "success"), 800);

    setInterval(() => {
        const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
        
        if (Math.random() > 0.75) {
            addLogLine("CRITICAL // High-diameter vector interception threat!", "crit");
        } else {
            addLogLine(randomLog.text, randomLog.type);
        }
    }, 2500);
});