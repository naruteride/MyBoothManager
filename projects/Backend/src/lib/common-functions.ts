/* eslint-disable @typescript-eslint/no-explicit-any */

import { IStatusOKResponse, STATUS_OK_RESPONSE } from "@myboothmanager/common";
import { InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { BaseError, Model, ModelDefined, WhereOptions } from "sequelize";

export async function create<T extends Model<any, any>>(model: { new (): T }, dto: object, additionalParams?: Record<string, unknown>): Promise<T> {
  try {
    return await (model as unknown as ModelDefined<any, any>).create({
      ...dto,
      ...additionalParams,
    }) as unknown as T;
  } catch(error) {
    console.error(error);

    if(error instanceof BaseError) {
      // DB error
      throw new InternalServerErrorException("DB 오류");
    } else {
      // Unknown error
      throw new BadRequestException();
    }
  }
}

export async function removeTarget<T extends Model<any, any>>(model: T, ignoreParanoid: boolean = false): Promise<IStatusOKResponse> {
  try {
    await model.destroy({ force: ignoreParanoid });
    await model.save();
  } catch(error) {
    console.error(error);

    throw new BadRequestException("삭제할 수 없습니다.");
  }

  return STATUS_OK_RESPONSE;
}

export async function removeOne<T extends Model<any, any>>(model: { new (): T }, where: WhereOptions<T>, ignoreParanoid: boolean = false): Promise<IStatusOKResponse> {
  try {
    const target = await (model as unknown as ModelDefined<any, any>).findAll({ where });
    if(target.length !== 1) throw new BadRequestException("삭제 대상이 하나가 아닙니다.");

    return await removeTarget(target[0], ignoreParanoid);
  } catch(error) {
    console.error(error);

    if(error instanceof BaseError) {
      // DB error
      throw new InternalServerErrorException("DB 오류");
    } else {
      // Unknown error
      throw new BadRequestException();
    }
  }
}
