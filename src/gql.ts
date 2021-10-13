export const CREATE_ACTIVITY = `
  mutation CreateActivity($activity: merlin_activity_insert_input!) {
    createActivity: insert_merlin_activity_one(object: $activity) {
      id
    }
  }
`;

export const CREATE_CONSTRAINT = `
  mutation CreateConstraint($constraint: merlin_condition_insert_input!) {
    createConstraint: insert_merlin_condition_one(object: $constraint) {
      id
    }
  }
`;

export const CREATE_MODEL = `
  mutation CreateModel($model: merlin_mission_model_insert_input!) {
    createModel: insert_merlin_mission_model_one(object: $model) {
      id
    }
  }
`;

export const CREATE_PLAN = `
  mutation CreatePlan($plan: merlin_plan_insert_input!) {
    createPlan: insert_merlin_plan_one(object: $plan) {
      id
    }
  }
`;

export const CREATE_SIMULATION = `
  mutation CreateSimulation($simulation: merlin_simulation_insert_input!) {
    createSimulation: insert_merlin_simulation_one(object: $simulation) {
      id
    }
  }
`;

export const DELETE_ACTIVITY = `
  mutation DeleteActivity($id: Int!) {
    deleteActivity: delete_merlin_activity_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_MODEL = `
  mutation DeleteModel($id: Int!) {
    deleteModel: delete_merlin_mission_model_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_CONSTRAINT = `
  mutation DeleteConstraint($id: Int!) {
    deleteConstraint: delete_merlin_condition_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_PLAN_AND_SIMULATIONS = `
  mutation DeletePlan($id: Int!) {
    deletePlan: delete_merlin_plan_by_pk(id: $id) {
      id
    }
    deleteSimulation: delete_merlin_simulation(where: {plan_id: {_eq: $id}}) {
      returning {
        id
      }
    }
  }
`;

export const GET_MODELS = `
  query GetModels {
    models: merlin_mission_model {
      id
      jarId: jar_id,
      name
      version
    }
  }
`;

export const GET_PLAN = `
  query GetPlan($id: Int!) {
    plan: merlin_plan_by_pk(id: $id) {
      activities {
        arguments
        id
        startOffset: start_offset
        type
      }
      constraints: conditions {
        definition
        description
        id
        modelId: model_id
        name
        planId: plan_id
        summary
      }
      duration
      id
      model: mission_model {
        activityTypes: activity_types {
          name
          parameters
        }
        constraints: conditions {
          definition
          description
          id
          modelId: model_id
          name
          planId: plan_id
          summary
        }
        id
        parameters {
          parameters
        }
      }
      name
      simulations {
        arguments
        id
      }
      startTime: start_time
    }
  }
`;

export const GET_PLANS_AND_MODELS = `
  query GetPlansAndModels {
    models: merlin_mission_model {
      id
      name
    }
    plans: merlin_plan {
      duration
      id
      modelId: model_id
      name
      startTime: start_time
    }
  }
`;

export const SIMULATE = `
  query Simulate($modelId: ID!, $planId: Int!) {
    resourceTypes(adaptationId: $modelId) {
      name
      schema
    }
    simulate(planId: $planId) {
      status
      results
    }
  }
`;

export const UPDATE_ACTIVITY = `
  mutation UpdateActivity($id: Int!, $activity: merlin_activity_set_input!) {
    updateActivity: update_merlin_activity_by_pk(
      pk_columns: {id: $id}, _set: $activity
    ) {
      id
    }
  }
`;

export const UPDATE_CONSTRAINT = `
  mutation UpdateConstraint($id: Int!, $constraint: merlin_condition_set_input!) {
    updateConstraint: update_merlin_condition_by_pk(
      pk_columns: {id: $id}, _set: $constraint
    ) {
      id
    }
  }
`;

export const UPDATE_SIMULATION_ARGUMENTS = `
  mutation UpdateSimulationArguments($simulationId: Int!, $arguments: jsonb!) {
    updateSimulationArguments: update_merlin_simulation_by_pk(
      pk_columns: {id: $simulationId}, _set: { arguments: $arguments }
    ) {
      id
    }
  }
`;

export const VALIDATE_ARGUMENTS = `
  query ValidateArguments($arguments: ActivityArguments!, $activityTypeName: String!, $modelId: ID!) {
    validateArguments: validateActivityArguments(
      activityArguments: $arguments,
      activityTypeName: $activityTypeName,
      missionModelId: $modelId
    ) {
      errors
      success
    }
  }
`;
