import {test, expect} from "vitest";
import * as keyGenerator from "../../../../src/daos/impl/redis/redis_key_generator";

const testSuiteName = 'redis_key_generator';
const expectedKeyPrefix = 'test';

test(`${testSuiteName}: getLocationHashKey`, () => {
  expect(keyGenerator.getLocationHashKey("test")).toBe(`${expectedKeyPrefix}:locations:info:test`);
});

test(`${testSuiteName}: getLocationGeoKey`, () => {
  expect(keyGenerator.getLocationGeoKey()).toBe(`${expectedKeyPrefix}:locations:geo`);
});

test(`${testSuiteName}: getLocationIDsKey`, () => {
  expect(keyGenerator.getLocationIDsKey()).toBe(`${expectedKeyPrefix}:locations:ids`);
});

test(`${testSuiteName}: getUserHashKey`, () => {
  expect(keyGenerator.getUserHashKey("test")).toBe(`${expectedKeyPrefix}:users:info:test`);
})
