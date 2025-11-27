
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Destination, ViewState } from './types';
import DestinationCard from './components/DestinationCard';
import BottomNav from './components/BottomNav';
import { generateDestinationDetails } from './services/geminiService';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';

// --- Data & Types ---

// Cafe Group Interface
interface CafeGroup {
  id: string;
  title: string;
  isCollapsed: boolean;
  items: Destination[];
}

// Initial Data grouped by region with UPDATED Images
const INITIAL_CAFE_GROUPS: CafeGroup[] = [
  {
    id: 'g1',
    title: '聖水洞 / 城東區',
    isCollapsed: false,
    items: [
      { id: 'c1', name: 'ddd cafe', description: '綠色裝潢', imageUrl: 'https://images.unsplash.com/photo-1559305616-3a99c2d3d6e3?q=80&w=600&auto=format&fit=crop', rating: 4.5, tags: ['聖水洞'] },
      { id: 'c2', name: 'Cafe Onion', description: '廢墟風', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop', rating: 4.8, tags: ['廢墟風'] },
      { id: 'c3', name: 'ii R', description: '藝術甜點', imageUrl: 'https://images.unsplash.com/photo-1551024601-569d6f46319c?q=80&w=600&auto=format&fit=crop', rating: 4.6, tags: ['藝術'] },
      { id: 'c4', name: 'danil seoul', description: '手沖', imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', rating: 4.7, tags: ['手沖'] },
      { id: 'c5', name: 'subjective', description: '舊建整修', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop', rating: 4.5, tags: ['復古'] },
      { id: 'c6', name: 'New Mix', description: '即溶', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop', rating: 4.4, tags: ['創意'] },
      { id: 'c7', name: 'The Coffee', description: '簡約', imageUrl: 'https://images.unsplash.com/photo-1507133750069-69d3cdad863a?q=80&w=600&auto=format&fit=crop', rating: 4.3, tags: ['簡約'] },
      { id: 'c8', name: 'Lowide', description: '鹽麵包', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop', rating: 4.7, tags: ['麵包'] },
      { id: 'c20', name: 'Dorrell', description: '花生拿鐵', imageUrl: 'https://images.unsplash.com/photo-1461023058943-48db33005409?q=80&w=600&auto=format&fit=crop', rating: 4.5, tags: ['濃郁'] },
    ]
  },
  {
    id: 'g2',
    title: '漢南洞 / 梨泰院',
    isCollapsed: false,
    items: [
      { id: 'c17', name: 'Anthracite', description: '工業風', imageUrl: 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?q=80&w=600&auto=format&fit=crop', rating: 4.5, tags: ['大空間'] },
      { id: 'c18', name: 'C.Through', description: '拉花藝術', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop', rating: 4.7, tags: ['造型'] },
      { id: 'c13', name: 'Blue Bottle', description: '韓屋風景', imageUrl: 'https://images.unsplash.com/photo-1442512595367-42732509d57d?q=80&w=600&auto=format&fit=crop', rating: 4.7, tags: ['景觀'] },
    ]
  },
  {
    id: 'g3',
    title: '延南洞 / 弘大',
    isCollapsed: false,
    items: [
      { id: 'c11', name: 'Milito', description: '義式濃縮', imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600&auto=format&fit=crop', rating: 4.6, tags: ['小店'] },
      { id: 'c12', name: 'Fritz', description: '海豹咖啡', imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop', rating: 4.9, tags: ['復古'] },
      { id: 'c19', name: 'Coffee Nap', description: '紅磚山坡', imageUrl: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=600&auto=format&fit=crop', rating: 4.6, tags: ['打卡'] },
    ]
  },
  {
    id: 'g4',
    title: '江南 / 狎鷗亭',
    isCollapsed: false,
    items: [
      { id: 'c9', name: 'Camel Coffee', description: '手沖', imageUrl: 'https://images.unsplash.com/photo-1520031607880-2852776d34ac?q=80&w=600&auto=format&fit=crop', rating: 4.9, tags: ['招牌'] },
      { id: 'c10', name: 'Nudake', description: '黑色可頌', imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop', rating: 4.8, tags: ['前衛'] },
      { id: 'c14', name: 'Molto', description: '聖堂景觀', imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop', rating: 4.8, tags: ['戶外'] },
    ]
  }
];

const ARCH_DESTINATIONS: Destination[] = [
  {
    id: 'a1',
    name: '東大門設計廣場 (DDP)',
    description: 'Zaha Hadid 設計的流線型建築，首爾的時尚與藝術中心。',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
    tags: ['現代', '地標', '夜景']
  },
  {
    id: 'a2',
    name: '星空圖書館 (Starfield)',
    description: '位於COEX Mall的巨型圖書館，高聳的書牆非常壯觀。',
    imageUrl: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?q=80&w=1000&auto=format&fit=crop',
    rating: 4.7,
    tags: ['室內', '打卡', '江南']
  },
  {
    id: 'a3',
    name: '北村韓屋村',
    description: '保存完整的傳統韓屋聚落，體驗朝鮮時代的建築美學。',
    imageUrl: 'https://images.unsplash.com/photo-1627915357802-140b9044dc81?q=80&w=1000&auto=format&fit=crop',
    rating: 4.9,
    tags: ['傳統', '歷史', '拍照']
  },
  {
    id: 'a4',
    name: '梨花女子大學',
    description: '著名的下沉式校園建築，由Dominique Perrault設計。',
    imageUrl: 'https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?q=80&w=1000&auto=format&fit=crop',
    rating: 4.6,
    tags: ['校園', '現代', '風景']
  },
];

// New Itinerary Data Structure with 'type'
interface ScheduleItem {
  id: string;
  type: 'event' | 'note'; // Distinguish between cards and text notes
  title?: string;
  category?: string;
  time?: string;
  description?: string;
  imageUrl?: string;
  content?: string; // For text notes
}

const INITIAL_ITINERARY_DATA: Record<string, ScheduleItem[]> = {
  '12/24': [
    {
      id: 'i1',
      type: 'event',
      title: '前往機場',
      category: '交通',
      time: '17:00',
      description: '家 - 大溪站 - 桃園機場第一航廈',
    },
    {
      id: 'i2',
      type: 'event',
      title: '抵達仁川機場',
      category: '交通',
      time: '18:10',
      description: '辦理入境手續、領取行李',
    },
    {
      id: 'i3',
      type: 'event',
      title: '仁川-首爾-東廟(住宿)',
      category: '交通',
      time: '22:48',
      description: '仁川機場-首爾 AREX 22:48~23:31\n首爾站-東廟站 23:42~23:54',
    },
    {
      id: 'i4',
      type: 'event',
      title: 'Seoul N Hotel',
      category: '住宿',
      time: '23:55',
      description: 'Seoul N Hotel 東大門店 Check-in',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'
    }
  ],
  '12/25': [
    { id: '25-1', type: 'event', title: 'Isaac Toast', category: '美食', time: '09:00', description: '明洞店早餐' },
    { id: '25-2', type: 'event', title: '首爾林公園', category: '景點', time: '10:30', description: '聖水洞散步、網美打卡' },
    { id: '25-3', type: 'event', title: '聖水洞咖啡街', category: '美食', time: '13:00', description: '探訪人氣咖啡廳' },
    { id: '25-4', type: 'event', title: '江南豬肉商會', category: '美食', time: '19:00', description: '無限續吃烤肉' },
  ],
  '12/26': [
    { id: '26-1', type: 'event', title: 'London Bagel', category: '美食', time: '08:00', description: '需早起排隊' },
    { id: '26-2', type: 'event', title: '新龍山站', category: '景點', time: '10:00', description: 'Amore Pacific 總部週邊' },
    { id: '26-3', type: 'event', title: '漢南洞購物', category: '購物', time: '14:00', description: 'Mardi Mercredi, Nonfiction' },
  ],
  '12/27': [
    { id: '27-1', type: 'event', title: '廣藏市場', category: '美食', time: '09:30', description: '綠豆煎餅、麻藥飯捲' },
    { id: '27-2', type: 'event', title: '東大門 DDP', category: '景點', time: '11:00', description: '展覽參觀與建築攝影' },
    { id: '27-3', type: 'event', title: '陳玉華一隻雞', category: '美食', time: '13:00', description: '東大門必吃美食' },
  ],
  '12/28': [
    { id: '28-1', type: 'event', title: '望遠市場', category: '美食', time: '10:00', description: '刀削麵與可樂餅' },
    { id: '28-2', type: 'event', title: '延南洞林蔭道', category: '景點', time: '11:30', description: '散步、逛文創小店' },
    { id: '28-3', type: 'event', title: '弘大商圈', category: '景點', time: '15:00', description: '逛街購物' },
    { id: '28-4', type: 'event', title: 'Seoul Sky', category: '景點', time: '19:00', description: '樂天塔觀景台看夜景' },
  ],
  '12/29': [
    { id: '29-1', type: 'event', title: '樂天超市', category: '購物', time: '10:00', description: '首爾站最後採買' },
    { id: '29-2', type: 'event', title: '前往機場', category: '交通', time: '14:00', description: '搭乘 AREX 前往仁川機場' },
    { id: '29-3', type: 'event', title: '返家', category: '交通', time: '17:00', description: '搭機返回溫暖的家' },
  ]
};

const DATES = [
  { id: '12/24', label: '24', day: 'Wed', dayIndex: 'DAY 1' },
  { id: '12/25', label: '25', day: 'Thu', dayIndex: 'DAY 2' },
  { id: '12/26', label: '26', day: 'Fri', dayIndex: 'DAY 3' },
  { id: '12/27', label: '27', day: 'Sat', dayIndex: 'DAY 4' },
  { id: '12/28', label: '28', day: 'Sun', dayIndex: 'DAY 5' },
  { id: '12/29', label: '29', day: 'Mon', dayIndex: 'DAY 6' },
];

const DATE_THEMES: Record<string, string> = {
  '12/24': '出發日',
  '12/25': 'D2 城東區：首爾林、聖水洞',
  '12/26': 'D3 龍山區：新龍山、漢南洞',
  '12/27': 'D4 鐘路區：廣藏市場、東大門',
  '12/28': 'D5 麻浦區：望遠市場、延南洞',
  '12/29': 'D6 返程：最後採買與搭機',
};

const WEATHER_DATA: Record<string, { icon: string; temp: string; condition: string }> = {
  '12/24': { icon: '🌤️', temp: '-2° / 5°', condition: '多雲' },
  '12/25': { icon: '❄️', temp: '-5° / 1°', condition: '下雪' },
  '12/26': { icon: '☀️', temp: '-8° / 0°', condition: '晴朗' },
  '12/27': { icon: '☁️', temp: '-4° / 3°', condition: '陰天' },
  '12/28': { icon: '🌤️', temp: '-3° / 4°', condition: '晴時多雲' },
  '12/29': { icon: '☀️', temp: '-2° / 6°', condition: '晴朗' },
};

// Rounded Chip Styles with Distinct Colors (Background + Text)
const CATEGORY_CHIP_STYLES: Record<string, string> = {
  '交通': 'bg-[#e3f2fd] text-[#1565c0]', // Light Blue / Dark Blue
  '住宿': 'bg-[#e8f5e9] text-[#2e7d32]', // Light Green / Dark Green
  '美食': 'bg-[#fff3e0] text-[#e65100]', // Light Orange / Dark Orange
  '景點': 'bg-[#f3e5f5] text-[#7b1fa2]', // Light Purple / Dark Purple
  '購物': 'bg-[#fce4ec] text-[#c2185b]', // Light Pink / Dark Pink
  '其他': 'bg-[#f5f5f5] text-[#616161]', // Light Gray / Dark Gray
};

const CATEGORY_INDICATOR_COLORS: Record<string, string> = {
  '交通': 'bg-[#90caf9]',
  '住宿': 'bg-[#a5d6a7]',
  '美食': 'bg-[#ffcc80]',
  '景點': 'bg-[#ce93d8]',
  '購物': 'bg-[#f48fb1]',
  '其他': 'bg-[#e0e0e0]',
};

// Helper functions remain same
const getAutomaticImage = (item: ScheduleItem) => {
  if (item.imageUrl === 'none') return 'none';
  if (item.imageUrl) return item.imageUrl;
  
  const kw = (item.title + item.category + item.description).toLowerCase();
  
  if (kw.includes('機場') || kw.includes('交通') || kw.includes('arex')) return 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=300&q=80';
  if (kw.includes('美食') || kw.includes('烤肉') || kw.includes('雞') || kw.includes('飯')) return 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=300&q=80';
  if (kw.includes('咖啡') || kw.includes('cafe') || kw.includes('甜點')) return 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=300&q=80';
  if (kw.includes('住宿') || kw.includes('hotel') || kw.includes('check-in')) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
  if (kw.includes('購物') || kw.includes('百貨') || kw.includes('超市')) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80';
  if (kw.includes('夜景') || kw.includes('sky')) return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=300&q=80';
  
  return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80';
};

const DragHandle = ({ controls }: { controls: any }) => (
  <div 
    onPointerDown={(e) => controls.start(e)}
    className="mr-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none text-[#b0bec5] hover:text-[#78909c] select-none transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
  </div>
);

// Detail Sheet Component
const DetailSheet = ({ 
  item, 
  onClose, 
  onEdit, 
  onDelete 
}: { 
  item: ScheduleItem; 
  onClose: () => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
}) => {
  const displayImage = getAutomaticImage(item);
  const hasImage = displayImage !== 'none';
  const categoryChipStyle = item.category ? (CATEGORY_CHIP_STYLES[item.category] || CATEGORY_CHIP_STYLES['其他']) : CATEGORY_CHIP_STYLES['其他'];
  
  // Create a map query based on title. Add 'Seoul' to ensure context.
  const mapQuery = encodeURIComponent(`${item.title} Seoul South Korea`);
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-[#37474f]/30 backdrop-blur-[1px]" onClick={onClose} style={{ pointerEvents: 'auto' }} />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md rounded-t-[2rem] shadow-2xl p-6 pointer-events-auto pb-safe relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 flex-shrink-0" />
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${categoryChipStyle}`}>{item.category}</span>
                     <span className="text-xs text-gray-300">|</span>
                     <span className="text-xs font-mono text-[#78909c] font-bold">{item.time}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#37474f] mb-1">{item.title}</h2>
               </div>
               
               <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(item)}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#78909c] hover:bg-gray-100 transition-colors"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                  >
                    🗑
                  </button>
               </div>
            </div>

            {hasImage && (
               <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-sm flex-shrink-0">
                  <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
               </div>
            )}

            <div className="text-sm text-[#546e7a] leading-7 font-light tracking-wide bg-[#faf9f8] p-4 rounded-xl border border-[#eceff1] mb-6">
               {item.description || "沒有詳細描述"}
            </div>

            {/* Google Map Embed */}
            <div className="mb-6">
                <h3 className="text-[10px] font-bold text-[#b0bec5] mb-3 uppercase tracking-wider flex items-center gap-1">
                   <span>📍</span> LOCATION
                </h3>
                <div className="w-full h-40 rounded-xl overflow-hidden border border-[#eceff1] shadow-sm bg-gray-50">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      title="map"
                      className="filter grayscale-[0.3] opacity-90 hover:opacity-100 transition-opacity"
                      src={mapUrl}
                    ></iframe>
                </div>
            </div>
        </div>
        
        <button onClick={onClose} className="mt-4 w-full py-4 bg-[#f5f5f5] text-[#78909c] font-bold text-xs rounded-xl hover:bg-[#eeeeee] transition-colors tracking-widest flex-shrink-0">
           CLOSE
        </button>
      </motion.div>
    </div>
  );
};

interface ItineraryItemProps {
  item: ScheduleItem;
  index: number;
  handleEditItem: (item: ScheduleItem) => void;
  handleDeleteItem: (id: string) => void;
  handleAddNote: (index: number) => void;
  handleUpdateNote: (id: string, text: string) => void;
  onSelect: (item: ScheduleItem) => void;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ 
  item, 
  index,
  handleDeleteItem,
  handleAddNote,
  handleUpdateNote,
  onSelect
}) => {
  const controls = useDragControls();
  
  // -- Render Note Type --
  if (item.type === 'note') {
    return (
      <Reorder.Item 
        value={item} 
        id={item.id}
        dragListener={false}
        dragControls={controls}
        className="relative flex items-center py-2 min-h-[40px] group select-none"
        onClick={(e) => e.stopPropagation()}
      >
         {/* Timeline Connection */}
         <div className="w-[18%] flex flex-col items-center flex-shrink-0 relative">
             <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
         </div>

         {/* Note Input */}
         <div className="flex-1 pr-5 relative z-10 pl-2">
            <input 
              type="text"
              value={item.content || ''}
              onChange={(e) => handleUpdateNote(item.id, e.target.value)}
              placeholder="新增備註..."
              className="w-full bg-transparent px-3 py-1 text-xs text-[#78909c] focus:outline-none placeholder-gray-300 rounded-md focus:bg-white/50 transition-all text-left font-light"
            />
            {/* Delete button for note */}
            <button 
              onClick={() => handleDeleteItem(item.id)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
            >
              ✕
            </button>
        </div>
      </Reorder.Item>
    );
  }

  // -- Render Event Type --
  const displayImage = getAutomaticImage(item);
  const hasImage = displayImage !== 'none';
  const categoryIndicatorColor = item.category ? (CATEGORY_INDICATOR_COLORS[item.category] || CATEGORY_INDICATOR_COLORS['其他']) : CATEGORY_INDICATOR_COLORS['其他'];
  const categoryChipStyle = item.category ? (CATEGORY_CHIP_STYLES[item.category] || CATEGORY_CHIP_STYLES['其他']) : CATEGORY_CHIP_STYLES['其他'];

  // Format Time (take first part if range)
  const displayTime = item.time?.split(' ')[0] || '--:--';

  return (
    <div className="relative group/wrapper">
      <Reorder.Item 
        value={item} 
        id={item.id}
        dragListener={false}
        dragControls={controls}
        className="flex mb-1 select-none relative"
        onClick={() => onSelect(item)}
      >
        {/* Time Column (Left) - Level 1 Color */}
        <div className="w-[18%] flex flex-col items-end pr-3 pt-1.5 flex-shrink-0 text-right">
           <span className="font-serif text-lg text-[#37474f] leading-none tracking-tight font-medium">{displayTime}</span>
        </div>

        {/* Timeline Line (Center) */}
        <div className="w-4 relative flex flex-col items-center flex-shrink-0">
           {/* Dot - Level 2 Color Context */}
           <div className={`w-2.5 h-2.5 rounded-full z-10 mt-2 ring-4 ring-[#faf9f8] ${categoryIndicatorColor}`} />
           {/* Line */}
           <div className="absolute top-3 bottom-[-20px] w-px bg-[#eceff1]" />
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1 pl-3 pb-6 min-w-0 pr-4 pt-1 flex">
           
           {/* NEW: Vertical Color Strip */}
           <div className={`w-0.5 rounded-full mr-3 mt-1.5 mb-1 flex-shrink-0 opacity-40 ${categoryIndicatorColor}`} />

           <div className="flex items-start justify-between flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${categoryChipStyle}`}>{item.category}</span>
                    <DragHandle controls={controls} />
                  </div>
                  {/* Title - Level 1 Color */}
                  <h3 className="text-[15px] font-bold text-[#37474f] leading-tight mb-1.5">{item.title}</h3>
                  <p className="text-xs text-[#90a4ae] line-clamp-2 leading-relaxed font-light tracking-wide">{item.description}</p>
              </div>

              {hasImage && (
                 <div className="ml-3 w-16 h-16 flex-shrink-0">
                    <img 
                      src={displayImage} 
                      alt="" 
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                    />
                 </div>
              )}
           </div>
        </div>
      </Reorder.Item>
      
      {/* --- ADD NOTE BUTTON (Hover Reveal) --- */}
      <div 
        className="absolute bottom-[-10px] left-[18%] right-0 h-5 flex items-center justify-start pl-3 z-10 opacity-0 group-hover/wrapper:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/wrapper:pointer-events-auto"
      >
         <button 
           onClick={() => handleAddNote(index)}
           className="bg-white border border-[#cfd8dc] shadow-sm rounded-full w-5 h-5 flex items-center justify-center text-[#b0bec5] hover:text-[#546e7a] hover:border-[#546e7a] transition-colors text-sm pb-0.5"
         >
           +
         </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('itinerary');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [destinationDetailText, setDestinationDetailText] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('12/24');
  
  // Itinerary State
  const [itineraryData, setItineraryData] = useState(INITIAL_ITINERARY_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ScheduleItem>>({
    title: '',
    category: '交通',
    time: '',
    description: '',
    imageUrl: '',
    type: 'event'
  });
  
  // Cafe State (Grouped)
  const [cafeGroups, setCafeGroups] = useState<CafeGroup[]>(INITIAL_CAFE_GROUPS);
  const [isCafeModalOpen, setIsCafeModalOpen] = useState(false);
  const [selectedGroupIdForNewCafe, setSelectedGroupIdForNewCafe] = useState<string>(INITIAL_CAFE_GROUPS[0].id);
  const [newCafe, setNewCafe] = useState<Partial<Destination>>({
    name: '',
    description: '',
    imageUrl: '',
    rating: 5.0,
    tags: []
  });

  // Cafe Editing State
  const [editingCafe, setEditingCafe] = useState<Destination | null>(null);
  const [editingCafeGroupId, setEditingCafeGroupId] = useState<string | null>(null);
  
  // --- Long Press Logic for Cafes ---
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleCafePointerDown = (dest: Destination, groupId: string) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        // Trigger Edit (Long Press Action)
        if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
        setEditingCafe({ ...dest });
        setEditingCafeGroupId(groupId);
    }, 500); // 500ms threshold
  };

  const handleCafePointerUp = (dest: Destination) => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
    
    // If not a long press, verify it wasn't a drag/scroll (simplified check)
    if (!isLongPressTriggeredRef.current) {
        // Short Tap Action: Open Map
        if (dest.googleMapLink) {
            window.open(dest.googleMapLink, '_blank');
        } else {
            // Optional fallback: alert user or just do nothing (per request "click jumps to map")
             // But for UX, let's hint them to long press to add one
             alert("尚未設定地圖連結，請長按圖片進行編輯。");
        }
    }
  };

  const handleCafePointerLeave = () => {
     // If user drags finger away, cancel long press
     if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
     }
  };


  // Detail Sheet State
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Gemini & Navigation Logic
  const handleDestinationClick = async (dest: Destination) => {
    setSelectedDestination(dest);
    setDestinationDetailText('正在為您載入 AI 導覽...');
    setCurrentView('details');
    const text = await generateDestinationDetails(dest.name);
    setDestinationDetailText(text);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCafeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCafe(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEditCafeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCafe) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCafe({ ...editingCafe, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = () => {
    if (!newItem.title || !newItem.time) return;
    
    if (editingId) {
      setItineraryData(prev => ({
        ...prev,
        [selectedDate]: prev[selectedDate].map(item => 
          item.id === editingId 
            ? { ...item, ...newItem } as ScheduleItem
            : item
        )
      }));
      // Update selected item if it's currently open
      if (selectedScheduleItem && selectedScheduleItem.id === editingId) {
          setSelectedScheduleItem({ ...selectedScheduleItem, ...newItem } as ScheduleItem);
      }
    } else {
      const item: ScheduleItem = {
        id: Date.now().toString(),
        type: 'event',
        title: newItem.title || '新行程',
        category: newItem.category || '其他',
        time: newItem.time || '',
        description: newItem.description || '',
        imageUrl: newItem.imageUrl,
      };
      setItineraryData(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), item]
      }));
    }
    resetForm();
  };

  const handleSaveCafe = () => {
     if(!newCafe.name) return;
     const item: Destination = {
         id: `c-new-${Date.now()}`,
         name: newCafe.name || 'New Cafe',
         description: newCafe.description || '',
         imageUrl: newCafe.imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=500&auto=format&fit=crop',
         rating: 5.0,
         tags: ['New']
     };

     setCafeGroups(prev => prev.map(group => {
         if (group.id === selectedGroupIdForNewCafe) {
             return { ...group, items: [item, ...group.items] };
         }
         return group;
     }));

     setIsCafeModalOpen(false);
     setNewCafe({ name: '', description: '', imageUrl: '', rating: 5.0, tags: [] });
  };
  
  const handleSaveCafeDetails = () => {
    if (!editingCafe || !editingCafeGroupId) return;

    setCafeGroups(prev => prev.map(group => {
        if (group.id === editingCafeGroupId) {
            return {
                ...group,
                items: group.items.map(item => item.id === editingCafe.id ? editingCafe : item)
            };
        }
        return group;
    }));
    setEditingCafe(null);
    setEditingCafeGroupId(null);
  };
  
  const handleDeleteCafe = () => {
     if (!editingCafe || !editingCafeGroupId) return;
     setCafeGroups(prev => prev.map(group => {
        if (group.id === editingCafeGroupId) {
            return {
                ...group,
                items: group.items.filter(item => item.id !== editingCafe.id)
            };
        }
        return group;
    }));
    setEditingCafe(null);
    setEditingCafeGroupId(null);
  };

  // --- Cafe Group Logic ---
  const handleToggleGroup = (groupId: string) => {
      setCafeGroups(prev => prev.map(group => 
          group.id === groupId ? { ...group, isCollapsed: !group.isCollapsed } : group
      ));
  };

  const handleUpdateGroupTitle = (groupId: string, newTitle: string) => {
      setCafeGroups(prev => prev.map(group => 
          group.id === groupId ? { ...group, title: newTitle } : group
      ));
  };

  const handleAddGroup = () => {
      const newGroup: CafeGroup = {
          id: `g-${Date.now()}`,
          title: '新地區分類',
          isCollapsed: false,
          items: []
      };
      setCafeGroups(prev => [...prev, newGroup]);
  };

  const handleDeleteItem = (itemId: string) => {
    setItineraryData(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(item => item.id !== itemId)
    }));
    setSelectedScheduleItem(null);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setNewItem({
      title: item.title,
      category: item.category,
      time: item.time,
      description: item.description,
      imageUrl: item.imageUrl || '',
      type: 'event'
    });
    setEditingId(item.id);
    setSelectedScheduleItem(null); // Close detail sheet
    setIsAddModalOpen(true);
  };

  const handleReorder = (newOrder: ScheduleItem[]) => {
    setItineraryData(prev => ({
      ...prev,
      [selectedDate]: newOrder
    }));
  };

  const handleAddNote = (index: number) => {
    const newNote: ScheduleItem = {
      id: `note-${Date.now()}`,
      type: 'note',
      content: ''
    };
    
    setItineraryData(prev => {
      const currentList = [...(prev[selectedDate] || [])];
      // Insert after the current index
      currentList.splice(index + 1, 0, newNote);
      return { ...prev, [selectedDate]: currentList };
    });
  };

  const handleUpdateNote = (id: string, text: string) => {
    setItineraryData(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].map(item => 
        item.id === id ? { ...item, content: text } : item
      )
    }));
  };

  const resetForm = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setNewItem({ title: '', category: '交通', time: '', description: '', imageUrl: '', type: 'event' });
  };

  const renderHeader = () => (
    <header className="mb-4 pt-4 px-4 text-center">
      {/* Level 1 Color: Header Title */}
      <h1 className="text-lg font-medium text-[#37474f] tracking-widest uppercase">Seoul Travel</h1>
      <p className="text-[#90a4ae] mt-1 text-[10px] tracking-[0.2em] font-light">2025 WINTER COLLECTION</p>
    </header>
  );

  const renderItinerary = () => {
    const items = itineraryData[selectedDate] || [];
    const currentTheme = DATE_THEMES[selectedDate];
    const weather = WEATHER_DATA[selectedDate];

    // Level 4 Color: Background
    return (
      <div className="flex flex-col h-screen bg-[#faf9f8] text-[#37474f]">
        <div className="px-5 pb-2 bg-[#faf9f8]/95 backdrop-blur-sm z-10 sticky top-0 border-b border-gray-100/50">
          {renderHeader()}
          
          <div className="flex justify-between items-center px-1 pb-2 mt-2">
            {DATES.map((date) => {
              const isActive = selectedDate === date.id;
              return (
                <button
                  key={date.id}
                  onClick={() => setSelectedDate(date.id)}
                  className={`flex flex-col items-center justify-center w-[15.5%] aspect-square rounded-xl transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-[#546e7a] text-white shadow-sm' // Level 2 Color: Date Selector BG
                      : 'bg-transparent text-[#b0bec5] hover:bg-gray-50'
                  }`}
                >
                  {/* Date (Top) */}
                  <span className={`text-[9px] font-medium tracking-wider mb-0.5 ${isActive ? 'text-white/90' : 'text-[#78909c]'}`}>
                    {date.id}
                  </span>
                  {/* Day Index (Middle) */}
                  <span className={`text-xs font-bold leading-none my-0.5 tracking-widest ${isActive ? 'text-white' : 'text-[#37474f]'}`}>
                    {date.dayIndex}
                  </span>
                  {/* Week (Bottom) - Level 3 Color (Inactive Text) */}
                  <span className={`text-[8px] font-light ${isActive ? 'text-white/70' : 'text-[#cfd8dc]'}`}>
                    {date.day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {currentTheme && (
          <div className="px-5 mt-5 mb-4 flex items-center justify-between gap-3 animate-fade-in">
             {/* Level 3 Color: Theme Header BG */}
             <div className="bg-[#cfd8dc] rounded-lg py-3 px-4 flex items-center gap-3 flex-1 min-w-0 select-none">
                <div className="w-1 h-5 bg-[#78909c] rounded-full flex-shrink-0" />
                {/* Text on L3 BG should be readable, using L1/L2 */}
                <h2 className="font-bold text-[#37474f] text-sm tracking-wide truncate">{currentTheme}</h2>
             </div>
             
             {weather && (
                <div className="flex items-center gap-2.5 flex-shrink-0 select-none pl-1">
                     <div className="text-right flex flex-col justify-center">
                        <div className="text-[10px] text-[#90a4ae] font-medium leading-tight mb-0.5 tracking-wide">{weather.condition}</div>
                        <div className="text-sm font-bold text-[#546e7a] leading-none font-mono">{weather.temp}</div>
                     </div>
                     <span className="text-2xl opacity-80">{weather.icon}</span>
                </div>
             )}
          </div>
        )}

        <div 
          className="flex-1 overflow-y-auto px-5 pt-2 pb-32 no-scrollbar" 
        >
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="pb-10">
            {items.map((item, index) => (
              <ItineraryItem
                key={item.id}
                item={item}
                index={index}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                handleAddNote={handleAddNote}
                handleUpdateNote={handleUpdateNote}
                onSelect={setSelectedScheduleItem}
              />
            ))}
          </Reorder.Group>

          <button 
            onClick={() => {
              setEditingId(null);
              setNewItem({ title: '', category: '交通', time: '', description: '', imageUrl: '', type: 'event' });
              setIsAddModalOpen(true);
            }}
            className="w-full py-3.5 mt-2 mb-10 rounded-xl border border-dashed border-[#cfd8dc] text-[#90a4ae] text-xs font-medium hover:bg-white hover:border-[#b0bec5] transition-all flex items-center justify-center gap-2"
          >
            <span>+</span> 新增主要行程
          </button>
        </div>
        
        {/* Detail Sheet Overlay */}
        <AnimatePresence>
            {selectedScheduleItem && (
               <DetailSheet 
                 item={selectedScheduleItem} 
                 onClose={() => setSelectedScheduleItem(null)}
                 onEdit={handleEditItem}
                 onDelete={handleDeleteItem}
               />
            )}
        </AnimatePresence>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#37474f]/30 backdrop-blur-[2px] z-[60] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-100">
              <h3 className="text-base font-bold mb-5 text-[#37474f] text-center tracking-widest">
                {editingId ? 'EDIT ITEM' : 'NEW ITEM'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">COVER IMAGE</label>
                  <div className="flex gap-3 items-start">
                    {newItem.imageUrl && newItem.imageUrl !== 'none' ? (
                      <div className="relative w-16 h-16 flex-shrink-0 group">
                        <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-100" />
                        <button 
                          onClick={() => setNewItem({...newItem, imageUrl: ''})}
                          className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : newItem.imageUrl === 'none' ? (
                      <div className="relative w-16 h-16 flex-shrink-0 bg-[#f5f5f5] rounded-lg border border-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        HIDDEN
                        <button 
                          onClick={() => setNewItem({...newItem, imageUrl: ''})}
                          className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null}

                    <div className="flex-1 space-y-2">
                        <label className="cursor-pointer group block">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <div className="w-full h-9 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 bg-[#faf9f8] group-hover:bg-white transition-colors gap-2">
                            <span>📷</span>
                            {newItem.imageUrl && newItem.imageUrl !== 'none' ? 'Change Photo' : 'Upload Photo'}
                          </div>
                        </label>
                        
                        <button
                          onClick={() => setNewItem({...newItem, imageUrl: 'none'})}
                          className={`w-full h-9 border rounded-lg flex items-center justify-center text-xs transition-colors gap-2 ${newItem.imageUrl === 'none' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-200 text-gray-400 hover:bg-[#faf9f8]'}`}
                        >
                          <span>⊘</span> No Image
                        </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">TITLE</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                    placeholder="行程標題"
                    value={newItem.title || ''}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">CATEGORY</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                      {Object.keys(CATEGORY_CHIP_STYLES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">TIME</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                      placeholder="12:00"
                      value={newItem.time || ''}
                      onChange={e => setNewItem({...newItem, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">NOTE</label>
                  <textarea 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b0bec5] h-20 resize-none bg-[#faf9f8] text-[#37474f]"
                    placeholder="詳細資訊..."
                    value={newItem.description || ''}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-3 bg-[#f5f5f5] text-[#90a4ae] text-xs font-bold rounded-lg hover:bg-[#eeeeee] tracking-wide"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSaveItem}
                  className="flex-1 py-3 bg-[#546e7a] text-white text-xs font-bold rounded-lg hover:bg-[#455a64] shadow-md shadow-[#eceff1] tracking-wide"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderCafes = () => (
    <div className="px-3 pt-4 pb-24 space-y-6 animate-fade-in bg-[#faf9f8] min-h-screen">
      {renderHeader()}
      
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#37474f] tracking-wide">SEOUL CAFES</h2>
            <button 
              onClick={() => setIsCafeModalOpen(true)}
              className="w-5 h-5 rounded-full border border-[#cfd8dc] text-[#b0bec5] flex items-center justify-center text-xs hover:bg-[#eceff1] transition-colors"
            >
              +
            </button>
        </div>
        <button onClick={handleAddGroup} className="text-[9px] bg-[#fcf4ec] text-[#a1887f] px-2 py-0.5 rounded-full font-medium hover:bg-[#f3e0d0] transition-colors">
            + GROUP
        </button>
      </div>

      <div className="pb-10">
        {cafeGroups.map((group) => (
          <div key={group.id} className="mb-6 animate-fade-in">
             {/* Header */}
             <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
                 <input 
                    type="text" 
                    value={group.title}
                    onChange={(e) => handleUpdateGroupTitle(group.id, e.target.value)}
                    className="text-xs font-bold text-[#546e7a] bg-transparent focus:outline-none focus:text-[#37474f] w-full"
                 />
                 <button 
                    onClick={() => handleToggleGroup(group.id)}
                    className="p-1 text-[#b0bec5] hover:text-[#78909c] transition-colors"
                 >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${group.isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                 </button>
             </div>

             {/* Grid Items (Standard Layout, No Drag) */}
             {!group.isCollapsed && (
               <div className="flex flex-wrap -mx-1">
                 {group.items.map((dest) => (
                   <div 
                     key={dest.id}
                     className="w-1/4 p-1"
                   >
                     <div 
                       className="flex flex-col group cursor-pointer select-none touch-manipulation"
                       onPointerDown={() => handleCafePointerDown(dest, group.id)}
                       onPointerUp={() => handleCafePointerUp(dest)}
                       onPointerLeave={handleCafePointerLeave}
                       onContextMenu={(e) => {
                          e.preventDefault();
                          // Fallback for long press context menu
                          handleCafePointerLeave();
                       }}
                     >
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
                           <img 
                             src={dest.imageUrl} 
                             alt={dest.name} 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                             loading="lazy"
                           />
                        </div>
                        <div className="mt-1.5 text-center px-0.5">
                           <h3 className="text-[9px] font-bold text-[#37474f] truncate leading-none mb-0.5">{dest.name}</h3>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        ))}
      </div>

      {isCafeModalOpen && (
          <div className="fixed inset-0 bg-[#37474f]/30 backdrop-blur-[2px] z-[60] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-100">
              <h3 className="text-base font-bold mb-5 text-[#37474f] text-center tracking-widest">
                ADD NEW CAFE
              </h3>
              
              <div className="space-y-4">
                {/* Group Selection */}
                <div>
                   <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">GROUP</label>
                   <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                      value={selectedGroupIdForNewCafe}
                      onChange={(e) => setSelectedGroupIdForNewCafe(e.target.value)}
                   >
                       {cafeGroups.map(g => (
                           <option key={g.id} value={g.id}>{g.title}</option>
                       ))}
                   </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">CAFE IMAGE</label>
                  <div className="flex gap-3 items-start">
                    {newCafe.imageUrl ? (
                      <div className="relative w-16 h-16 flex-shrink-0 group">
                        <img src={newCafe.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-100" />
                        <button 
                          onClick={() => setNewCafe({...newCafe, imageUrl: ''})}
                          className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-16 h-16 flex-shrink-0 bg-[#f5f5f5] rounded-lg border border-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        PREVIEW
                      </div>
                    )}

                    <div className="flex-1">
                        <label className="cursor-pointer group block">
                          <input type="file" accept="image/*" className="hidden" onChange={handleCafeImageUpload} />
                          <div className="w-full h-9 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 bg-[#faf9f8] group-hover:bg-white transition-colors gap-2">
                            <span>📷</span>
                            {newCafe.imageUrl ? 'Change Photo' : 'Upload Photo'}
                          </div>
                        </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">CAFE NAME</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                    placeholder="店名"
                    value={newCafe.name || ''}
                    onChange={e => setNewCafe({...newCafe, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">DESCRIPTION</label>
                  <textarea 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b0bec5] h-20 resize-none bg-[#faf9f8] text-[#37474f]"
                    placeholder="簡單描述..."
                    value={newCafe.description || ''}
                    onChange={e => setNewCafe({...newCafe, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsCafeModalOpen(false)}
                  className="flex-1 py-3 bg-[#f5f5f5] text-[#90a4ae] text-xs font-bold rounded-lg hover:bg-[#eeeeee] tracking-wide"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSaveCafe}
                  className="flex-1 py-3 bg-[#546e7a] text-white text-xs font-bold rounded-lg hover:bg-[#455a64] shadow-md shadow-[#eceff1] tracking-wide"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
      )}
      
      {/* EDITING CAFE MODAL */}
      {editingCafe && (
          <div className="fixed inset-0 bg-[#37474f]/30 backdrop-blur-[2px] z-[60] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto border border-gray-100">
              <h3 className="text-base font-bold mb-5 text-[#37474f] text-center tracking-widest">
                EDIT CAFE
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">IMAGE</label>
                  <div className="flex gap-3 items-start">
                    <div className="relative w-16 h-16 flex-shrink-0 group">
                        <img src={editingCafe.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-100" />
                    </div>

                    <div className="flex-1">
                        <label className="cursor-pointer group block">
                          <input type="file" accept="image/*" className="hidden" onChange={handleEditCafeImageUpload} />
                          <div className="w-full h-9 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-500 bg-[#faf9f8] group-hover:bg-white transition-colors gap-2">
                            <span>📷</span> Change Photo
                          </div>
                        </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">CAFE NAME</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                    value={editingCafe.name}
                    onChange={e => setEditingCafe({...editingCafe, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">DESCRIPTION</label>
                  <textarea 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#b0bec5] h-20 resize-none bg-[#faf9f8] text-[#37474f]"
                    value={editingCafe.description}
                    onChange={e => setEditingCafe({...editingCafe, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#b0bec5] mb-1.5 uppercase tracking-wider">GOOGLE MAP LINK</label>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#b0bec5] bg-[#faf9f8] text-[#37474f]"
                        placeholder="https://maps.app.goo.gl/..."
                        value={editingCafe.googleMapLink || ''}
                        onChange={e => setEditingCafe({...editingCafe, googleMapLink: e.target.value})}
                      />
                      {editingCafe.googleMapLink && (
                          <a 
                            href={editingCafe.googleMapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#e3f2fd] text-[#1976d2] px-3 rounded-lg flex items-center justify-center text-xs font-bold whitespace-nowrap"
                          >
                            OPEN
                          </a>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                 <button 
                  onClick={handleDeleteCafe}
                  className="py-3 px-4 bg-[#ffebee] text-[#ef5350] text-xs font-bold rounded-lg hover:bg-[#ffcdd2] tracking-wide"
                >
                  DEL
                </button>
                <button 
                  onClick={() => setEditingCafe(null)}
                  className="flex-1 py-3 bg-[#f5f5f5] text-[#90a4ae] text-xs font-bold rounded-lg hover:bg-[#eeeeee] tracking-wide"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleSaveCafeDetails}
                  className="flex-1 py-3 bg-[#546e7a] text-white text-xs font-bold rounded-lg hover:bg-[#455a64] shadow-md shadow-[#eceff1] tracking-wide"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );

  const renderArchitecture = () => (
    <div className="px-5 pt-4 pb-24 space-y-4 animate-fade-in bg-[#faf9f8] min-h-screen">
      {renderHeader()}

      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold text-[#37474f] tracking-wide">ARCHITECTURE</h2>
        <span className="text-[9px] bg-[#eff6fa] text-[#78909c] px-2 py-0.5 rounded-full font-medium">DESIGN</span>
      </div>

      <div>
        {ARCH_DESTINATIONS.map(dest => (
          <DestinationCard 
            key={dest.id} 
            destination={dest} 
            onClick={handleDestinationClick} 
          />
        ))}
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen pb-24 text-center bg-[#faf9f8]">
      <div className="w-20 h-20 bg-white rounded-full mb-5 overflow-hidden shadow-sm p-1 border border-gray-50">
         <img src="https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80" alt="Info" className="w-full h-full rounded-full object-cover opacity-80" />
      </div>
      <h2 className="text-lg font-bold text-[#37474f] tracking-widest uppercase mb-1">Travel Docs</h2>
      <p className="text-[#90a4ae] mb-10 text-xs font-light tracking-wide">SEOUL 2025</p>
      
      <div className="w-full space-y-3 max-w-xs">
        {[
          { icon: '✈️', label: 'E-Ticket' },
          { icon: '🏨', label: 'Hotel Voucher' },
          { icon: '🗺️', label: 'Subway Map' },
          { icon: '💰', label: 'Budget' },
          { icon: '⚠️', label: 'Emergency' }
        ].map(item => (
          <button key={item.label} className="w-full bg-white border border-gray-100/80 py-4 px-6 rounded-xl flex justify-between items-center text-[#546e7a] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow text-xs tracking-wider">
            <span className="flex items-center gap-4">
              <span className="text-base opacity-70 grayscale">{item.icon}</span>
              {item.label}
            </span>
            <span className="text-gray-300">›</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedDestination) return null;
    return (
      <div className="bg-white min-h-screen pb-20 animate-fade-in">
        <div className="relative h-80">
          <img 
            src={selectedDestination.imageUrl} 
            alt={selectedDestination.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => setCurrentView('cafes')} 
            className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
        
        <div className="px-6 py-8 -mt-8 relative bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#37474f] tracking-wide mb-2">{selectedDestination.name}</h2>
              <div className="flex items-center text-[#a1887f]">
                <span className="mr-1">★</span>
                <span className="font-bold text-sm">{selectedDestination.rating}</span>
              </div>
            </div>
            <button className="w-10 h-10 bg-[#f5f5f5] text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>

          <p className="text-[#546e7a] leading-8 text-sm mb-8 font-light tracking-wide">
            {selectedDestination.description}
          </p>

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-xs font-bold text-[#37474f] mb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="text-[#90a4ae]">✨</span> AI Guide
            </h3>
            <div className="bg-[#faf9f8] rounded-2xl p-6 text-sm text-[#546e7a] leading-7 font-light border border-gray-50/50">
               <div dangerouslySetInnerHTML={{ 
                  __html: destinationDetailText
                    .replace(/^### (.*$)/gm, '<h4 class="font-bold text-sm mt-4 mb-2 text-[#37474f]">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#37474f] font-medium">$1</strong>')
                    .replace(/\n/g, '<br/>') 
                }} 
              />
            </div>
          </div>
          
          <button className="w-full mt-10 bg-[#546e7a] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#eceff1] active:scale-95 transition-transform text-xs tracking-[0.2em] uppercase">
            Start Navigation
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#faf9f8] min-h-screen font-sans text-[#37474f] md:max-w-md md:mx-auto md:shadow-2xl md:min-h-screen relative overflow-hidden">
      
      {currentView === 'itinerary' && renderItinerary()}
      {currentView === 'cafes' && renderCafes()}
      {currentView === 'architecture' && renderArchitecture()}
      {currentView === 'details' && renderDetails()}
      {currentView === 'info' && renderInfo()}

      <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
