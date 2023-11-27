import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { PublicBoothService } from "@/modules/public/booth/booth.service";
import { AuthData, SuperAdmin } from "../auth/auth.guard";
import { IAuthPayload } from "../auth/jwt";
import { BoothService } from "./booth.service";
import { CreateBoothDTO } from "./dto/create-booth.dto";
import { UpdateBoothDTO } from "./dto/update-booth.dto";
import { UpdateBoothStatusDTO } from "./dto/update-booth-status.dto";

@Controller("/admin/booth")
export class BoothController {
  constructor(
    private readonly boothService: BoothService,
    private readonly publicBoothService: PublicBoothService) {}

  /* Normal routes */
  @Post()
  async create(@Body() createAdminDto: CreateBoothDTO, @AuthData() authData: IAuthPayload) {
    return await this.boothService.create(createAdminDto, authData.id);
  }

  @Get()
  async findAllForCurrentAccount(@AuthData() authData: IAuthPayload) {
    return await this.publicBoothService.findAll(authData.id);
  }

  @Patch(":id")
  async updateBoothInfo(@Param("id") id: string, @Body() updateBoothDto: UpdateBoothDTO, @AuthData() authData: IAuthPayload) {
    return await this.boothService.updateBoothInfo(+id, updateBoothDto, authData.id);
  }

  @Patch(":id/status")
  async updateBoothStatus(@Param("id") id: string, @Body() updateBoothStatusDto: UpdateBoothStatusDTO, @AuthData() authData: IAuthPayload) {
    return await this.boothService.updateBoothStatus(+id, updateBoothStatusDto, authData.id);
  }

  @Get(":id/goods/order")
  async findAllBoothGoodsOrder(@Param("id") boothId: string, @AuthData() authData: IAuthPayload) {
    return await this.boothService.findAllGoodsOrderOfBooth(+boothId, authData.id);
  }

  /* Super admin routes */
  @SuperAdmin()
  @Delete(":id")
  async remove(@Param("id") id: string, @AuthData() authData: IAuthPayload) {
    return await this.boothService.remove(+id, authData.id);
  }
}