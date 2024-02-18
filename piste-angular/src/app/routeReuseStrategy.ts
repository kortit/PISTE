import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class NoReuseStrategy implements RouteReuseStrategy {
    shouldDetach(route: ActivatedRouteSnapshot): boolean { return false; }
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void { }
    shouldAttach(route: ActivatedRouteSnapshot): boolean { return false; }
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null { return null; }
    shouldReuseRoute(before: ActivatedRouteSnapshot, curr:  ActivatedRouteSnapshot): boolean {
        return false;
    }
}