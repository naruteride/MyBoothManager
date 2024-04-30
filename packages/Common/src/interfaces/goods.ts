import type { IDataModelBase } from "./base";

export enum GoodsStatus {
  ON_SALE ="on_sale",
  PAUSE = "pause",
  SOLD_OUT = "sold_out",
}

export enum GoodsStockVisibility {
  HIDE_ALL = "hide_all",
  SHOW_REMAINING_ONLY = "show_remaining_only",
  SHOW_ALL = "show_all",
}

export interface IGoodsCommon extends IDataModelBase {
  id: number;
  boothId: number;  // Foreign key to Booth.id
  categoryId?: number | null;  // Foreign key to GoodsCategory.id
  name: string;
  description?: string;
  price: number;
  stockInitial: number;
  stockRemaining: number;
  stockVisibility: GoodsStockVisibility;
  ownerMembersId?: number[];
}

export interface IGoods extends IGoodsCommon {
  combinationId?: number | null;  // Foreign key to GoodsCombination.id
  type?: string;
  status: GoodsStatus;
  statusReason?: string | null;
  goodsImageUrl?: string | null;
  goodsImageThumbnailData?: string | null;
}

export type IGoodsResponse = IGoods;

export const GoodsWithoutAllStockInfoOmitKey = ["stockInitial", "stockRemaining"] as const;
export type GoodsWithoutAllStockInfoOmitKey = "stockInitial" | "stockRemaining";
export type IGoodsWithoutAllStockInfoResponse = Omit<IGoodsResponse, GoodsWithoutAllStockInfoOmitKey>;

export const GoodsWithoutInitialStockInfoOmitKey = ["stockInitial"] as const;
export type GoodsWithoutInitialStockInfoOmitKey = "stockInitial";
export type IGoodsWithoutInitialStockInfoResponse = Omit<IGoodsResponse, GoodsWithoutInitialStockInfoOmitKey>;

export interface IGoodsModel extends Omit<IGoods, "goodsImageUrl" | "goodsImageThumbnailData"> {
  goodsImageId?: number | null;
}

export type GoodsCreateRequestKey = "boothId" | "categoryId" | "name" | "description" | "type" | "price" | "stockInitial" | "stockRemaining" | "stockVisibility" | "ownerMembersId";
export type IGoodsCreateRequest = Pick<IGoods, GoodsCreateRequestKey>;

export type GoodsUpdateRequestKey = GoodsCreateRequestKey | "combinationId" | "status" | "statusReason";
export type IGoodsUpdateRequest = Pick<IGoods, "boothId"> & Partial<Pick<IGoods, GoodsUpdateRequestKey>>;
