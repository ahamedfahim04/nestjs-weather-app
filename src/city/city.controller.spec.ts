import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

describe('CityController', () => {
  let controller: CityController;
  let service: CityService;

  // ✅ Mock service with dummy implementations
  const mockCityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
          useValue: mockCityService,
        },
      ],
    }).compile();

    controller = module.get<CityController>(CityController);
    service = module.get<CityService>(CityService);
  });

  // ✅ Basic existence test
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ✅ Test POST /city
  describe('createCity', () => {
    it('should create a new city', async () => {
      const dto: CreateCityDto = { name: 'Mumbai', lat: 19.07 as any, lon: 72.87 as any };
      const result = { _id: '1', ...dto };

      mockCityService.create.mockResolvedValue(result);

      const response = await controller.createCity(dto);

      expect(response).toEqual(result);
      expect(mockCityService.create).toHaveBeenCalledWith(dto);
    });
  });

  // ✅ Test GET /city
  describe('getAllCity', () => {
    it('should return all cities', async () => {
      const result = [
        { _id: '1', name: 'Mumbai' },
        { _id: '2', name: 'Delhi' },
      ];

      mockCityService.findAll.mockResolvedValue(result);

      const response = await controller.getAllCity();

      expect(response).toEqual(result);
      expect(mockCityService.findAll).toHaveBeenCalled();
    });
  });

  // ✅ Test GET /city/:id
  describe('getCityById', () => {
    it('should return one city by id', async () => {
      const id = '123';
      const result = { _id: id, name: 'Chennai' };

      mockCityService.findOne.mockResolvedValue(result);

      const response = await controller.getCityById(id);

      expect(response).toEqual(result);
      expect(mockCityService.findOne).toHaveBeenCalledWith(id);
    });
  });

  // ✅ Test PUT /city/:id
  describe('updateCity', () => {
    it('should update and return city', async () => {
      const id = '1';
      const dto: UpdateCityDto = { name: 'Delhi Updated' };
      const result = { _id: id, name: 'Delhi Updated' };

      mockCityService.update.mockResolvedValue(result);

      const response = await controller.updateCity(id, dto);

      expect(response).toEqual(result);
      expect(mockCityService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  // ✅ Test DELETE /city/:id
  describe('removeCity', () => {
    it('should delete a city and return the deleted one', async () => {
      const id = '1';
      const result = { _id: id, name: 'Kolkata' };

      mockCityService.remove.mockResolvedValue(result);

      const response = await controller.removeCity(id);

      expect(response).toEqual(result);
      expect(mockCityService.remove).toHaveBeenCalledWith(id);
    });
  });
});
