export default function Preview({ iframeRef }) {
  return (
    <div className="panel-right">
      <div className="preview-header">
        <div style={{display:'flex', alignItems:'center', gap:5}}>
          <div className="preview-dot"/>
          <span>Live Preview แสดงผลเรียลไทม์</span>
        </div>
        <span style={{fontSize:'0.65rem', background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:'4px'}}>
          Iframe Sandbox
        </span>
      </div>
      <div className="preview-frame">
        <iframe ref={iframeRef} title="Valentine Sandbox Live view" allow="autoplay" />
      </div>
    </div>
  );
}
