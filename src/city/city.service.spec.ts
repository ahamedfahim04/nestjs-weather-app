import { Test, TestingModule } from '@nestjs/testing';
import { CityService } from './city.service';
import { getModelToken } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CityService', () => {
  let service: CityService;
  let cityModel: any;
  let weatherClient: any;

  beforeEach(async () => {
    // Create a Jest mock function for the Mongoose model (constructor-like)
    cityModel = jest.fn();
    cityModel.find = jest.fn();
    cityModel.findById = jest.fn();
    cityModel.findByIdAndUpdate = jest.fn();
    cityModel.findByIdAndDelete = jest.fn();

    //  Mock ClientProxy for RabbitMQ communication
    weatherClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: getModelToken('City'), useValue: cityModel },
        { provide: 'WEATHER_SERVICE', useValue: weatherClient },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE TEST
  describe('create', () => {
    it('should create and save a new city', async () => {
      const mockCityData = { name: 'Mumbai', lat: 19.07, lon: 72.87 };
      const mockSavedCity = { _id: '123', ...mockCityData };

      // Create a mock constructor behavior with save()
      const mockConstructor = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedCity),
      }));

      // Inject our mock constructor into the service
      (service as any).cityModel = mockConstructor;

      const result = await service.create(mockCityData as any);

      expect(mockConstructor).toHaveBeenCalledWith(mockCityData);
      expect(result).toEqual(mockSavedCity);
    });
  });

  // FIND ALL TEST
  describe('findAll', () => {
    it('should return all cities', async () => {
      const mockCities = [
        { _id: '1', name: 'Chennai' },
        { _id: '2', name: 'Delhi' },
      ];

      cityModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCities),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockCities);
      expect(cityModel.find).toHaveBeenCalled();
    });
  });

  // FIND ONE TEST
  describe('findOne', () => {
    it('should fetch city and weather data correctly', async () => {
      const mockCity = {
        _id: '1',
        city: 'Mumbai',
        lat: 19.07,
        lon: 72.87,
        createdAt: new Date(),
      };

      const mockWeatherData = {
        main: { temp: 30, feels_like: 32, humidity: 80, pressure: 1010 },
        wind: { speed: 5 },
        weather: [{ description: 'clear sky' }],
      };

      //  Mock DB and API calls
      cityModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCity),
      });

      mockedAxios.get.mockResolvedValue({ data: mockWeatherData } as any);

      const result = await service.findOne('1');

      expect(result.city).toBe('Mumbai');
      expect(result.weather.temperature).toBe(30);
      expect(weatherClient.emit).toHaveBeenCalledWith(
        'weather_updates',
        expect.objectContaining({
          cityId: mockCity._id,
          cityName: mockCity.city,
        }),
      );
    });

    it('should throw error if city not found', async () => {
      cityModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('999')).rejects.toThrow('City not found');
    });
  });

  // UPDATE TEST
  describe('update', () => {
    it('should update a city and return updated data', async () => {
      const mockUpdatedCity = { _id: '1', name: 'Mumbai Updated' };
      cityModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedCity);

      const result = await service.update('1', { name: 'Mumbai Updated' } as any);

      expect(result).toEqual(mockUpdatedCity);
      expect(cityModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Mumbai Updated' },
        { new: true },
      );
    });
  });

  // REMOVE TEST
  describe('remove', () => {
    it('should delete a city and return deleted data', async () => {
      const mockDeletedCity = { _id: '1', name: 'Delhi' };
      cityModel.findByIdAndDelete.mockResolvedValue(mockDeletedCity);

      const result = await service.remove('1');

      expect(result).toEqual(mockDeletedCity);
      expect(cityModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });
});
