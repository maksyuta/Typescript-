import { test, expect } from '@playwright/test';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json"
import { ApiPortalUtils } from '../../../api-method/api-portal/api-methods';
import {MysqlQueries} from '../../../database/queries-mysql';

const TokenProperty = 'access_token';

const companyid = 'd74dc0fe-3756-494e-9b17-36aa72e23fef';
const notAvailableCompanyid = '529daf13-b8c2-4819-978e-f55945fc9bd5';
const invalidCompanyid = ['5642cd244fca6-4780-9408-b06cb413335', null];
const serviceid = '2ce0c4c0-5f6c-11e9-b797-080027653e25';
const invalidServiceid = ['b0d65207-e449-11e9-b634-0242ac11000', null]

test.describe("API Portal. GET Status reqest @skip", () => {
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

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status with valid companyid and serviceid', async ({ }) => {

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, companyid, serviceid);      
    });

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data.serviceId).toBe(serviceid);
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status Comparing response with database ', async ({ }) => {
    const qr = new MysqlQueries;
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getStatus(token, companyid, serviceid);
      });     
  
      await test.step(`Compare statusName from Database and Response API`, async () => {
        const statusNameFromResponse = userProfileResponse.data.statusName;        
        const statusNamesFromQuery = await qr.getLastStatusByServiceid(companyid, serviceid);
        expect(statusNamesFromQuery).toContainEqual({ Name: statusNameFromResponse });
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status with another (not available in the test env.) companyid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, notAvailableCompanyid, serviceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "There are no data for any session shares of the Company " + notAvailableCompanyid + " with the Service " + serviceid + '..';
      expect(userProfileResponse.error.status).toBe(404);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 404);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status with invalid companyid and valid serviceid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, invalidCompanyid[0], serviceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'companyId' validation error. The value '" + invalidCompanyid[0] + "' is not valid.";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status with invalid serviceid and valid companyid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, companyid, invalidServiceid[0]);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'serviceId' validation error. The value '" + invalidServiceid[0] + "' is not valid.";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status without companyid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, invalidCompanyid[1], serviceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'companyId' validation error. The value '" + invalidCompanyid[1] + "' is not valid.";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status without serviceid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, companyid, invalidServiceid[1]);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'serviceId' validation error. The value '" + invalidServiceid[1] + "' is not valid.";
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

  test('Request /api/v1/normalized-data/company/:companyId/data-connection/:serviceId/status with token from user with role SMB Dashboard', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getStatus(token, companyid, serviceid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Access Denied.";
      expect(userProfileResponse.error.status).toBe(403);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 403);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
});
