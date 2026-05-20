export const THEMES = {
  pink:   { name:'🩷 Pink Dream',  bg:'#fff0f3', card:'#ffffff', accent:'#ff6b9d', text:'#5c2a3a', btn:'#ff6b9d', yes:'#52b788', no:'#e05c6f' },
  red:    { name:'❤️ Deep Red',    bg:'#fff5f5', card:'#ffffff', accent:'#e63462', text:'#4a0a1a', btn:'#e63462', yes:'#2d9b5c', no:'#c0392b' },
  purple: { name:'💜 Violet Dusk', bg:'#f5f0ff', card:'#ffffff', accent:'#9b59b6', text:'#2c1a4a', btn:'#9b59b6', yes:'#27ae60', no:'#8e44ad' },
  blue:   { name:'💙 Ocean Blue',  bg:'#f0f7ff', card:'#ffffff', accent:'#3498db', text:'#0a2a4a', btn:'#3498db', yes:'#27ae60', no:'#2980b9' },
  dark:   { name:'🖤 Midnight',    bg:'#0d0d1a', card:'#1a1a2e', accent:'#ff6b9d', text:'#f0d0ff', btn:'#ff6b9d', yes:'#52b788', no:'#e05c6f' },
  sakura: { name:'🌸 Sakura',      bg:'#fef6f9', card:'#fff9fb', accent:'#e8739a', text:'#4a2030', btn:'#e8739a', yes:'#5cb85c', no:'#d9534f' },
};

export const SWATCHES = ['#ff6b9d','#e63462','#9b59b6','#3498db','#52b788','#f1c40f','#e67e22','#34495e','#ffffff','#000000'];

export const FONTS = [
  { value:'Mali', label:'Mali (ลายมือ)' },
  { value:'Mitr', label:'Mitr (ไม่มีหัว)' },
  { value:'Sarabun', label:'Sarabun (ทางการ)' },
  { value:'Kanit', label:'Kanit (โมเดิร์น)' },
  { value:'Charm', label:'Charm (น่ารักหวาน)' },
  { value:'Itim', label:'Itim (ตัวกลมเด็กรัก)' },
  { value:'Prompt', label:'Prompt (เรียบเก๋)' },
];

export const ANIMATIONS = [
  { id:'none',      icon:'⬜', label:'ไม่มี' },
  { id:'fadeIn',    icon:'🌅', label:'Fade In' },
  { id:'slideUp',   icon:'⬆️', label:'Slide Up' },
  { id:'slideDown', icon:'⬇️', label:'Slide Down' },
  { id:'zoomIn',    icon:'🔍', label:'Zoom In' },
  { id:'bounce',    icon:'🏀', label:'Bounce' },
  { id:'shake',     icon:'🫨', label:'Shake' },
  { id:'heartbeat', icon:'💓', label:'Heartbeat' },
  { id:'float',     icon:'🎈', label:'Float' },
  { id:'sparkle',   icon:'✨', label:'Sparkle' },
  { id:'typewriter',icon:'⌨️', label:'Typewriter' },
];

export const PAGE_EFFECTS = [
  { id:'none',      icon:'⬜', label:'ไม่มี' },
  { id:'hearts',    icon:'❤️', label:'ฝนหัวใจตก' },
  { id:'petals',    icon:'🌸', label:'กลีบซากุระปลิว' },
  { id:'stars',     icon:'⭐', label:'ดวงดาวระยิบระยับ' },
  { id:'bubbles',   icon:'🫧', label:'ฟองบับเบิ้ลลอย' },
  { id:'snow',      icon:'❄️', label:'หิมะโปรยปราย' },
  { id:'confetti',  icon:'🎊', label:'ไพลินคอนเฟตติ' },
  { id:'fireflies', icon:'✨', label:'ฝูงหิ่งห้อยส่องประกาย' },
];

export const LAYOUTS = [
  { id:'center',  icon:'⬛', label:'Standard Card' },
  { id:'top',     icon:'⬜', label:'ยึดด้านบนสุด' },
  { id:'full',    icon:'▪',  label:'เต็มจอไร้ขอบ' },
  { id:'minimal', icon:'▫',  label:'Minimalist โปร่งแสง' },
];

export const ELEMENT_TYPES = [
  { type:'heading',          icon:'📝', label:'Heading หัวข้อ' },
  { type:'subtext',          icon:'✍️', label:'Subtext ข้อความ' },
  { type:'image',            icon:'🖼️', label:'รูปภาพ' },
  { type:'sticker',          icon:'🎭', label:'Sticker ตัวโต' },
  { type:'animated_sticker', icon:'🎞️', label:'สติกเกอร์เคลื่อนไหว' },
  { type:'button',           icon:'🔘', label:'ปุ่มลิงก์หน้า' },
  { type:'gift_buttons',     icon:'🎁', label:'กล่องของขวัญ' },
  { type:'divider',          icon:'➖', label:'เส้นคั่นแบ่ง' },
  { type:'spacer',           icon:'↕️', label:'Spacer ช่องว่าง' },
  { type:'letter',           icon:'💌', label:'กล่องเปิดจดหมาย' },
  { type:'audio',            icon:'🎵', label:'เครื่องเล่นเพลง MP3' },
  { type:'vinyl',            icon:'💿', label:'แผ่นเสียงเพลง (Vinyl)' },
  { type:'gallery',          icon:'📸', label:'คอลเลกชันแกลเลอรี' },
  { type:'polaroid_gallery', icon:'🖼️', label:'แกลเลอรีโพลารอยด์' },
  { type:'counter',          icon:'❓', label:'คำถามวัดใจ (Yes/No)' },
];

export const STICKERS = ['❤️','🩷','💕','💖','💗','💓','🌸','🌹','✨','⭐','🌙','☀️','🎁','🎉','🥺','😻','🐰','🐻','🦋','🍓','🍰','💌','🎵','💎'];

export const PAGE_TYPES = [
  { value:'custom',   label:'✨ หน้าโล่งปรับแต่งเอง',    icon:'✨' },
  { value:'question', label:'❓ หน้าถามตอบวัดใจ',         icon:'❓' },
  { value:'gallery',  label:'📸 หน้าคลังความทรงจำ',       icon:'📸' },
  { value:'music',    label:'🎵 หน้าฟังเพลงสุดซึ้ง',      icon:'🎵' },
  { value:'letter',   label:'💌 หน้าจดหมายลับ',           icon:'💌' },
];
