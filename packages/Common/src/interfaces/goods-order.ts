import { IDataModelBase } from "./base";

export interface IGoodsOrderDetailItem {
  gId: number;
  quantity: number;
  price: number;
}

export interface IGoodsOrder extends IDataModelBase {
  id: number;
  boothId: number;  // Foreign key to Booth.id
  order: Array<IGoodsOrderDetailItem>;  // Should be saved as JSON datatype in DB
  totalPrice: number;

  // createdAt: Date  will be autogenerated by Sequelize. Use it if needed
}
export type IGoodsOrderResponse = IGoodsOrder;

export type GoodsOrderCreateRequestKey = "boothId" | "order" | "totalPrice";
export type IGoodsOrderCreateRequest = Pick<IGoodsOrder, GoodsOrderCreateRequestKey>;
