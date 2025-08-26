import {test, expect} from "vitest";
import * as keyGenerator from "../../../../src/daos/impl/redis/redis_key_generator";

const testSuiteName = 'redis_key_generator';
const expectedKeyPrefix = 'test';

test(`${testSuiteName}: getLocationHashId`, () => {
  expect(keyGenerator.getLocationHashKey("test")).toBe(`${expectedKeyPrefix}:locations:info:test`);
});

test(`${testSuiteName}: getLocationGeoKey`, () => {
  expect(keyGenerator.getLocationGeoKey()).toBe(`${expectedKeyPrefix}:locations:geo`);
});

test(`${testSuiteName}: getLocationIDsKey`, () => {
  expect(keyGenerator.getLocationIDsKey()).toBe(`${expectedKeyPrefix}:locations:ids`);
});
