import { Workspace } from "@igo2/common/workspace";

/**
 *
 * @param workspace Workspace typé d'IGO FADQ
 * @returns Un Worspace au type plus générique.
 */
export function asWorkspaceObject<E extends object>(
  workspace: Workspace<E>
): Workspace<object> {
  return workspace as unknown as Workspace<object>;
}
