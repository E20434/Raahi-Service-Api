import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AmbassadorService } from './ambassador.service';
import { CreateAmbassadorDto, AmbassadorVendorRegisterDto } from './dtos/ambassador.dto';
import {
  ResourceNotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerException,
} from '../../common/exceptions/custom.exception';

@Controller('api/v1/ambassador')
export class AmbassadorController {
  constructor(private readonly ambassadorService: AmbassadorService) {}

  @Post()
  async createAmbassador(@Body() dto: CreateAmbassadorDto) {
    try {
      return await this.ambassadorService.createAmbassador(dto);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ResourceNotFoundException ||
        error instanceof InternalServerException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create ambassador',
      );
    }
  }

  @Post('vendor/register')
  async registerVendor(@Body() dto: AmbassadorVendorRegisterDto) {
    try {
      return await this.ambassadorService.vendorRegistration(dto);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ResourceNotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to register vendor',
      );
    }
  }

  @Get('referrals')
  async getReferrals(@Query('ref_code') refCode: string) {
    if (!refCode) {
      throw new BadRequestException('ref_code query parameter is required');
    }
    try {
      return await this.ambassadorService.getReferrals(refCode);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve referrals',
      );
    }
  }
}
