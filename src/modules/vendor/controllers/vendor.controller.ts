import { Controller, Post, Body, Put } from '@nestjs/common';
import { VendorCreateRequestDto } from '../dtos/vendor.dto';
import { VendorService } from '../services/vendor.service';
import { ServiceRegistrationInputDto } from '../dtos/service.dto';

@Controller('api/vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('/registration')
  public async onboardVendor(@Body() createDto: VendorCreateRequestDto) {
    return this.vendorService.createVendor(createDto);
  }

  @Put('/service/registration')
  public async onboardLocationServices(
    @Body() input: ServiceRegistrationInputDto,
  ) {
    return this.vendorService.serviceRegistration(input);
  }
}
