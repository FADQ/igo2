import { Workspace } from '@igo2/common/workspace';

export function toWorkspace<T extends object>(
  workspace: Workspace<T>
): Workspace<object> {
  return workspace as unknown as Workspace<object>;
}
