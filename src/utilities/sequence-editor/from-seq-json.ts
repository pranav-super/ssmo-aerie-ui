import type {
  Args,
  BooleanArgument,
  Description,
  HexArgument,
  Metadata,
  Model,
  NumberArgument,
  StringArgument,
  SymbolArgument,
  Time,
  VariableDeclaration,
} from '@nasa-jpl/seq-json-schema/types';
import { quoteEscape } from '../codemirror/codemirror-utils';
import { logError } from './logger';

/**
 * Transform a sequence JSON time to it's sequence string form.
 */
function seqJsonTimeToSequence(time: Time): string {
  switch (time.type) {
    case 'ABSOLUTE':
      return `A${time?.tag ?? ''}`;
    case 'COMMAND_COMPLETE':
      return 'C';
    case 'COMMAND_RELATIVE':
      return `R${time?.tag ?? ''}`;
    case 'EPOCH_RELATIVE':
      return `E${time?.tag ?? ''}`;
    default:
      return '';
  }
}

/**
 * Transform a base argument (non-repeat) into a string.
 */
function seqJsonBaseArgToSequence(
  arg: StringArgument | NumberArgument | BooleanArgument | SymbolArgument | HexArgument,
): string {
  switch (arg.type) {
    case 'string':
      return `${quoteEscape(arg.value)}`;
    case 'boolean':
      return arg.value ? 'TRUE' : 'FALSE';
    default:
      return `${arg.value}`;
  }
}

function seqJsonArgsToSequence(args: Args): string {
  let result = '';

  for (const arg of args) {
    result += ' ';
    if (arg.type === 'repeat') {
      if (Array.isArray(arg.value)) {
        let repeatResult = '';
        for (const repeatArgSet of arg.value) {
          if (Array.isArray(repeatArgSet)) {
            for (const repeatArg of repeatArgSet) {
              repeatResult += ` ${seqJsonBaseArgToSequence(repeatArg)}`;
            }
            repeatResult = repeatResult.trim();
          } else {
            logError('Repeat arg set value is not an array');
          }
        }
        result += `[${repeatResult}]`;
      } else {
        logError('Repeat arg value is not an array');
      }
    } else {
      result += seqJsonBaseArgToSequence(arg);
    }
    result = result.trimEnd();
  }

  return result.trim().length > 0 ? ` ${result.trim()}` : '';
}

function seqJsonModelsToSequence(models: Model[]): string {
  // MODEL directives are one per line, the last new line is to start the next token
  const modelString = models
    .map(model => {
      let formattedValue: Model['value'] = model.value;
      if (typeof model.value === 'string') {
        formattedValue = quoteEscape(model.value);
      } else if (typeof model.value === 'boolean') {
        formattedValue = model.value.toString().toUpperCase();
      }
      return `@MODEL ${typeof model.variable === 'string' ? quoteEscape(String(model.variable)) : `"${model.variable}"`} ${formattedValue} ${quoteEscape(model.offset)}`;
    })
    .join('\n');

  return modelString.length > 0 ? `${modelString}\n` : '';
}

function seqJsonMetadataToSequence(metadata: Metadata): string {
  // METADATA directives are one per line, the last new line is to start the next token
  const metaDataString = Object.entries(metadata)
    .map(
      ([key, value]: [key: string, value: unknown]) =>
        `@METADATA ${quoteEscape(key)} ${JSON.stringify(value, null, 2)}`,
    )
    .join('\n');
  return metaDataString.length > 0 ? `${metaDataString}\n` : '';
}

function seqJsonVariableToSequence(
  variables: [VariableDeclaration, ...VariableDeclaration[]],
  type: 'INPUT_PARAMS' | 'LOCALS',
): string {
  return `@${type} ${variables.map(variable => variable.name).join(' ')}\n`;
}

function seqJsonDescriptionToSequence(description: Description): string {
  return ` # ${description}\n`;
}

/**
 * Transforms a sequence JSON to a sequence string.
 */
export async function seqJsonToSequence(input: string | null): Promise<string> {
  const sequence: string[] = [];

  if (input !== null) {
    const seqJson = JSON.parse(input);

    // ID
    sequence.push(`@ID "${seqJson.id}"\n`);

    //input params
    if (seqJson.parameters) {
      sequence.push(seqJsonVariableToSequence(seqJson.parameters, 'INPUT_PARAMS'));
    }

    //locals
    if (seqJson.locals) {
      sequence.push(seqJsonVariableToSequence(seqJson.locals, 'LOCALS'));
    }

    if (seqJson.metadata) {
      // remove lgo from metadata if it exists
      sequence.push(
        seqJsonMetadataToSequence(
          Object.entries(seqJson.metadata)
            .filter(([key]) => key !== 'lgo')
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as Metadata,
        ),
      );
    }

    // Load and Go
    if (seqJson.metadata.lgo) {
      sequence.push(`\n@LOAD_AND_GO`);
    }

    // FSW Commands
    if (seqJson.steps) {
      sequence.push(`\n`);
      for (const step of seqJson.steps) {
        if (step.type === 'command') {
          const time = seqJsonTimeToSequence(step.time);
          const args = seqJsonArgsToSequence(step.args);
          const metadata = step.metadata ? seqJsonMetadataToSequence(step.metadata) : '';
          const models = step.models ? seqJsonModelsToSequence(step.models) : '';
          const description = step.description ? seqJsonDescriptionToSequence(step.description) : '';

          let commandString = `${time} ${step.stem}${args}${description}`;
          // add a new line if on doesn't exit at the end of the commandString
          if (!commandString.endsWith('\n')) {
            commandString += '\n';
          }
          // Add modeling data if it exists
          commandString += `${metadata}${models}`;
          sequence.push(commandString);
        }
      }
    }

    // Immediate Commands
    if (seqJson.immediate_commands) {
      sequence.push(`\n`);
      sequence.push(`@IMMEDIATE\n`);
      for (const icmd of seqJson.immediate_commands) {
        const args = seqJsonArgsToSequence(icmd.args);
        const description = icmd.description ? seqJsonDescriptionToSequence(icmd.description) : '';
        const metadata = icmd.metadata ? seqJsonMetadataToSequence(icmd.metadata) : '';
        let immediateString = `${icmd.stem}${args}${description}`;
        // add a new line if on doesn't exit at the end of the immediateString
        if (!immediateString.endsWith('\n')) {
          immediateString += '\n';
        }
        // Add metadata data if it exists
        immediateString += metadata;
        sequence.push(immediateString);
      }
    }

    // hardware commands
    if (seqJson.hardware_commands) {
      sequence.push(`\n`);
      sequence.push(`@HARDWARE\n`);
      for (const hdw of seqJson.hardware_commands) {
        const description = hdw.description ? seqJsonDescriptionToSequence(hdw.description) : '';
        const metadata = hdw.metadata ? seqJsonMetadataToSequence(hdw.metadata) : '';
        let hardwareString = `${hdw.stem}${description}`;
        // add a new line if on doesn't exit at the end of the immediateString
        if (!hardwareString.endsWith('\n')) {
          hardwareString += '\n';
        }
        // Add metadata data if it exists
        hardwareString += metadata;
        sequence.push(hardwareString);
      }
    }
  }

  return sequence.join('');
}
