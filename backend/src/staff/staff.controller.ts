import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Body,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/createStaffDto';
import { UpdateStaffDto } from './dto/uploadStaffDto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.staffService.findOne(id);
  }

  @Post()
  create(@Body() staff: CreateStaffDto) {
    return this.staffService.create(staff);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() staff: UpdateStaffDto,
  ) {
    return this.staffService.update(id, staff);
  }
}
