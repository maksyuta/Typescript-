import { test, expect } from '@playwright/test';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json"
import { ApiPortalUtils } from '../../../api-method/api-portal/api-methods';
import {MysqlQueries} from '../../../database/queries-mysql';


const TokenProperty = 'access_token';
const serviceid = '2ce0c4c0-5f6c-11e9-b797-080027653e25'
const notAvailableServiceid = '529daf13-b8c2-4819-978e-f55945fc9bd5'
const invalidServiceid = '2ce0c4c0-5f6c-11e9-b797-080027653e2'

test.describe("API Portal. GET Service reqest @skip", () => {
  let apiUtils: ApiUtils;
  let apiPortalUtils: ApiPortalUtils;
  let token: string;
  let response: any
  let userProfileResponse: any;

  test.beforeEach(async () => {
    allure.owner(owner['Serhiy Maksiuta']);
    apiUtils = new ApiUtils();
    apiPortalUtils = new ApiPortalUtils();
    const email = config.EMAIL;
    const password = config.PASSWORD;

    await test.step(`LOGIN`, async () => {
      response = await apiUtils.postAuthServiceLogin(email, password);
    });

    await test.step(`CHECKING that the login was correct`, async () => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty(TokenProperty);
      expect(response.data.access_token).not.toBeNull();
      expect(response.data.access_token).not.toBeUndefined();
    });

    await test.step(`TAKE token`, async () => {
      token = response.data.access_token;
    });

    return { apiUtils, token, response, userProfileResponse };
  });

  test('Request /api/v1/normalized-data/services/:serviceid Comparing response with database ', async ({ }) => {
    const qr = new MysqlQueries;
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getService(token, serviceid);
      });     
  
      await test.step(`Compare statusName from Database and Response API`, async () => {
        const serviceNameFromResponse = userProfileResponse.data.name;
        const serviceNameFromQuery = await qr.getServiceDescriptionByServiceId(serviceid);
        expect(serviceNameFromQuery).toContainEqual({ name: serviceNameFromResponse });
    });
  });

  test('Request /api/v1/normalized-data/services/:serviceid with valid serviceid', async ({ }) => {
   
    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getService(token, serviceid);      
    });

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data.id).toBe(serviceid)
    });
  });

  test('Request /api/v1/normalized-data/services/:serviceid with not available serviceid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {      
        userProfileResponse = await apiPortalUtils.getService(token, notAvailableServiceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "There are no data for the Service with the id '" + notAvailableServiceid + "'.";
      expect(userProfileResponse.error.status).toBe(404);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 404);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/services/:serviceid with invalid serviceid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getService(token, invalidServiceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'serviceId' validation error. The value '" + invalidServiceid + "' is not valid.";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
})

test.describe("CHECK request without rights to response", () => {
  let apiUtils: ApiUtils;
  let apiPortalUtils: ApiPortalUtils;
  let token: string;
  let response: any;
  let userProfileResponse: any;

  test.beforeEach(async () => {
    allure.owner(owner['Serhiy Maksiuta']);
    apiUtils = new ApiUtils();
    apiPortalUtils = new ApiPortalUtils();
    const email = 'test_wave@test.com';
    const password = 'Redirect_123';

    await test.step(`LOGIN`, async () => {
      response = await apiUtils.postAuthServiceLogin(email, password);
    });

    await test.step(`CHECKING that the login was correct`, async () => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty(TokenProperty);
      expect(response.data.access_token).not.toBeNull();
      expect(response.data.access_token).not.toBeUndefined();
    });

    await test.step(`TAKE token`, async () => {
      token = response.data.access_token;
    });
  });
  
  test('Request /api/v1/normalized-data/services/:serviceid with token from user with role SMB Dashboard', async ({ }) => {
   let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getService(token, serviceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Access Denied.";
      expect(userProfileResponse.error.status).toBe(403);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 403);      
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
})
