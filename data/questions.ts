// 測驗主題資料檔。換主題時只需要改這個檔案：
// 調整 PARENTING_STYLES（風格代號與定義），以及 QUESTIONS（題目與選項權重）即可，
// 不會動到任何畫面或資料庫程式碼。

export const QUIZ_TITLE = "你是哪種育兒風格的人？";

export type ParentingStyleCode =
  | "helicopter"
  | "lawnmower"
  | "gentle"
  | "freeRange"
  | "techParenting"
  | "intensive";

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
    coreBehavior: "高度監控，密集的介入學業、人際與日常選擇。",
    benefits: "孩子安全感強、照顧周到、少走彎路。",
    risks: "降低孩子的抗壓性（Resilience），成年後焦慮感與依賴性偏高。",
    suggestion: "退後一步：從「掌控者」轉為「諮詢者」，允許孩子承擔小失敗。",
  },
  lawnmower: {
    name: "割草機育兒",
    englishName: "Lawnmower",
    coreBehavior: "主動幫孩子清空前面所有的障礙與挫折。",
    benefits: "短期內孩子生活順遂，衝突極少。",
    risks: "剝奪挫折忍受力（Frustration Tolerance），遇困難易放棄。",
    suggestion: "忍住不插手：陪伴孩子經歷情緒，教導「如何解決問題」而非代勞。",
  },
  gentle: {
    name: "正向／溫和育兒",
    englishName: "Gentle / Positive",
    coreBehavior: "強調共情與情緒接納，拒絕懲罰與權威壓制。",
    benefits: "建立極佳的親密溝通與信任關係。",
    risks: "界線拿捏不當易變成「放縱型」，父母易產生教養倦怠。",
    suggestion: "溫和而堅定：「接納所有情緒，但規範不良行為」，明確守住原則。",
  },
  freeRange: {
    name: "自由放養型",
    englishName: "Free-Range",
    coreBehavior: "信任孩子的能力，給予高度的自主權與探索空間。",
    benefits: "培養極高的獨立性、自我效能與適應力。",
    risks: "若環境評估不佳或安全感不足，可能演變成忽視。",
    suggestion: "有界線的自由：先建立安全規範（如緊急聯絡機制），再逐步放大自主範圍。",
  },
  techParenting: {
    name: "科技輔助育兒",
    englishName: "Tech-Parenting",
    coreBehavior: "運用數位工具（定位、螢幕時間管理）與社群分享。",
    benefits: "提升安全管理效率，方便紀錄與交流。",
    risks: "過度分享（Sharenting）侵犯隱私；過度追蹤引發信任危機。",
    suggestion: "尊重隱私：分享前徵求孩子同意，科技工具作為保護輔助而非監控手段。",
  },
  intensive: {
    name: "密集育兒",
    englishName: "Intensive",
    coreBehavior: "將育兒視為高度專業的投資，安排豐富的資源與課外活動。",
    benefits: "認知發展與視野開闊，能力培養豐富。",
    risks: "雙重壓力：孩子容易疲乏（Burnout），父母產生高度教養焦慮。",
    suggestion: "留白與放空：避免行程過滿，每天保留自由遊戲（Unstructured Play）時間。",
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
    text: "孩子在公園玩溜滑梯，看起來快要跌倒了，你通常會？",
    options: [
      {
        id: "q1-a",
        text: "立刻衝過去扶住，接下來全程站在旁邊緊盯著他玩",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q1-b",
        text: "玩之前先把遊樂設施四周檢查一遍，清掉可能絆倒他的石頭樹枝",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q1-c",
        text: "蹲下來抱抱他、同理他嚇了一跳的感覺，不責備也不處罰",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q1-d",
        text: "遠遠看著，讓他自己判斷風險、自己站起來",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q1-e",
        text: "在手錶或 APP 上設定安全區域提醒，有狀況能立刻收到通知",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q1-f",
        text: "順便觀察他的大肢體發展，回家後幫他安排合適的體能課補強",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q2",
    text: "孩子寫功課卡關、寫不出來，你會？",
    options: [
      {
        id: "q2-a",
        text: "直接坐到旁邊，一題一題帶著他寫完",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q2-b",
        text: "先幫他把不會的部分整理成簡單版本，讓他不會卡住",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q2-c",
        text: "先接住他的挫折感，告訴他「卡住沒關係，我陪你」，再一起想辦法",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q2-d",
        text: "讓他自己想辦法，卡住就先擱著，自己去查資料或問同學",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q2-e",
        text: "打開學習 APP，讓他看線上教學影片或用家教平台自己找解法",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q2-f",
        text: "幫他報名加強班或請家教，把這個科目的資源補齊",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q3",
    text: "幫孩子選課外活動或才藝班時，你的考量是？",
    options: [
      {
        id: "q3-a",
        text: "選自己能全程陪同、隨時看得到他的班",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q3-b",
        text: "先幫他排好一條「不會失敗」的路線，避開競爭激烈的班",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q3-c",
        text: "先問他喜不喜歡、感受如何，不喜歡就不勉強他繼續",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q3-d",
        text: "讓他自己去試幾種，喜歡就留、不喜歡就換",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q3-e",
        text: "上網爬文比較各家評價，用 APP 追蹤他的出席和進度",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q3-f",
        text: "幫他排滿音樂、運動、語言等多元活動，盡量拓展他的能力版圖",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q4",
    text: "孩子在學校跟同學吵架了，你會？",
    options: [
      {
        id: "q4-a",
        text: "馬上聯絡老師，把整件事問清楚、盯到解決為止",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q4-b",
        text: "私下先跟老師打聲招呼，以後盡量把他們分開，避免再發生",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q4-c",
        text: "先聽他說感受、同理他的情緒，不急著評斷對錯",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q4-d",
        text: "讓他自己想辦法和同學和好，除非真的太嚴重才出手",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q4-e",
        text: "到班級群組或聯絡簿 APP 上跟老師確認事發經過",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q4-f",
        text: "藉機幫他報名人際溝通或情緒管理課程，加強這方面的能力",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q5",
    text: "孩子想自己嘗試有點危險的事，例如用剪刀、切水果、爬高一點的地方，你會？",
    options: [
      {
        id: "q5-a",
        text: "不太放心讓他做，都是我來做比較快也比較安全",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q5-b",
        text: "先把環境整理到「就算失敗也不會受傷」再讓他試",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q5-c",
        text: "先同理他想嘗試的心情，溫和但堅定地說明可以做和不能做的部分",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q5-d",
        text: "提醒基本安全原則後，就讓他自己動手、自己承擔後果",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q5-e",
        text: "用手機錄下來方便事後複習，同時在旁邊用 APP 計時觀察",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q5-f",
        text: "順勢幫他報名相關的專業課程，讓他有系統地學習這項技能",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q6",
    text: "孩子考試成績不理想，你的反應是？",
    options: [
      {
        id: "q6-a",
        text: "開始緊盯他每天的讀書進度，確保下次不會再考差",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q6-b",
        text: "去跟老師談，看能不能調整考試方式或給他多一點準備時間",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q6-c",
        text: "先同理他的失落，告訴他「分數不代表你不夠好」，再一起看怎麼調整",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q6-d",
        text: "讓他自己決定要不要調整讀書方法，不太干涉",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q6-e",
        text: "用學習追蹤 APP 分析他哪個章節錯最多，抓出弱點",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q6-f",
        text: "幫他加開一對一家教或補習，把成績盡快補上來",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q7",
    text: "孩子想穿自己選的、跟你想法不太搭的衣服出門，你會？",
    options: [
      {
        id: "q7-a",
        text: "還是幫他換成我覺得比較合適、比較保險的",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q7-b",
        text: "前一晚先幫他把「不出錯」的衣服準備好，減少他亂選的機會",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q7-c",
        text: "稱讚他有自己的想法，順著他的選擇，不強迫改變",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q7-d",
        text: "讓他自己決定，出去被說了也是他自己的經驗",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q7-e",
        text: "拍照傳到家庭群組問問其他家人的意見再決定",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q7-f",
        text: "藉機帶他認識基本穿搭原則，順便安排相關的美感課程",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
  {
    id: "q8",
    text: "規劃孩子未來的升學或志願方向時，你會？",
    options: [
      {
        id: "q8-a",
        text: "幫他把每一步都規劃好，時時確認他有沒有照著走",
        weights: [
          { style: "helicopter", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
      {
        id: "q8-b",
        text: "提前打點好資源和人脈，讓他一路走得比較順",
        weights: [
          { style: "lawnmower", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q8-c",
        text: "常常和他聊天、了解他真正喜歡什麼，尊重他的感受來調整方向",
        weights: [
          { style: "gentle", weight: 2 },
          { style: "freeRange", weight: 1 },
        ],
      },
      {
        id: "q8-d",
        text: "讓他自己摸索興趣，我頂多在他問的時候給建議",
        weights: [
          { style: "freeRange", weight: 2 },
          { style: "gentle", weight: 1 },
        ],
      },
      {
        id: "q8-e",
        text: "用性向測驗 APP 和線上資源幫他分析適合的方向",
        weights: [
          { style: "techParenting", weight: 2 },
          { style: "helicopter", weight: 1 },
        ],
      },
      {
        id: "q8-f",
        text: "及早安排各種營隊、競賽、實習機會，幫他把履歷做得漂亮",
        weights: [
          { style: "intensive", weight: 2 },
          { style: "lawnmower", weight: 1 },
        ],
      },
    ],
  },
];
