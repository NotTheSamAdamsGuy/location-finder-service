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
});

test(`${testSuiteName}: getUserIDsKey`, () => {
  expect(keyGenerator.getUserIDsKey()).toBe(`${expectedKeyPrefix}:users:ids`);
});

test(`${testSuiteName}: getTagsKey`, () => {
  expect(keyGenerator.getTagsKey()).toBe(`${expectedKeyPrefix}:tags`);
});
