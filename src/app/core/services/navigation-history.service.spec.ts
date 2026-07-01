import { TestBed } from '@angular/core/testing';
import { NavigationHistoryService } from './navigation-history.service';
import { Router } from '@angular/router';

describe('NavigationHistoryService', () => {
  let service: NavigationHistoryService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            events: {
              pipe: () => ({
                subscribe: () => {}
              })
            },
            url: '/'
          }
        }
      ]
    });
    service = TestBed.inject(NavigationHistoryService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return fixed routes', () => {
    const fixedRoutes = service.getFixedRoutes();
    expect(fixedRoutes.length).toBe(2);
    expect(fixedRoutes[0].title).toBe('Dashboard');
    expect(fixedRoutes[1].title).toBe('Punto de Venta');
  });

  it('should clear history', () => {
    service.clearHistory();
    expect(service.history().length).toBe(0);
  });
});
