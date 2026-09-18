// 測驗主題資料檔。換主題時只需要改這個檔案：
// 調整 PARENTING_STYLES（風格代號與定義），以及 QUESTIONS（題目與選項權重）即可，
// 不會動到任何畫面或資料庫程式碼。
//
// 這一版刻意用「森林動物寓言」包裝題目：情境和選項都不直接講育兒，
// 是為了避免受測者從字面猜出「哪個答案比較政治正確」而照著選，
// 藉此讓作答更接近真實行為傾向，而不是理想答案。

export const QUIZ_TITLE = "你是哪一種動物爸媽？";

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
    name: "老鷹型",
    englishName: "Eagle",
    coreBehavior: "像老鷹盤旋在幼鳥上空一樣，高度監控孩子的一舉一動，隨時準備介入、糾正、代勞。",
    benefits: "孩子感受到高度關注與保護，安全感十足。",
    risks: "孩子缺乏獨立嘗試與犯錯的機會，容易缺乏自信、抗壓性偏低。",
    suggestion: "練習把盤旋的高度拉高一點：先觀察，等孩子真的求助再介入，把糾正換成提問。",
  },
  lawnmower: {
    name: "河狸型",
    englishName: "Beaver",
    coreBehavior: "像河狸築壩一樣，主動預先改造環境、清除孩子可能遇到的困難，確保前方暢行無阻。",
    benefits: "孩子少走彎路，短期內挫折與衝突較少。",
    risks: "剝奪孩子練習面對挫折、解決問題的機會，遇到無法預先清除的困難時容易崩潰。",
    suggestion: "忍住不代勞，讓孩子經歷小挫折，陪他一起想辦法而不是直接幫他解決。",
  },
  tiger: {
    name: "老虎型",
    englishName: "Tiger",
    coreBehavior: "像老虎一樣強勢威嚴，高標準、重紀律，常用責罵、威脅或處罰要求孩子立即服從。",
    benefits: "短期內孩子行為快速符合要求，規矩明確。",
    risks: "孩子容易因恐懼而順從而非理解，長期可能影響親子信任與情緒調節能力。",
    suggestion: "把命令換成「說明＋選擇」，用溫和但堅定的語氣取代責罵與威脅。",
  },
  permissive: {
    name: "兔子型",
    englishName: "Rabbit",
    coreBehavior: "像兔子一樣容易緊張、傾向迴避衝突，為了讓孩子停止哭鬧經常妥協讓步，也較少堅持規則。",
    benefits: "親子當下氣氛和緩，衝突發生的頻率較低。",
    risks: "孩子難以學習面對挫折與規則界線，長期可能更容易用情緒勒索達成目的。",
    suggestion: "練習溫和而堅定地說「不」，允許孩子有情緒，但不因此改變決定。",
  },
  gentle: {
    name: "熊型",
    englishName: "Bear",
    coreBehavior: "像熊媽媽一樣，先溫暖地接住孩子的情緒，再溫和而堅定地維持界線，引導孩子一起想辦法。",
    benefits: "建立良好的親子信任與溝通，孩子情緒調節與問題解決能力較佳。",
    risks: "需要花更多耐心與時間，情緒不穩定時容易變成放任。",
    suggestion: "持續練習「先接住情緒、後談規則」的順序，必要時給自己緩衝時間再回應。",
  },
  uninvolved: {
    name: "杜鵑鳥型",
    englishName: "Cuckoo",
    coreBehavior: "像杜鵑鳥一樣，對孩子的狀況與情緒反應較少關注或回應，經常任由孩子自行處理。",
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
    text: "【築巢】幼獸怎麼都叼不穩樹枝，急得直跳腳。",
    options: [
      {
        id: "q1-a",
        text: "先備好剛好的樹枝，讓牠不費力",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q1-b",
        text: "斥責牠沒用，直接接手做完",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q1-c",
        text: "心一軟，直接幫牠做好",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q1-d",
        text: "緊盯每個動作，隨時出手糾正",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q1-e",
        text: "陪牠一起試，適時搭一把手",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q1-f",
        text: "沒空理牠，忙自己的事",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q2",
    text: "【莓果】幼獸看見別隻動物手上的大莓果，尖叫著非要不可。",
    options: [
      {
        id: "q2-a",
        text: "同理牠的渴望，但溫和堅持不搶",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q2-b",
        text: "早準備好備用莓果，轉移注意",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q2-c",
        text: "為了讓牠安靜，硬幫牠搶一顆",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q2-d",
        text: "威嚇一聲，叼著牠就走",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q2-e",
        text: "立刻護到翅膀下，對外示警",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q2-f",
        text: "隨牠鬧，自己繼續覓食",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q3",
    text: "【水窪】幼獸被同伴推開，跌坐在水窪邊。",
    options: [
      {
        id: "q3-a",
        text: "帶牠換一個沒人的水源",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q3-b",
        text: "溫和排解，鼓勵牠下次站穩",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q3-c",
        text: "罵牠沒用，這麼容易被推倒",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q3-d",
        text: "在旁看著，沒打算介入",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q3-e",
        text: "來回盤旋，隔開所有靠近的動物",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q3-f",
        text: "忙著覓食，沒注意到牠跌倒",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q4",
    text: "【挑食】幼獸聞了聞堅果，推開不吃，只肯吃某種漿果。",
    options: [
      {
        id: "q4-a",
        text: "到處尋找，只帶牠愛吃的那種",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q4-b",
        text: "堅持吃完，不准牠離開",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q4-c",
        text: "讓牠試一口，不吃就先收起來",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q4-d",
        text: "乾脆只準備牠愛吃的",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q4-e",
        text: "啄碎混進食物，緊盯牠吞下",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q4-f",
        text: "食物擺著，吃不吃隨牠",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q5",
    text: "【老樹】幼獸盯著一棵高聳的老樹，躍躍欲試。",
    options: [
      {
        id: "q5-a",
        text: "在樹下守著，讓牠自己試",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q5-b",
        text: "太危險，直接領牠去別處",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q5-c",
        text: "緊跟身邊，每步都伸爪扶著",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q5-d",
        text: "下令，每步都得照牠說的走",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q5-e",
        text: "隨牠爬，喊救命才抬頭看",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q5-f",
        text: "忙自己的事，沒發現牠爬那麼高",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q6",
    text: "【樹枝】兩隻幼獸搶著同一根樹枝，拉扯尖叫。",
    options: [
      {
        id: "q6-a",
        text: "立刻再找一根，分給牠們",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q6-b",
        text: "一把沒收，誰都不准玩",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q6-c",
        text: "陪牠們一起想辦法輪流",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q6-d",
        text: "逼自己的孩子先讓步",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q6-e",
        text: "緊張介入，規定誰先咬幾口",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q6-f",
        text: "由著牠們鬧，自己理毛",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q7",
    text: "【倒塌】幼獸辛苦堆的巢倒塌，挫折地尖叫、踢散樹枝。",
    options: [
      {
        id: "q7-a",
        text: "立刻幫牠重堆好，順便加固",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q7-b",
        text: "先陪牠平復，再一起試一次",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q7-c",
        text: "低吼斥責牠亂踢東西",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q7-d",
        text: "心疼地帶牠去玩別的",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q7-e",
        text: "立刻接手，命令牠照做",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q7-f",
        text: "瞥一眼，繼續做自己的事",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
  {
    id: "q8",
    text: "【入夜】天色已暗，幼獸還在巢外跳來跳去不肯睡。",
    options: [
      {
        id: "q8-a",
        text: "鋪好舒適的巢，陪到牠睡著為止",
        weights: [{ style: "lawnmower", weight: 2 }],
      },
      {
        id: "q8-b",
        text: "低吼命令牠立刻躺好",
        weights: [{ style: "tiger", weight: 2 }],
      },
      {
        id: "q8-c",
        text: "溫和堅定地引牠回巢休息",
        weights: [{ style: "gentle", weight: 2 }],
      },
      {
        id: "q8-d",
        text: "隨牠玩到自己累倒",
        weights: [{ style: "permissive", weight: 2 }],
      },
      {
        id: "q8-e",
        text: "緊盯流程，一有偏差就糾正",
        weights: [{ style: "helicopter", weight: 2 }],
      },
      {
        id: "q8-f",
        text: "自己先回巢，不管牠",
        weights: [{ style: "uninvolved", weight: 2 }],
      },
    ],
  },
];
