import * as locationDao from "../daos/location_dao.ts";
import { Location } from "../types.ts";

export const getLocation = async (id: string) => locationDao.findById(id);

export const getAllLocations = async () => locationDao.findAll();

export const addLocation = async (location: Location) => locationDao.insert(location);