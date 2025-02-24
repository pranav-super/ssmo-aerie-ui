import type { ActivityDirective } from './activity';
import type { UserId } from './app';
import type { ConstraintPlanSpec } from './constraint';
import type { Model } from './model';
import type { SchedulingPlanSpecification } from './scheduling';
import type { Tag } from './tags';

export type Plan = PlanSchema & { end_time_doy: string; start_time_doy: string };

export type PlanBranchRequestAction = 'merge' | 'pull';

export type PlanCollaborator = { collaborator: UserId; plan_id: number };

export type PlanCollaboratorSlim = Pick<PlanCollaborator, 'collaborator'>;

export type PlanInsertInput = Pick<PlanSchema, 'duration' | 'model_id' | 'name' | 'start_time'>;

export type PlanMergeActivityOutcome = 'add' | 'delete' | 'modify' | 'none';

export type PlanMergeActivityDirective = ActivityDirective & { snapshot_id: number };

export type PlanMergeActivityDirectiveTarget = PlanMergeActivityDirective;

export type PlanMergeActivityDirectiveSource = Omit<PlanMergeActivityDirective, 'plan_id'>;

export type PlanMergeConflictingActivity = {
  activity_id: number;
  change_type_source: PlanMergeActivityOutcome;
  change_type_target: PlanMergeActivityOutcome;
  merge_base: PlanMergeActivityDirective;
  resolution: PlanMergeResolution;
  source: PlanMergeActivityDirectiveSource | null;
  source_tags: Tag[];
  target: PlanMergeActivityDirectiveTarget | null;
  target_tags: Tag[];
};

export type PlanMergeNonConflictingActivity = {
  activity_id: number;
  change_type: PlanMergeActivityOutcome;
  source: PlanMergeActivityDirectiveSource | null;
  source_tags: Tag[];
  target: PlanMergeActivityDirectiveTarget | null;
  target_tags: Tag[];
};

export type PlanMergeRequestType = 'incoming' | 'outgoing';

export type PlanMergeRequestTypeFilter = PlanMergeRequestType | 'all';

export type PlanMergeRequest = PlanMergeRequestSchema & { pending: boolean; type: PlanMergeRequestType };

export type PlanMergeRequestStatus = 'accepted' | 'in-progress' | 'pending' | 'rejected' | 'withdrawn';

export type PlanForMerging = Pick<PlanSchema, 'id' | 'name' | 'owner' | 'collaborators' | 'model_id'> & {
  model: Pick<Model, 'id' | 'name' | 'owner' | 'version'>;
};

export type PlanMergeRequestSchema = {
  id: number;
  plan_receiving_changes: PlanForMerging;
  plan_snapshot_supplying_changes: {
    plan: PlanForMerging;
    snapshot_id: number;
  };
  requester_username: string;
  reviewer_username: string;
  status: PlanMergeRequestStatus;
};

export type PlanMergeResolution = 'none' | 'source' | 'target';

export type PlanSchema = {
  child_plans: Pick<PlanSchema, 'id' | 'name'>[];
  collaborators: PlanCollaboratorSlim[];
  constraint_specification: ConstraintPlanSpec[];
  created_at: string;
  duration: string;
  id: number;
  is_locked: boolean;
  model: Model;
  model_id: number;
  name: string;
  owner: UserId;
  parent_plan: Pick<PlanSchema, 'id' | 'name' | 'owner' | 'collaborators' | 'is_locked'> | null;
  revision: number;
  scheduling_specification: Pick<SchedulingPlanSpecification, 'id'> | null;
  simulations: [{ id: number; simulation_datasets: [{ id: number; plan_revision: number }] }];
  start_time: string;
  tags: { tag: Tag }[];
  updated_at: string;
  updated_by: UserId;
};

export type PlanTransfer = Pick<PlanSchema, 'id' | 'model_id' | 'name' | 'start_time'> & {
  activities: Pick<
    ActivityDirective,
    'anchor_id' | 'anchored_to_start' | 'arguments' | 'id' | 'metadata' | 'name' | 'start_offset' | 'type'
  >[];
  end_time: string;
  sim_id: number;
  tags: { tag: Pick<Tag, 'id' | 'name'> }[];
};

export type PlanMetadata = Pick<
  PlanSchema,
  'id' | 'updated_at' | 'updated_by' | 'name' | 'owner' | 'created_at' | 'collaborators' | 'model'
>;

export type PlanSlim = Pick<
  Plan,
  | 'created_at'
  | 'collaborators'
  | 'duration'
  | 'end_time_doy'
  | 'id'
  | 'model_id'
  | 'name'
  | 'owner'
  | 'revision'
  | 'start_time'
  | 'start_time_doy'
  | 'tags'
  | 'updated_at'
  | 'updated_by'
>;

export type PlanSlimmer = Pick<PlanSlim, 'id' | 'name' | 'owner' | 'collaborators' | 'updated_at' | 'updated_by'>;

export type PlanSchedulingSpec = Pick<
  Plan,
  'id' | 'name' | 'scheduling_specification' | 'model_id' | 'owner' | 'collaborators'
>;
