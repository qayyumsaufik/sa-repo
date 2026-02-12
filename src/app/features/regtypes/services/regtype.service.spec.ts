import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegTypeService } from './regtype.service';
import { RegType, CreateRegTypeRequest, UpdateRegTypeRequest } from '../../../shared/models/regtype.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('RegTypeService', () => {
  let service: RegTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegTypeService]
    });
    service = TestBed.inject(RegTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch reg types with paging', () => {
    const mockRegTypes: PagedResult<RegType> = {
      items: [
        { id: 1, name: 'RegType 1', count: 1, dataType: 'float', createdDate: '2024-01-01' }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getRegTypes(1, 10).subscribe(result => {
      expect(result).toEqual(mockRegTypes);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/regtype`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockRegTypes);
  });

  it('should fetch reg type by id', () => {
    const mockRegType: RegType = {
      id: 3,
      name: 'RegType 3',
      count: 2,
      dataType: 'float',
      createdDate: '2024-01-01'
    };

    service.getRegTypeById(3).subscribe(result => {
      expect(result).toEqual(mockRegType);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/regtype/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRegType);
  });

  it('should create a reg type', () => {
    const request: CreateRegTypeRequest = { name: 'New Reg', count: 1, dataType: 'float' };
    const mockRegType: RegType = {
      id: 6,
      name: 'New Reg',
      count: 1,
      dataType: 'float',
      createdDate: '2024-01-01'
    };

    service.createRegType(request).subscribe(result => {
      expect(result).toEqual(mockRegType);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/regtype`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockRegType);
  });

  it('should update a reg type', () => {
    const request: UpdateRegTypeRequest = { id: 2, name: 'Updated', count: 2, dataType: 'float' };
    const mockRegType: RegType = {
      id: 2,
      name: 'Updated',
      count: 2,
      dataType: 'float',
      createdDate: '2024-01-01',
      lastModifiedDate: '2024-01-02'
    };

    service.updateRegType(request).subscribe(result => {
      expect(result).toEqual(mockRegType);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/regtype/${request.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockRegType);
  });

  it('should delete a reg type', () => {
    service.deleteRegType(4).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/regtype/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
