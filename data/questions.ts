// 測驗主題資料檔。換主題時只需要改這個檔案：
// 調整 PARENTING_STYLES（風格代號與定義），以及 QUESTIONS（題目與選項權重）即可，
// 不會動到任何畫面或資料庫程式碼。

export const QUIZ_TITLE = "你是哪種育兒風格的人？";

export type ParentingStyleCode =
  | "helicopter"
  | "lawnmower"
  | "tiger"
  | "permissive"
  | "gentle"
  | "uninvolved";

export interface ParentingStyleInfo {
  name: string;
  englishName: string;
  /** 核心行為模式 */
  coreBehavior: string;
  /** 優點／正面效益 */
  benefits: string;
  /** 潛在風險／缺點 */
  risks: string;
  /** 建議實踐方式 */
  suggestion: string;
}

export const PARENTING_STYLES: Record<ParentingStyleCode, ParentingStyleInfo> = {
  helicopter: {
    name: "直升機育兒",
    englishName: "Helicopter",
    coreBehavior: "高度監控，密集介入孩子的每個選擇與動作，隨時在旁糾正、代勞。",
    benefits: "孩子感受到高度關注與安全感，照顧細膩周到。",
    risks: "孩子缺乏獨立嘗試與犯錯的機會，容易缺乏自信、抗壓性偏低。",
    suggestion: "練習「退後一步」：先觀察，等孩子真的求助再介入，把糾正換成提問。",
  },
  lawnmower: {
    name: "割草機育兒",
    englishName: "Lawnmower",
    coreBehavior: "主動預先清除孩子可能遇到的困難與挫折，確保一路暢行無阻。",
    benefits: "孩子少走彎路，短期內挫折與衝突較少。",
    risks: "剝奪孩子練習面對挫折、解決問題的機會，遇到無法預先清除的困難時容易崩潰。",
    suggestion: "忍住不代勞，讓孩子經歷小挫折，陪他一起想辦法而不是直接幫他解決。",
  },
  tiger: {
    name: "虎式育兒",
    englishName: "Tiger",
    coreBehavior: "高標準、重紀律，常用責罵、威脅或處罰要求孩子立即服從。",
    benefits: "短期內孩子行為快速符合要求，規矩明確。",
    risks: "孩子容易因恐懼而順從而非理解，長期可能影響親子信任與情緒調節能力。",
    suggestion: "把命令換成「說明＋選擇」，用溫和但堅定的語氣取代責罵與威脅。",
  },
  permissive: {
    name: "討好型育兒",
    englishName: "Permissive",
    coreBehavior: "為了讓孩子停止哭鬧或避免衝突，經常妥協、順從，也較少主動設定或堅持規則。",
    benefits: "親子當下氣氛和緩，衝突發生的頻率較低。",
    risks: "孩子難以學習面對挫折與規則界線，長期可能更容易用情緒勒索達成目的。",
    suggestion: "練習溫和而堅定地說「不」，允許孩子有情緒，但不因此改變決定。",
  },
  gentle: {
    name: "正向溫和育兒",
    englishName: "Gentle",
    coreBehavior: "先同理孩子的情緒，再溫和而堅定地維持界線，引導孩子一起想辦法。",
    benefits: "建立良好的親子信任與溝通，孩子情緒調節與問題解決能力較佳。",
    risks: "需要花更多耐心與時間，情緒不穩定時容易變成放任。",
    suggestion: "持續練習「先接住情緒、後談規則」的順序，必要時給自己緩衝時間再回應。",
  },
  uninvolved: {
    name: "忽略型育兒",
    englishName: "Uninvolved",
    coreBehavior: "對孩子的狀況與情緒反應較少關注或回應，經常任由孩子自行處理。",
    benefits: "孩子有較多自主空間，較少受到過度干涉。",
    risks: "孩子容易感受到被忽視，缺乏安全感與情感連結，需要協助時得不到支持。",
    suggestion: "從固定的「專屬陪伴時間」開始，練習主動關注孩子當下的狀態與需要。",
  },
};

export interface QuizOptionWeight {
  style: ParentingStyleCode;
  weight: number;
}

