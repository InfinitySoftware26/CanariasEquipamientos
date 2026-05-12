import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SocietyService } from './society.service';
import { AddSocietyDto } from './dto/addSocietyDto';

@Controller('society')
export class SocietyController {
  constructor(private readonly societyService: SocietyService) {}

  @Get()
  allSocieties() {
    return this.societyService.findAllSocietiesService();
  }

  @Get(':id')
  oneSociety(@Param('id') id: string) {
    return this.societyService.findOneSocietyService(id);
  }

  @Post()
  addSociety(@Body() society: AddSocietyDto) {
    return this.societyService.addSocietyService(society);
  }
}