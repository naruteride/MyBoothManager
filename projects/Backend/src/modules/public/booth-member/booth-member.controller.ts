import { Controller, Get, Param } from "@nestjs/common";
import { PublicBoothMemberService } from "./booth-member.service";

@Controller("/public/booth/:bId/member")
export class PublicBoothMemberController {
  constructor(private readonly publicBoothMemberService: PublicBoothMemberService) {}

  @Get()
  async findAll(@Param("bId") boothId: string) {
    return await this.publicBoothMemberService.findAll(+boothId);
  }

  @Get(":id")
  async findOne(@Param("bId") boothId: string, @Param("id") id: string) {
    return await this.publicBoothMemberService.findOne(+boothId, +id);
  }
}