export interface QuizOption {
  id: string;
  text: string;
  weights: QuizOptionWeight[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "【生活自理】4 歲的孩子早上堅持要自己穿鞋，但折騰了 10 分鐘還穿不好，出門快遲到了，開始發脾氣尖叫。",
    options: [
      {
        id: "q1-a",
        text: "買最容易穿的魔鬼氈鞋，事先把鞋子拉開擺好角度，甚至主動幫他套上一半，確保他完全不會遇到困難",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q1-b",
        text: "不管他怎麼叫，直接抱起來強行幫他穿好，邊穿邊罵：「就跟你說你還不會，快點要遲到了！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q1-c",
        text: "算了吧，隨便他要穿哪一雙或乾脆穿拖鞋，只要他肯出門、不哭鬧就好",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q1-d",
        text: "一直在旁邊指點：「左腳拉這裡！右腳踩下去！不對！」全程緊盯並頻繁插手微調",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q1-e",
        text: "蹲下來抱抱他：「你想自己穿，可是穿不好讓你很沮喪對不對？」平靜後說：「我們一起做，你把腳伸進去，我幫你拉後跟。」",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q1-f",
        text: "隨便他折騰，自己收拾自己的東西，完全不看他也不回應他的尖叫，任由他在門口哭",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q2",
    text: "【公共場所崩潰】在超市買東西時，2 歲半的孩子看到喜歡的玩具大哭大鬧、躺在地上甩頭，吵著一定要買。",
    options: [
      {
        id: "q2-a",
        text: "蹲下來保持冷靜：「我知道你很想要這個玩具，買不到讓你很難過。」陪他哭完，堅定地說：「但我們今天只買菜，不買玩具。」",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q2-b",
        text: "立刻拿出預先準備好的零食、平板轉移注意；還是崩潰就立刻抱著他離開現場，幫他掃除所有不適感",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q2-c",
        text: "為了撫平孩子的情緒並避免打擾別人，立刻把玩具買給他，安撫：「好啦好啦不哭了，買給你。」",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q2-d",
        text: "覺得丟臉又憤怒，抓起孩子的手大罵：「你再哭試試看！現在立刻給我起來，以後再也不帶你出來了！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q2-e",
        text: "一看有崩潰苗頭，立刻伸手拿過玩具幫他抱著、開包裝，邊走邊向店員討好，深怕他受一丁點委屈",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q2-f",
        text: "隨他躺在地上哭，自己繼續逛自己的，完全不理會也不陪伴，視若無睹地走開",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q3",
    text: "【公園社交】3 歲的孩子在公園玩溜滑梯，另一個小朋友突然衝過來插隊，還把孩子推開。",
    options: [
      {
        id: "q3-a",
        text: "怕孩子吃虧或難過，立刻拉走自己的孩子：「那我們去玩別的，這個不玩了。」主動幫他繞過這個衝突",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q3-b",
        text: "走上前對插隊的孩子溫和堅定說：「要排隊喔！」再對自己的孩子說：「被推嚇到了嗎？下次可以大聲說『請排隊！』」",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q3-c",
        text: "對自己的孩子說：「你怎麼這麼軟弱？別人推你你不會推回去嗎？不准哭！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q3-d",
        text: "在旁邊看著，覺得小孩子打打鬧鬧很正常，等他們自己解決，就算自己的孩子哭了也不打算干涉",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q3-e",
        text: "密集盤旋在孩子旁邊，一看到有人靠近就立刻伸手隔開，隨時指揮：「站這邊！握緊！小心別人推你！」",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q3-f",
        text: "坐在遠處滑手機，連孩子被推倒了都完全沒注意到",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q4",
    text: "【飲食常規】5 歲的孩子吃飯極度挑食，只吃白飯和炸雞，看到蔬菜就推開碗喊：「這個好臭我不要吃！」",
    options: [
      {
        id: "q4-a",
        text: "帶去檢查微量元素、買昂貴兒童維他命，把餐點全部打成汁、調整成免嚼食版本，確保他不會碰到不喜歡的口感",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q4-b",
        text: "威脅孩子：「今天不把蔬菜吃完，不准離開餐桌！也不准看卡通或吃點心！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q4-c",
        text: "溫和說明：「身體需要蔬菜才會變強壯喔。」允許他先嘗試一口，若堅持不吃就平靜收走餐盤，中間不提供額外零食",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q4-d",
        text: "算了吧，孩子肯吃飯就好，不想每餐都像打仗，直接順從他，只準備他愛吃的食物",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q4-e",
        text: "每頓飯都把蔬菜切得極碎藏進飯裡，邊餵邊哄、追著他餵完，隨時監視他吞了幾口",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q4-f",
        text: "隨便他吃不吃，餐桌上放著食物，愛吃什麼吃什麼，不吃拉倒，也不關心他的營養狀況",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q5",
    text: "【安全與探索】4 歲的孩子在遊樂場想要挑戰一個比較高、有難度的爬網。",
    options: [
      {
        id: "q5-a",
        text: "在適當距離防護，鼓勵他：「你想試試看對不對？踩穩這個繩子，手握緊這裡。」讓他在安全範圍內自己試探",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q5-b",
        text: "覺得太危險了，直接拒絕：「這個太高了，你還太小，我們去玩旁邊安全的搖搖馬。」主動幫他排除風險",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q5-c",
        text: "緊緊跟在旁邊，手全程扶著他的腰，不斷喊：「小心！右腳踏哪裡！手握這裡！不要動我來教你！」",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q5-d",
        text: "命令他：「要爬可以，但你必須完全聽我的指令！我說左腳踏哪裡就踏哪裡，不准亂踩，不然立刻下來！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q5-e",
        text: "隨便他，他想爬就去爬，他哭喊求救時才過去看一眼",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q5-f",
        text: "自己坐在旁邊處理自己的事，根本沒發現孩子已經爬到了高處",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q6",
    text: "【玩具分享與衝突】兩個學齡前孩子在客廳搶同一台玩具小汽車，開始拉扯並尖叫。",
    options: [
      {
        id: "q6-a",
        text: "主動衝過去幫他們分配時間（「哥哥玩 3 分鐘，弟弟玩 3 分鐘」），甚至立刻買一台一模一樣的，讓他們完全不用搶",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q6-b",
        text: "一把搶過玩具：「吵什麼吵！兩個都不要玩了！」直接沒收放高處，並處罰兩人",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q6-c",
        text: "蹲下描述狀況：「你們都好想玩這台車對不對？」引導：「但車子只有一台，你們覺得可以怎麼辦？」陪他們試著輪流或一起玩",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q6-d",
        text: "怕小的那方受委屈，立刻強迫大的那方：「你是哥哥/姊姊，本來就要讓弟弟/妹妹！快點給他！」",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q6-e",
        text: "密集介入監視，幫他們安排拿玩具的角度、設定計時器，全程站在中間擔任絕對的協調官",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q6-f",
        text: "在另一個房間做自己的事，聽見吵鬧聲也完全不予理會，讓他們自己哭喊",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q7",
    text: "【挫折與失敗】3 歲半的孩子積木蓋到一半倒塌了，他挫折地大哭，把積木摔得到處都是。",
    options: [
      {
        id: "q7-a",
        text: "主動幫他把倒塌的積木撿起來，並幫他蓋好最難、最容易倒的底座，把會導致失敗的難題全部清空",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q7-b",
        text: "接納情緒：「積木倒了你覺得很氣對不對？」平靜後說：「倒掉很正常，是不是底座沒放平？要不要再試一次？」",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q7-c",
        text: "嚴厲斥責：「亂摔東西像什麼樣子！再摔以後通通不准玩！給我去牆角站著！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q7-d",
        text: "抱著他安慰：「好了好了不哭，積木壞壞！我們不玩這個了，帶你去吃冰淇淋。」",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q7-e",
        text: "立刻坐下來「指導」他：「就跟你說過要這樣放！來，聽我的命令，拿這塊放到這裡，不准亂放！」",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q7-f",
        text: "瞥一眼說：「倒了就倒了，哭什麼哭。」然後繼續做自己的事，任由孩子發脾氣",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q8",
    text: "【睡眠常規】5 歲的孩子到了睡覺時間，依然興奮地在床上跳來跳去，拒絕躺下睡覺。",
    options: [
      {
        id: "q8-a",
        text: "幫他準備全套助眠設備（白噪音、香氛、重力毯），一直躺在旁邊幫他按摩、講故事，順著他的所有小要求，只求他能睡著",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q8-b",
        text: "板起臉孔大聲喝斥：「立刻給我躺好！眼睛閉起來！再動一下今晚試試看！」",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q8-c",
        text: "溫和堅定地關燈，抱他回床上：「現在是睡覺時間，身體需要休息了。你可以抱著小熊靜靜躺著，或聽我講最後一個故事。」",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q8-d",
        text: "隨便他，他想玩到幾點就幾點，等他自己累倒在沙發上再抱他去床上",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q8-e",
        text: "前一小時就開始密集監控睡前流程，嚴格按幾點幾分執行刷牙、穿睡衣、躺平，一有偏差就立刻介入修正",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q8-f",
        text: "自己在客廳看電視滑手機，不管孩子在房間裡做什麼，到了深夜發現孩子還沒睡也無所謂",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
];
