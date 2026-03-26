export default function AnimationPipelineLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '420px',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:.4; transform:scale(1); }
          50% { opacity:1; transform:scale(1.1); }
        }

        @keyframes flow {
          0% { transform: translateX(0); opacity:0; }
          20% { opacity:1; }
          100% { transform: translateX(120px); opacity:0; }
        }

        @keyframes flow-vert {
          0% { transform: translateY(0); opacity:0; }
          20% { opacity:1; }
          100% { transform: translateY(60px); opacity:0; }
        }

        @keyframes progress {
          0% { width:0%; }
          60% { width:85%; }
          100% { width:0%; }
        }

        .pulse { animation: pulse 2s infinite; }
        .flow { animation: flow 2.2s linear infinite; }
        .flowV { animation: flow-vert 2s linear infinite; }
        .progress { animation: progress 3s ease-in-out infinite; }
      `}</style>

      {/* 🧩 NODE GRAPH */}
      <div style={{ position:'relative', marginBottom:40 }}>

        {/* ASSET */}
        <div className="pulse" style={{
          position:'absolute', left:-120, top:0,
          width:80, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          ASSET
        </div>

        {/* MODEL */}
        <div className="pulse" style={{
          position:'absolute', left:-20, top:0,
          width:80, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          MODEL
        </div>

        {/* RIG */}
        <div className="pulse" style={{
          position:'absolute', left:80, top:0,
          width:80, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          RIG
        </div>

        {/* ANIMATION */}
        <div className="pulse" style={{
          position:'absolute', left:180, top:0,
          width:90, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          ANIMATION
        </div>

        {/* SHOT */}
        <div className="pulse" style={{
          position:'absolute', left:180, top:80,
          width:90, height:40,
          border:'1px solid #ffaa0055',
          borderRadius:8,
          fontSize:10,
          color:'#ffaa00',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          SHOT
        </div>

        {/* LIGHT */}
        <div className="pulse" style={{
          position:'absolute', left:300, top:80,
          width:80, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          LIGHT
        </div>

        {/* RENDER */}
        <div className="pulse" style={{
          position:'absolute', left:400, top:80,
          width:90, height:40,
          border:'1px solid #00ffaa55',
          borderRadius:8,
          fontSize:10,
          color:'#00ffaa',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          RENDER
        </div>

        {/* 🔗 CONNECTIONS */}

        {/* asset -> model */}
        <div style={{ position:'absolute', left:-40, top:20, width:20, height:2, background:'#00ffaa33' }}>
          <div className="flow" style={{ width:6, height:4, background:'#00ffaa' }}/>
        </div>

        {/* model -> rig */}
        <div style={{ position:'absolute', left:60, top:20, width:20, height:2, background:'#00ffaa33' }}>
          <div className="flow" style={{ width:6, height:4, background:'#00ffaa' }}/>
        </div>

        {/* rig -> anim */}
        <div style={{ position:'absolute', left:160, top:20, width:20, height:2, background:'#00ffaa33' }}>
          <div className="flow" style={{ width:6, height:4, background:'#00ffaa' }}/>
        </div>

        {/* anim -> shot (vertical) */}
        <div style={{ position:'absolute', left:225, top:40, width:2, height:40, background:'#ffaa0033' }}>
          <div className="flowV" style={{ width:4, height:6, background:'#ffaa00' }}/>
        </div>

        {/* shot -> light */}
        <div style={{ position:'absolute', left:270, top:100, width:30, height:2, background:'#00ffaa33' }}>
          <div className="flow" style={{ width:6, height:4, background:'#00ffaa' }}/>
        </div>

        {/* light -> render */}
        <div style={{ position:'absolute', left:380, top:100, width:20, height:2, background:'#00ffaa33' }}>
          <div className="flow" style={{ width:6, height:4, background:'#00ffaa' }}/>
        </div>

      </div>

      {/* 📊 Progress */}
      <div style={{
        width:300,
        height:6,
        border:'1px solid #00ffaa33',
        borderRadius:999,
        overflow:'hidden',
        marginBottom:12
      }}>
        <div className="progress" style={{
          height:'100%',
          background:'linear-gradient(90deg,#003322,#00ffaa,#003322)'
        }}/>
      </div>

      {/* 🧠 STATUS */}
      <div style={{
        fontFamily:'monospace',
        fontSize:11,
        color:'#00ffaa',
        letterSpacing:'0.2em'
      }}>
        PROCESSING SHOT / ASSET PIPELINE...
      </div>

    </div>
  );
}