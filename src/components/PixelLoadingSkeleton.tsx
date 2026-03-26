export default function AnimationPipelineLoader() {
  const steps = ["MODEL", "RIG", "ANIM", "LIGHT", "RENDER", "COMP"];

  return (
    <div style={{
      position: 'fixed', // เปลี่ยนเป็น fixed เพื่อให้อยู่หน้าสุด
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.2)', // พื้นหลังโปร่งใสเล็กน้อยเพื่อให้เห็น UI ด้านหลัง
      backdropFilter: 'blur(4px)', // เพิ่มความเบลอเล็กน้อยให้ดูพรีเมียม
    }}>
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 2px #00ffaa); }
          50% { opacity: 1; filter: drop-shadow(0 0 12px #00ffaa); }
        }

        @keyframes progress-draw {
          0% { stroke-dashoffset: 440; }
          100% { stroke-dashoffset: -440; }
        }

        .pipeline-container {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orbit-path {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(0, 255, 170, 0.1);
          animation: orbit 10s linear infinite;
        }

        .step-node {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="pipeline-container">
        
        {/* 🔄 Orbit Path Line */}
        <div className="orbit-path" />

        {/* 📊 SVG Progress Circle */}
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle
            cx="110" cy="110" r="100"
            fill="none"
            stroke="rgba(0, 255, 170, 0.05)"
            strokeWidth="2"
          />
          <circle
            cx="110" cy="110" r="100"
            fill="none"
            stroke="#00ffaa"
            strokeWidth="3"
            strokeDasharray="150 300"
            style={{ 
                animation: 'progress-draw 4s linear infinite',
                strokeLinecap: 'round'
            }}
          />
        </svg>

        {/* 🧩 Pipeline Nodes */}
        {steps.map((step, i) => {
          const angle = (i / steps.length) * 2 * Math.PI;
          const radius = 100; // รัศมีวงกลม
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <div
              key={step}
              className="step-node"
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y}px)`,
                width: '45px',
                height: '45px',
                background: 'rgba(0, 20, 15, 0.8)',
                border: '1.5px solid #00ffaa',
                borderRadius: '12px', // สี่เหลี่ยมมุมโค้งจะดูเป็น Pipeline Node มากขึ้น
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                animationDelay: `${i * 0.3}s`
              }}
            >
              <span style={{ 
                fontSize: '8px', 
                color: '#00ffaa', 
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              }}>{step}</span>
            </div>
          );
        })}

        {/* 🎬 Center Core */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,170,0.2) 0%, transparent 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0,255,170,0.3)',
          zIndex: 2
        }}>
          <div style={{
             width: '12px',
             height: '12px',
             backgroundColor: '#00ffaa',
             borderRadius: '50%',
             boxShadow: '0 0 15px #00ffaa'
          }} />
        </div>
      </div>

      {/* 📝 Status Text */}
      <div style={{
        marginTop: '30px',
        color: '#00ffaa',
        fontFamily: 'monospace',
        fontSize: '12px',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        opacity: 0.8
      }}>
        Processing Pipeline
      </div>
    </div>
  );
}