import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClosuresService } from './closures.service';
import { CreateClosureDto } from './dto/createClouseDto';

@Controller('closures')
export class ClosuresController {
  constructor(private readonly closuresService: ClosuresService) {}

  @Post()
  createClosure(@Body() closure: CreateClosureDto) {
    return this.closuresService.createClosureService(closure);
  }

  @Get()
  getClosures() {
    return this.closuresService.getClosuresService();
  }

  @Get(':id')
  getClosureById(@Param('id') id: string) {
    return this.closuresService.getClosureByIdService(id);
  }

  @Get('staff/:staffId')
  getClosuresByStaffId(@Param('staffId') staffId: string) {
    return this.closuresService.getClosuresByStaffIdService(staffId);
  }
}
