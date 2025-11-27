
import { Recipe } from '../types';

export const STATIC_RECIPES: Record<string, Recipe> = {
  "西红柿炒鸡蛋": {
    id: "static_tomato_eggs",
    title: "西红柿炒鸡蛋",
    description: "一道经典家常菜，金黄蓬松的鸡蛋与鲜红多汁的番茄完美融合，口感软嫩，酸甜适口，散发着诱人的葱香，是餐桌上不可或缺的温馨滋味。",
    cuisineType: "家常菜",
    difficulty: "Easy",
    prepTime: "5分钟",
    cookTime: "5分钟",
    servings: "2人份",
    ingredients: [
      { name: "鸡蛋", amount: "3个", category: "肉类" },
      { name: "西红柿", amount: "2个", category: "蔬菜" },
      { name: "葱", amount: "1根", category: "佐料", notes: "切葱花" },
      { name: "盐", amount: "1茶匙", category: "佐料" },
      { name: "白糖", amount: "1茶匙", category: "佐料" },
      { name: "食用油", amount: "2勺", category: "佐料" },
      { name: "蒜", amount: "2瓣", category: "佐料", notes: "切末" }
    ],
    steps: [
      { title: "备菜", instruction: "西红柿洗净切块（喜欢口感细腻的可去皮）；鸡蛋打入碗中，加少许盐打散；葱切葱花，蒜切末。" },
      { title: "炒蛋", instruction: "热锅凉油，油热后倒入蛋液，用筷子快速划散，炒至凝固盛出备用。", duration: "2分钟" },
      { title: "炒红", instruction: "锅中再加少许油，放入蒜末爆香，倒入西红柿块，中火煸炒，边炒边按压出汁（可加少许水）。", duration: "3分钟" },
      { title: "混合", instruction: "倒入炒好的鸡蛋，加入盐和白糖调味，快速翻炒均匀，让鸡蛋吸满汤汁。" },
      { title: "出锅", instruction: "撒上葱花，装盘即可。" }
    ],
    tips: ["炒鸡蛋时油温要稍高，鸡蛋才蓬松。", "西红柿要炒出红油，汤汁才浓郁。", "加糖可以中和酸味，提升鲜度。"],
    nutrition: {
      calories: "320 kcal",
      protein: "14g",
      carbs: "12g",
      fat: "24g",
      micronutrients: {
        sodium: "600mg", sugar: "8g", fiber: "2g", calcium: "45mg", iron: "1.2mg", vitaminC: "25mg"
      }
    },
    imagePrompt: "Close up shot of Chinese Tomato and Egg Stir Fry, fluffy yellow scrambled eggs mixed with juicy red tomato wedges, glistening with sauce, garnished with fresh chopped green onions, in a white ceramic plate, soft natural lighting, high resolution.",
    imageUrl: "https://images.unsplash.com/photo-1541257777126-14c1f93f66c9?auto=format&fit=crop&w=800"
  },
  "红烧肉": {
    id: "static_braised_pork",
    title: "红烧肉",
    description: "色泽红亮，肥而不腻，入口即化。精选五花肉经过煸炒与慢炖，肉皮软糯弹牙，瘦肉酥烂入味，浓油赤酱中透着甘甜。",
    cuisineType: "本帮菜",
    difficulty: "Medium",
    prepTime: "10分钟",
    cookTime: "60分钟",
    servings: "4人份",
    ingredients: [
      { name: "五花肉", amount: "500g", category: "肉类", notes: "带皮三层肉" },
      { name: "姜", amount: "3片", category: "佐料" },
      { name: "葱", amount: "2根", category: "佐料", notes: "打结" },
      { name: "冰糖", amount: "20g", category: "佐料" },
      { name: "生抽", amount: "2汤匙", category: "佐料" },
      { name: "老抽", amount: "1汤匙", category: "佐料" },
      { name: "料酒", amount: "2汤匙", category: "佐料" },
      { name: "八角", amount: "1个", category: "香料" }
    ],
    steps: [
      { title: "焯水", instruction: "五花肉切成2-3厘米见方的块，冷水下锅，加姜片和料酒，煮开后撇去浮沫，捞出沥干。", duration: "5分钟" },
      { title: "煸炒", instruction: "锅中不放油，放入肉块中小火煸炒，煎出多余油脂，至表面微黄，盛出备用。" },
      { title: "炒糖色", instruction: "锅中留底油，放入冰糖，小火炒至融化呈琥珀色。", duration: "3分钟" },
      { title: "上色", instruction: "倒入肉块快速翻炒，使每块肉都均匀裹上糖色，加入生抽、老抽翻炒均匀。" },
      { title: "炖煮", instruction: "加入没过肉块的热水，放入葱结、姜片、八角。大火烧开后转小火慢炖。", duration: "45分钟" },
      { title: "收汁", instruction: "挑出葱姜八角，转大火收汁，不停翻炒至汤汁浓稠包裹在肉上即可。" }
    ],
    tips: ["一定要用热水炖肉，冷水会使肉质紧缩。", "炒糖色要小火，避免炒焦发苦。", "最后收汁是关键，要看住火候。"],
    nutrition: {
      calories: "450 kcal",
      protein: "10g",
      carbs: "5g",
      fat: "40g",
      micronutrients: {
        sodium: "800mg", sugar: "10g", fiber: "0g", calcium: "10mg", iron: "0.8mg", vitaminC: "0mg"
      }
    },
    imagePrompt: "Traditional Chinese Red Braised Pork Belly (Hong Shao Rou), cubes of glistening caramelized pork belly with rich dark red sauce, served in a clay pot, steam rising, garnished with fresh herbs, appetizing, 4k food photography.",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800"
  },
  "清蒸鲈鱼": {
    id: "static_steamed_bass",
    title: "清蒸鲈鱼",
    description: "最大程度保留了鱼肉的鲜美，鱼肉洁白细嫩，口感爽滑。葱姜的香气去除了腥味，淋上热油激发的豉油香，清淡却不寡淡。",
    cuisineType: "粤菜",
    difficulty: "Medium",
    prepTime: "10分钟",
    cookTime: "8分钟",
    servings: "2人份",
    ingredients: [
      { name: "鲈鱼", amount: "1条", category: "肉类", notes: "约500g" },
      { name: "大葱", amount: "1根", category: "佐料", notes: "切丝" },
      { name: "姜", amount: "1块", category: "佐料", notes: "切丝和片" },
      { name: "红椒", amount: "少许", category: "蔬菜", notes: "切丝装饰" },
      { name: "蒸鱼豉油", amount: "3勺", category: "佐料" },
      { name: "食用油", amount: "2勺", category: "佐料" },
      { name: "料酒", amount: "1勺", category: "佐料" }
    ],
    steps: [
      { title: "腌制", instruction: "鲈鱼处理干净，背部划几刀。用料酒和姜片涂抹全身，腌制10分钟去腥。" },
      { title: "装盘", instruction: "盘底铺上姜片和葱段，放上腌好的鱼（将腌制的姜片扔掉换新的）。" },
      { title: "蒸制", instruction: "水开后上蒸锅，大火蒸8分钟（根据鱼的大小调整，眼珠突出即可），关火虚蒸2分钟。", duration: "8分钟" },
      { title: "倒水", instruction: "取出盘子，倒掉盘中蒸出的腥水，拣去变黄的葱姜。" },
      { title: "淋油", instruction: "铺上新鲜的葱丝、姜丝、红椒丝。淋上蒸鱼豉油。烧热食用油，浇在葱姜丝上激发出香味。" }
    ],
    tips: ["蒸鱼时间要严格控制，老了口感大打折扣。", "一定要倒掉蒸出来的汤汁，那是腥味的来源。", "最后泼热油是点睛之笔。"],
    nutrition: {
      calories: "180 kcal",
      protein: "22g",
      carbs: "2g",
      fat: "9g",
      micronutrients: {
        sodium: "500mg", sugar: "1g", fiber: "0.5g", calcium: "50mg", iron: "1mg", vitaminC: "2mg"
      }
    },
    imagePrompt: "Steamed Sea Bass Chinese style, whole fish on an oval white plate, topped with shredded green onions and ginger, soy sauce base, hot oil glistening, minimalist presentation, high end restaurant style.",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800"
  },
  "宫保鸡丁": {
    id: "static_kung_pao_chicken",
    title: "宫保鸡丁",
    description: "闻名中外的传统名菜。鸡肉滑嫩，花生香脆，辣而不燥，酸甜适口。红而不辣、香辣味浓、肉质滑脆。",
    cuisineType: "川菜",
    difficulty: "Medium",
    prepTime: "15分钟",
    cookTime: "10分钟",
    servings: "3人份",
    ingredients: [
      { name: "鸡胸肉", amount: "300g", category: "肉类" },
      { name: "花生米", amount: "50g", category: "其他", notes: "炸脆" },
      { name: "干辣椒", amount: "10个", category: "香料", notes: "剪段" },
      { name: "花椒", amount: "1勺", category: "香料" },
      { name: "大葱", amount: "2根", category: "佐料", notes: "切段" },
      { name: "姜", amount: "3片", category: "佐料" },
      { name: "蒜", amount: "2瓣", category: "佐料" },
      { name: "淀粉", amount: "1勺", category: "佐料" },
      { name: "醋", amount: "2勺", category: "佐料" },
      { name: "糖", amount: "2勺", category: "佐料" },
      { name: "酱油", amount: "1勺", category: "佐料" }
    ],
    steps: [
      { title: "腌制", instruction: "鸡胸肉拍松切丁，加料酒、少许盐、淀粉抓匀腌制10分钟。" },
      { title: "调汁", instruction: "碗中加入醋、糖、酱油、淀粉、少许水调成碗芡（糖醋比例约为1:1）。" },
      { title: "炒肉", instruction: "热锅凉油，下鸡丁滑炒至变色发白，盛出备用。", duration: "3分钟" },
      { title: "爆香", instruction: "锅中留底油，小火放入花椒和干辣椒炒出香味，变成棕红色。" },
      { title: "合炒", instruction: "放入葱姜蒜炒香，倒入鸡丁翻炒均匀。", duration: "2分钟" },
      { title: "收汁", instruction: "倒入调好的碗芡，大火翻炒收汁。最后加入炸好的花生米，翻匀出锅。" }
    ],
    tips: ["鸡丁要滑炒，时间不宜过长保持嫩滑。", "花生米要最后放，保持酥脆。", "荔枝味型是关键，糖醋比例要适中。"],
    nutrition: {
      calories: "380 kcal",
      protein: "25g",
      carbs: "15g",
      fat: "22g",
      micronutrients: {
        sodium: "900mg", sugar: "12g", fiber: "3g", calcium: "30mg", iron: "1.5mg", vitaminC: "5mg"
      }
    },
    imagePrompt: "Kung Pao Chicken, diced chicken with peanuts, dried red chili peppers, and green onions, glossy brown sauce, close up shot, vibrant colors, authentic Sichuan cuisine photography.",
    imageUrl: "https://images.unsplash.com/photo-1626202158925-52d3a3628469?auto=format&fit=crop&w=800"
  },
  "麻婆豆腐": {
    id: "static_mapo_tofu",
    title: "麻婆豆腐",
    description: "川菜代表作之一。豆腐形整不烂，牛肉酥香，麻、辣、烫、香、酥、嫩、鲜、活八字箴言。",
    cuisineType: "川菜",
    difficulty: "Medium",
    prepTime: "10分钟",
    cookTime: "15分钟",
    servings: "3人份",
    ingredients: [
      { name: "嫩豆腐", amount: "400g", category: "蔬菜", notes: "切方块" },
      { name: "牛肉末", amount: "100g", category: "肉类" },
      { name: "郫县豆瓣酱", amount: "1勺", category: "佐料" },
      { name: "花椒粉", amount: "适量", category: "香料" },
      { name: "蒜苗", amount: "2根", category: "蔬菜", notes: "切段" },
      { name: "豆豉", amount: "1勺", category: "佐料" },
      { name: "辣椒面", amount: "1勺", category: "香料" },
      { name: "水淀粉", amount: "适量", category: "佐料" }
    ],
    steps: [
      { title: "焯水", instruction: "豆腐切块，放入加了盐的沸水中焯烫1分钟，去除豆腥味，捞出沥干。", duration: "2分钟" },
      { title: "炒酥肉", instruction: "热锅凉油，下牛肉末煸炒，炒干水分至酥香，盛出备用。" },
      { title: "炒料", instruction: "锅中留油，下豆瓣酱炒出红油，加入豆豉、辣椒面、蒜末炒香。" },
      { title: "烧制", instruction: "加入适量清水或高汤，煮开后滑入豆腐，加入炒好的牛肉末，中小火煮3分钟。", duration: "3分钟" },
      { title: "勾芡", instruction: "分三次淋入水淀粉勾芡，每次轻轻推锅，使汤汁浓稠包裹豆腐。" },
      { title: "出锅", instruction: "撒上蒜苗段，盛出后在表面均匀撒上一层花椒粉。" }
    ],
    tips: ["豆腐焯水加盐可以增加韧性不易碎。", "勾芡要分三次，这也是“活”的体现。", "花椒粉要最后撒，麻味才足。"],
    nutrition: {
      calories: "220 kcal",
      protein: "18g",
      carbs: "8g",
      fat: "14g",
      micronutrients: {
        sodium: "1000mg", sugar: "3g", fiber: "4g", calcium: "150mg", iron: "2mg", vitaminC: "2mg"
      }
    },
    imagePrompt: "Mapo Tofu, cubes of silken tofu in a spicy red sauce with minced beef, topped with ground sichuan peppercorn and green garlic sprouts, in a rustic bowl, high contrast, spicy atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800"
  }
};
