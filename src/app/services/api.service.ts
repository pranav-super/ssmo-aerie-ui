import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import omit from 'lodash-es/omit';
import { Observable, Observer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CActivityInstanceMap,
  CActivityInstanceParameterMap,
  CActivityTypeMap,
  CActivityTypeParameter,
  CAdaptationMap,
  CPlan,
  CPlanMap,
  Id,
  SActivityInstance,
  SActivityInstanceMap,
  SActivityTypeMap,
  SAdaptationMap,
  SCreateAdaption,
  SPlan,
  SPlanMap,
} from '../types';

const { adaptationServiceBaseUrl, planServiceBaseUrl } = environment;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getActivityInstances(planId: string): Observable<CActivityInstanceMap> {
    return this.http
      .get<SActivityInstanceMap>(
        `${planServiceBaseUrl}/plans/${planId}/activity_instances`,
      )
      .pipe(
        map((sActivityInstanceMap: SActivityInstanceMap) => {
          return Object.keys(sActivityInstanceMap).reduce(
            (cActivityInstanceMap: CActivityInstanceMap, id: string) => {
              const { parameters } = sActivityInstanceMap[id];

              cActivityInstanceMap[id] = {
                ...sActivityInstanceMap[id],
                id,
                parameters: Object.keys(parameters).reduce(
                  (
                    cActivityInstanceParameterMap: CActivityInstanceParameterMap,
                    name: string,
                  ) => {
                    cActivityInstanceParameterMap[name] = {
                      name,
                      value: parameters[name],
                    };

                    return cActivityInstanceParameterMap;
                  },
                  {},
                ),
              };

              return cActivityInstanceMap;
            },
            {},
          );
        }),
      );
  }

  getPlanAndActivityTypes(
    planId: string,
  ): Observable<{ activityTypes: CActivityTypeMap; plan: CPlan }> {
    return this.http.get<SPlan>(`${planServiceBaseUrl}/plans/${planId}`).pipe(
      switchMap((sPlan: SPlan) => {
        const plan = {
          ...omit(sPlan, 'activityInstances'),
          activityInstanceIds: Object.keys(sPlan.activityInstances),
          id: planId,
        };

        return this.http
          .get<SActivityTypeMap>(
            `${adaptationServiceBaseUrl}/adaptations/${plan.adaptationId}/activities`,
          )
          .pipe(
            map((sActivityTypeMap: SActivityTypeMap) => {
              const activityTypes = Object.keys(sActivityTypeMap).reduce(
                (
                  cActivityTypeMap: CActivityTypeMap,
                  activityTypeName: string,
                ) => {
                  const { defaults, parameters } = sActivityTypeMap[
                    activityTypeName
                  ];

                  cActivityTypeMap[activityTypeName] = {
                    name: activityTypeName,
                    parameters: Object.keys(parameters).reduce(
                      (
                        cActivityTypeParameters: CActivityTypeParameter[],
                        parameterName: string,
                      ) => {
                        const { type } = parameters[parameterName];

                        cActivityTypeParameters.push({
                          default: defaults[parameterName],
                          name: parameterName,
                          type,
                        });

                        return cActivityTypeParameters;
                      },
                      [],
                    ),
                  };

                  return cActivityTypeMap;
                },
                {},
              );

              return { activityTypes, plan };
            }),
          );
      }),
    );
  }

  getAdaptations(): Observable<CAdaptationMap> {
    return this.http
      .get<SAdaptationMap>(`${adaptationServiceBaseUrl}/adaptations`)
      .pipe(
        map((sAdaptationMap: SAdaptationMap) => {
          return Object.keys(sAdaptationMap).reduce(
            (cAdaptationMap: CAdaptationMap, id: string) => {
              cAdaptationMap[id] = {
                ...sAdaptationMap[id],
                id,
              };
              return cAdaptationMap;
            },
            {},
          );
        }),
      );
  }

  createActivityInstances(
    planId: string,
    activityInstances: SActivityInstance[],
  ): Observable<string[]> {
    return this.http.post<string[]>(
      `${planServiceBaseUrl}/plans/${planId}/activity_instances`,
      activityInstances,
    );
  }

  createAdaptation(adaptation: SCreateAdaption): Observable<Id> {
    const formData = new FormData();
    formData.append('file', adaptation.file, adaptation.file.name);
    formData.append('mission', adaptation.mission);
    formData.append('name', adaptation.name);
    formData.append('owner', adaptation.owner);
    formData.append('version', adaptation.version);

    return this.http.post<Id>(
      `${adaptationServiceBaseUrl}/adaptations`,
      formData,
    );
  }

  createPlan(plan: SPlan): Observable<Id> {
    return this.http.post<Id>(`${planServiceBaseUrl}/plans`, plan);
  }

  deleteActivityInstance(
    planId: string,
    activityInstanceId: string,
  ): Observable<{}> {
    return this.http.delete(
      `${planServiceBaseUrl}/plans/${planId}/activity_instances/${activityInstanceId}`,
    );
  }

  deleteAdaptation(id: string): Observable<{}> {
    return this.http.delete(`${adaptationServiceBaseUrl}/adaptations/${id}`);
  }

  deletePlan(id: string): Observable<{}> {
    return this.http.delete(`${planServiceBaseUrl}/plans/${id}`);
  }

  getPlans(): Observable<CPlanMap> {
    return this.http.get<SPlanMap>(`${planServiceBaseUrl}/plans`).pipe(
      map((sPlanMap: SPlanMap) => {
        return Object.keys(sPlanMap).reduce(
          (cPlanMap: CPlanMap, id: string) => {
            cPlanMap[id] = {
              ...omit(sPlanMap[id], 'activityInstances'),
              activityInstanceIds: Object.keys(sPlanMap[id].activityInstances),
              id,
            };
            return cPlanMap;
          },
          {},
        );
      }),
    );
  }

  getPlan(planId: string): Observable<CPlan> {
    return this.http.get<SPlan>(`${planServiceBaseUrl}/plans/${planId}`).pipe(
      map((sPlan: SPlan) => {
        return {
          ...omit(sPlan, 'activityInstances'),
          activityInstanceIds: Object.keys(sPlan.activityInstances),
          id: planId,
        };
      }),
    );
  }

  login(username: string, password: string): Observable<string> {
    return new Observable((o: Observer<string>) => {
      // TODO.
      setTimeout(() => {
        if (username === 'testuser' && password === '123456') {
          o.next('Login success');
          o.complete();
        } else {
          o.error('Login failed. Invalid username or password.');
        }
      }, 1000);
    });
  }

  logout(): Observable<string> {
    return new Observable((o: Observer<string>) => {
      // TODO.
      setTimeout(() => {
        o.next('Logout success');
        o.complete();
      }, 1000);
    });
  }

  simulationRun(): Observable<string> {
    return new Observable((o: Observer<string>) => {
      // TODO.
      setTimeout(() => {
        o.next('Simulation success');
        o.complete();
      }, 1000);
    });
  }

  updateActivityInstance(
    planId: string,
    activityInstanceId: string,
    activityInstance: Partial<SActivityInstance>,
  ): Observable<{}> {
    return this.http.patch<{}>(
      `${planServiceBaseUrl}/plans/${planId}/activity_instances/${activityInstanceId}`,
      activityInstance,
    );
  }
}
