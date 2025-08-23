import { config } from "../../config.ts";

/**
 * Load an implementation of a specified DAO.
 * @param {string} daoName - the name of the DAO to load
 * @returns {Object} - the DAO implemenation for the currently configured database.
 */
export const loadDao = async (daoName: string, dataSource?: string): Promise<any> => {
  const currentDatabase: string = dataSource ? dataSource : config.service.dataStore;
  const module = await import (`./impl/${currentDatabase}/${daoName}_dao_${currentDatabase}_impl.ts`);
  return module;
};
