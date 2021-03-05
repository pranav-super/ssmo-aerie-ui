import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import {
  activityInstanceId,
  adaptationId,
  adaptations,
  planDetail,
  planId,
  plans,
  simulationResponse,
  views,
} from '../mocks';
import * as types from '../types';

@Injectable()
export class ApiMockService {
  createActivityInstances(): Observable<types.CreateActivityInstancesResponse> {
    return new Observable(
      (o: Observer<types.CreateActivityInstancesResponse>) => {
        o.next({
          ids: [activityInstanceId],
          message: 'Activity instances created successfully',
          success: true,
        });
        o.complete();
      },
    );
  }

  createAdaptation(): Observable<types.CreateAdaptationResponse> {
    return new Observable((o: Observer<types.CreateAdaptationResponse>) => {
      o.next({
        id: adaptationId,
        message: 'Adaptation created successfully',
        success: true,
      });
      o.complete();
    });
  }

  createPlan(): Observable<types.CreatePlanResponse> {
    return new Observable((o: Observer<types.CreatePlanResponse>) => {
      o.next({
        id: planId,
        message: 'Plan created successfully',
        success: true,
      });
      o.complete();
    });
  }

  deleteActivityInstance(): Observable<types.DeleteActivityInstanceResponse> {
    return new Observable(
      (o: Observer<types.DeleteActivityInstanceResponse>) => {
        o.next({
          message: 'Activity instance deleted successfully',
          success: true,
        });
        o.complete();
      },
    );
  }

  deleteAdaptation(): Observable<types.DeleteAdaptationResponse> {
    return new Observable((o: Observer<types.DeleteAdaptationResponse>) => {
      o.next({ message: 'Adaptation deleted successfully', success: true });
      o.complete();
    });
  }

  deletePlan(): Observable<types.DeletePlanResponse> {
    return new Observable((o: Observer<types.DeletePlanResponse>) => {
      o.next({ message: 'Plan deleted successfully', success: true });
      o.complete();
    });
  }

  getAdaptations(): Observable<types.Adaptation[]> {
    return new Observable((o: Observer<types.Adaptation[]>) => {
      o.next(adaptations);
      o.complete();
    });
  }

  getPlansAndAdaptations(): Observable<{
    adaptations: types.Adaptation[];
    plans: types.Plan[];
  }> {
    return new Observable(
      (
        o: Observer<{
          adaptations: types.Adaptation[];
          plans: types.Plan[];
        }>,
      ) => {
        o.next({ adaptations, plans });
        o.complete();
      },
    );
  }

  getPlanDetail(): Observable<types.PlanDetail> {
    return new Observable((o: Observer<types.PlanDetail>) => {
      o.next(planDetail);
      o.complete();
    });
  }

  getViews(): Observable<types.View[]> {
    return new Observable((o: Observer<types.View[]>) => {
      o.next(views);
      o.complete();
    });
  }

  simulate(): Observable<types.SimulationResponse> {
    return new Observable((o: Observer<types.SimulationResponse>) => {
      o.next(simulationResponse);
      o.complete();
    });
  }

  updateActivityInstance(): Observable<types.UpdateActivityInstanceResponse> {
    return new Observable(
      (o: Observer<types.UpdateActivityInstanceResponse>) => {
        o.next({
          message: 'Activity instance updated successfully',
          success: true,
        });
        o.complete();
      },
    );
  }

  validateParameters(): Observable<types.ValidationResponse> {
    return new Observable((o: Observer<types.ValidationResponse>) => {
      o.next({
        errors: null,
        success: true,
      });
      o.complete();
    });
  }
}
