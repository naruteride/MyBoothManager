import { Booth, BoothStatus } from "@/admin/booth/entities/booth.entity";
import { Goods, GoodsCategory } from "@/admin/goods/entities/goods.entity";

export const boothList: Record<number, Booth> = {
  100000: {
    id: 100000,
    name: "Main Test Booth",
    description: "Awesome Booth Main",
    currencySymbol: "₩",
    status: {
      status: BoothStatus.OPEN,
    },
  },
  100001: {
    id: 100001,
    name: "Test booth #2",
    description: "Awesome Booth #2",
    currencySymbol: "$",
    status: {
      status: BoothStatus.PAUSE,
      reason: "Lunch time ;)",
    },
  },
  111111: {
    id: 111111,
    name: "Test booth #3",
    description: "Awesome Booth #3",
    currencySymbol: "₩",
    status: {
      status: BoothStatus.PREPARE,
      reason: "111111",
    },
  },
  222222: {
    id: 222222,
    name: "Test booth #4",
    description: "Awesome Booth #4",
    currencySymbol: "$",
    status: {
      status: BoothStatus.CLOSE,
    },
  },
  333333: {
    id: 333333,
    name: "Test booth #5",
    description: "Awesome Booth #5",
    currencySymbol: "¥",
    status: {
      status: BoothStatus.OPEN,
    },
  },
  444444: {
    id: 444444,
    name: "Test booth #6",
    description: "Awesome Booth #6",
    currencySymbol: "¥",
    status: {
      status: BoothStatus.PAUSE,
    },
  },
  555555: {
    id: 555555,
    name: "Test booth #7",
    description: "Awesome Booth #7",
    currencySymbol: "¥",
    status: {
      status: BoothStatus.CLOSE,
    },
  },
};

export const goodsCategoryList: Record<number, GoodsCategory> = {
  1: {
    id: 1,
    boothId: 100000,
    name: "블루아카이브",
  },
  2: {
    id: 2,
    boothId: 100000,
    name: "원신",
  },
  3: {
    id: 3,
    boothId: 100000,
    name: "기타",
  },
};

export const goodsList: Record<number, Goods> = {
  1: {
    id: 1,
    boothId: 100000,
    categoryId: 2,
    name: "나히다 포토카드",
    price: 1000,
    stock: {
      initial: 100,
      current: 50,
    },
  },
  2: {
    id: 2,
    boothId: 100000,
    categoryId: 1,
    name: "프라나 아크릴 스탠드",
    price: 15000,
    stock: {
      initial: 30,
      current: 20,
    },
  },
  3: {
    id: 3,
    boothId: 100000,
    categoryId: 1,
    name: "모모이 SD 아크릴 키링",
    price: 8000,
    stock: {
      initial: 20,
      current: 15,
    },
  },
  4: {
    id: 4,
    boothId: 100001,
    categoryId: 3,
    name: "Awesome Goods at Test booth #2",
    price: 333333,
    stock: {
      initial: 5,
      current: 3,
    },
  },
};
