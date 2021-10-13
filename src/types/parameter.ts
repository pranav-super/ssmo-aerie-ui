export type FormParameter = {
  error: string | null;
  file?: File;
  index?: number;
  key?: string;
  loading: boolean;
  name: string;
  schema: any;
  validate: boolean;
  value: any;
};

export type Argument = any;
export type ArgumentsMap = { [name: string]: Argument };

export type Parameter = { type: string } & any;
export type ParametersMap = { [name: string]: Parameter };

export type ParameterValidationResponse = {
  errors: string[] | null;
  success: boolean;
};
